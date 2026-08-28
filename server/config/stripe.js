import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  Missing STRIPE_SECRET_KEY — payment routes will fail until it is set in .env (use a test-mode sk_test_... key).');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20'
});

export default stripe;
