import Stripe from 'stripe'

let stripeSingleton: Stripe | null = null

/** Lazily-instantiated server-side Stripe client. */
export function getStripe(): Stripe {
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      // Use the SDK's pinned API version to stay in sync with the typings.
      typescript: true,
    })
  }
  return stripeSingleton
}

export const COACHING_TIERS = {
  private: {
    name: '1-on-1 Private',
    priceEnv: 'STRIPE_PRICE_PRIVATE',
    priceRange: '$750–$1,000/mo',
  },
  semi_private: {
    name: 'Semi-Private Group',
    priceEnv: 'STRIPE_PRICE_SEMI_PRIVATE',
    priceRange: '$500–$600/mo',
  },
} as const
