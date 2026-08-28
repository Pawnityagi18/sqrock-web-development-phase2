import express from 'express';
import stripe from '../config/stripe.js';
import User from '../models/User.js';
import Contract from '../models/Contract.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { createNotification } from './notificationRoutes.js';

const router = express.Router();

function getFrontendUrl(req) {
  return process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
}

// ---- Stripe Connect onboarding (freelancer payouts) ----

// POST /api/payments/connect/onboarding — creates (or reuses) an Express account
// for the freelancer and returns a Stripe-hosted onboarding link.
router.post('/connect/onboarding', protect, requireRole('freelancer'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (!user.stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: { transfers: { requested: true } }
      });
      user.stripeAccountId = account.id;
      await user.save();
    }

    const frontendUrl = getFrontendUrl(req);
    const accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: `${frontendUrl}/?stripe=refresh`,
      return_url: `${frontendUrl}/?stripe=onboarded`,
      type: 'account_onboarding'
    });

    res.json({ success: true, url: accountLink.url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/payments/connect/status — checks whether the freelancer can actually receive payouts yet.
router.get('/connect/status', protect, requireRole('freelancer'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user?.stripeAccountId) {
      return res.json({ success: true, onboardingComplete: false, chargesEnabled: false });
    }

    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    const onboardingComplete = Boolean(account.details_submitted && account.charges_enabled);

    if (onboardingComplete !== user.stripeOnboardingComplete) {
      user.stripeOnboardingComplete = onboardingComplete;
      await user.save();
    }

    res.json({
      success: true,
      onboardingComplete,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---- Milestone funding (client pays into escrow) ----

// POST /api/payments/contracts/:contractId/milestones/:milestoneId/checkout
// Replaces the old "instant fund" stub: this actually charges the client via Stripe
// Checkout. Funds land on the PLATFORM's Stripe balance and stay there — the
// milestone is only marked 'funded' once payment is confirmed (via webhook, or the
// verify-session fallback below), never on this call itself.
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

    const frontendUrl = getFrontendUrl(req);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Milestone: ${milestone.title}` },
          unit_amount: Math.round(milestone.amount * 100)
        },
        quantity: 1
      }],
      metadata: {
        contractId: contract._id.toString(),
        milestoneId: milestone._id.toString()
      },
      success_url: `${frontendUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/?payment=cancelled`
    });

    milestone.stripeCheckoutSessionId = session.id;
    await contract.save();

    res.json({ success: true, url: session.url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/payments/verify-session?session_id=... — fallback confirmation for local dev
// where Stripe webhooks can't reach localhost. The webhook below is authoritative in
// production; this lets the UI reflect a successful payment immediately on return.
router.get('/verify-session', protect, async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ success: false, message: 'session_id is required.' });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      return res.json({ success: true, funded: false });
    }

    const funded = await markMilestoneFunded(session.metadata.contractId, session.metadata.milestoneId, session.payment_intent);
    res.json({ success: true, funded });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

async function markMilestoneFunded(contractId, milestoneId, paymentIntentId) {
  const contract = await Contract.findById(contractId);
  if (!contract) return false;
  const milestone = contract.milestones.id(milestoneId);
  if (!milestone || milestone.status !== 'pending') return false;

  milestone.status = 'funded';
  milestone.stripePaymentIntentId = paymentIntentId;
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
// middleware — Stripe signature verification needs the raw, unparsed body.
export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('⚠️  Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (session.payment_status === 'paid' && session.metadata?.contractId && session.metadata?.milestoneId) {
      await markMilestoneFunded(session.metadata.contractId, session.metadata.milestoneId, session.payment_intent);
    }
  }

  res.json({ received: true });
}

export default router;
