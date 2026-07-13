import type { CartItem, Product } from '../types';

/**
 * Storefront analytics — pushes standard ecommerce events to window.dataLayer
 * (GA4 schema). Google Tag Manager is the single source of truth: the client
 * builds tags/triggers in GTM on these events to fire Meta Pixel, GA4, TikTok,
 * etc. We intentionally do NOT fire the Pixel directly here, so events are never
 * double-counted when GTM also has tags for them.
 *
 * dataLayer events: view_item, add_to_cart, begin_checkout, purchase.
 */

const CURRENCY = 'BDT';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

function pushEcommerce(event: string, ecommerce: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  // Clear the previous ecommerce object first (GA4 best practice) so values
  // from an earlier event don't leak into this one.
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event, ecommerce });
}

function toItem(product: Product, quantity = 1) {
  return {
    item_id: product._id,
    item_name: product.name,
    item_category: product.category,
    price: product.price,
    quantity,
  };
}

/** Product page viewed. GA4: view_item (Meta: ViewContent via GTM). */
export function trackViewItem(product: Product) {
  pushEcommerce('view_item', { currency: CURRENCY, value: product.price, items: [toItem(product)] });
}

/** Item added to cart. GA4: add_to_cart (Meta: AddToCart via GTM). */
export function trackAddToCart(product: Product, quantity = 1) {
  pushEcommerce('add_to_cart', {
    currency: CURRENCY,
    value: product.price * quantity,
    items: [toItem(product, quantity)],
  });
}

/** Checkout started. GA4: begin_checkout (Meta: InitiateCheckout via GTM). */
export function trackBeginCheckout(items: CartItem[], value: number) {
  pushEcommerce('begin_checkout', {
    currency: CURRENCY,
    value,
    items: items.map(({ product, quantity }) => toItem(product, quantity)),
  });
}

/** Order placed successfully. GA4: purchase (Meta: Purchase via GTM). */
export function trackPurchase(items: CartItem[], value: number, transactionId?: string) {
  pushEcommerce('purchase', {
    transaction_id: transactionId,
    currency: CURRENCY,
    value,
    items: items.map(({ product, quantity }) => toItem(product, quantity)),
  });
}
