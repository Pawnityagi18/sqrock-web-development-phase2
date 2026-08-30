import express from 'express';
import crypto from 'crypto';
import razorpay from '../config/razorpay.js';
import User from '../models/User.js';
import Contract from '../models/Contract.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { createNotification } from './notificationRoutes.js';

const router = express.Router();

// ---- Freelancer payout onboarding (Razorpay Route Linked Account) ----
//
// Unlike Stripe Connect, Razorpay Route does not have a hosted onboarding redirect —
// the platform collects the freelancer's bank/business details directly and creates
// the Linked Account via API. This endpoint expects that info from a frontend form.
router.post('/connect/onboarding', protect, requireRole('freelancer'), async (req, res) => {
  try {
    const { name, email, phone, businessName, accountNumber, ifscCode, beneficiaryName } = req.body;
    if (!name || !email || !phone || !accountNumber || !ifscCode || !beneficiaryName) {
      return res.status(400).json({ success: false, message: 'Name, email, phone, account number, IFSC code, and beneficiary name are all required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const account = await razorpay.accounts.create({
      email,
      phone,
      type: 'route',
      legal_business_name: businessName || name,
      business_type: 'individual',
      contact_name: name,
      profile: {
        category: 'other',
        subcategory: 'other',
        addresses: {
          registered: {
            street1: 'NA',
            street2: 'NA',
            city: 'NA',
            state: 'NA',
            postal_code: '000000',
            country: 'IN'
          }
        }
      },
      legal_info: {
        pan: 'AAACL1234C' // placeholder — real PAN required for live mode, test mode accepts dummy values
      }
    });

    // Attach bank account details for settlement (stakeholder-level in real Route setup;
    // simplified here for test mode — see README note on production hardening needed).
    user.razorpayAccountId = account.id;
    user.razorpayOnboardingComplete = true; // test mode accounts are usable immediately
    await user.save();

    res.json({ success: true, accountId: account.id, message: 'Payout account created. You can now receive released milestone funds.' });
  } catch (error) {
    const message = error?.error?.description || error.message || 'Could not create payout account.';
    res.status(500).json({ success: false, message });
  }
});

// GET /api/payments/connect/status
router.get('/connect/status', protect, requireRole('freelancer'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      onboardingComplete: Boolean(user?.razorpayOnboardingComplete),
      accountId: user?.razorpayAccountId || null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---- Milestone funding (client pays into escrow) ----

// POST /api/payments/contracts/:contractId/milestones/:milestoneId/checkout
// Creates a Razorpay Order. Funds captured against this order sit on the PLATFORM's
// Razorpay balance until explicitly transferred to the freelancer's Linked Account
// at release time (see contractRoutes.js /release) — this is the escrow hold.
router.post('/contracts/:contractId/milestones/:milestoneId/checkout', protect, requireRole('client'), async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });
    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not own this contract.' });
    }

    const milestone = contract.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found.' });
    if (milestone.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Milestone is already ${milestone.status}.` });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(milestone.amount * 100), // paise
      currency: 'INR',
      receipt: `milestone_${milestone._id}`,
      notes: {
        contractId: contract._id.toString(),
        milestoneId: milestone._id.toString()
      }
    });

    milestone.razorpayOrderId = order.id;
    await contract.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    const message = error?.error?.description || error.message || 'Could not create payment order.';
    res.status(500).json({ success: false, message });
  }
});

// POST /api/payments/verify — called by the frontend right after Razorpay Checkout's
// success handler fires. Verifies the signature so a client can't fake a successful
// payment; the webhook below is the fully authoritative path for production.
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
    }

    const funded = await markMilestoneFundedByOrderId(razorpay_order_id, razorpay_payment_id);
    res.json({ success: true, funded });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

async function markMilestoneFundedByOrderId(orderId, paymentId) {
  const contract = await Contract.findOne({ 'milestones.razorpayOrderId': orderId });
  if (!contract) return false;
  const milestone = contract.milestones.find(m => m.razorpayOrderId === orderId);
  if (!milestone || milestone.status !== 'pending') return false;

  milestone.status = 'funded';
  milestone.razorpayPaymentId = paymentId;
  milestone.fundedAt = new Date();
  await contract.save();

  await createNotification(
    contract.freelancer,
    'milestone_funded',
    `Milestone "${milestone.title}" has been funded — you can start work.`,
    '/dashboard?tab=contracts'
  );

  return true;
}

// ---- Webhook (authoritative funding confirmation) ----
// Mounted with express.raw() in server/index.js BEFORE the global express.json()
// middleware — Razorpay signature verification needs the raw, unparsed body.
export async function handleRazorpayWebhook(req, res) {
  const signature = req.headers['x-razorpay-signature'];
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.body) // raw Buffer
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('⚠️  Razorpay webhook signature verification failed.');
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    if (payment.order_id) {
      await markMilestoneFundedByOrderId(payment.order_id, payment.id);
    }
  }

  res.json({ received: true });
}

export default router;
