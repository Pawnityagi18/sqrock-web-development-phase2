import Razorpay from 'razorpay';

export const isRazorpayConfigured = Boolean(
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET &&
  process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_')
);

if (!isRazorpayConfigured) {
  console.warn('⚠️  Missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET — payment routes will fail until they are set in .env (use test-mode rzp_test_... keys from https://dashboard.razorpay.com/app/keys).');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder'
});

export default razorpay;
