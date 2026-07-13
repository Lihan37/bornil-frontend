import type { CartItem, Product } from '../types';

/**
 * Lightweight analytics layer for the storefront.
 *
 * Every event is pushed to two places so the client can track however they like:
 *   1. window.dataLayer  -> pick it up in Google Tag Manager (GTM-N8VZ57LJ) and
 *      build tags/triggers for GA4, Meta, TikTok, etc. without touching code.
 *   2. window.fbq        -> fires the matching Meta (Facebook) Pixel standard event
 *      directly, so the Pixel works even without any GTM setup.
 *
 * GA4-style ecommerce schema is used for the dataLayer so GTM's built-in
 * "Google Analytics: GA4 Event" tags map 1:1 with no extra config.
 */

const CURRENCY = 'BDT';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
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

function fbqTrack(event: string, payload: Record<string, unknown>) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq('track', event, payload);
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

/** Product page viewed. GA4: view_item · Meta: ViewContent */
export function trackViewItem(product: Product) {
  pushEcommerce('view_item', { currency: CURRENCY, value: product.price, items: [toItem(product)] });
  fbqTrack('ViewContent', {
    content_ids: [product._id],
    content_name: product.name,
    content_category: product.category,
    content_type: 'product',
    value: product.price,
    currency: CURRENCY,
  });
}

/** Item added to cart. GA4: add_to_cart · Meta: AddToCart */
export function trackAddToCart(product: Product, quantity = 1) {
  const value = product.price * quantity;
  pushEcommerce('add_to_cart', { currency: CURRENCY, value, items: [toItem(product, quantity)] });
  fbqTrack('AddToCart', {
    content_ids: [product._id],
    content_name: product.name,
    content_type: 'product',
    value,
    currency: CURRENCY,
  });
}

/** Checkout started. GA4: begin_checkout · Meta: InitiateCheckout */
export function trackBeginCheckout(items: CartItem[], value: number) {
  pushEcommerce('begin_checkout', {
    currency: CURRENCY,
    value,
    items: items.map(({ product, quantity }) => toItem(product, quantity)),
  });
  fbqTrack('InitiateCheckout', {
    content_ids: items.map(({ product }) => product._id),
    content_type: 'product',
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    value,
    currency: CURRENCY,
  });
}

/** Order placed successfully. GA4: purchase · Meta: Purchase */
export function trackPurchase(items: CartItem[], value: number, transactionId?: string) {
  pushEcommerce('purchase', {
    transaction_id: transactionId,
    currency: CURRENCY,
    value,
    items: items.map(({ product, quantity }) => toItem(product, quantity)),
  });
  fbqTrack('Purchase', {
    content_ids: items.map(({ product }) => product._id),
    content_type: 'product',
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    value,
    currency: CURRENCY,
  });
}
