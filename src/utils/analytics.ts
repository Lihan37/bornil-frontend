import { API_BASE_URL } from '../services/api';
import type { CartItem, Order, OrderItem, Product } from '../types';

const CURRENCY = 'BDT';
const PURCHASE_STORAGE_KEY = 'bornil-vibes-tracked-purchases';

type MetaEventName = 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase';

type MetaContent = {
  id: string;
  quantity: number;
  item_price: number;
};

type MetaPayload = {
  event: 'view_content' | 'add_to_cart' | 'initiate_checkout' | 'purchase';
  event_id: string;
  content_ids: string[];
  contents: MetaContent[];
  content_name?: string;
  content_type: 'product';
  value: number;
  currency: 'BDT';
  num_items?: number;
  transaction_id?: string;
};

export type BrowserTrackingContext = {
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const dataLayerEventName: Record<MetaEventName, MetaPayload['event']> = {
  ViewContent: 'view_content',
  AddToCart: 'add_to_cart',
  InitiateCheckout: 'initiate_checkout',
  Purchase: 'purchase',
};

const firedOnceKeys = new Set<string>();

export function metaProductId(productOrItem: Pick<Product, '_id'> | Pick<OrderItem, 'productId'>) {
  return 'productId' in productOrItem ? String(productOrItem.productId) : String(productOrItem._id);
}

function eventId(eventName: MetaEventName) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${eventName}:${crypto.randomUUID()}`;
  }
  return `${eventName}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

function productContent(product: Product, quantity = 1): MetaContent {
  return {
    id: metaProductId(product),
    quantity,
    item_price: product.price,
  };
}

function cartContent(items: CartItem[]): MetaContent[] {
  return items.map(({ product, quantity }) => productContent(product, quantity));
}

function orderContent(items: OrderItem[]): MetaContent[] {
  return items.map((item) => ({
    id: metaProductId(item),
    quantity: item.quantity,
    item_price: item.price,
  }));
}

function totalQuantity(contents: MetaContent[]) {
  return contents.reduce((sum, item) => sum + item.quantity, 0);
}

function pushDataLayer(payload: MetaPayload) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

function readCookie(name: string) {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function getBrowserTrackingContext(): BrowserTrackingContext {
  if (typeof window === 'undefined') return {};
  return {
    fbp: readCookie('_fbp'),
    fbc: readCookie('_fbc'),
    eventSourceUrl: window.location.href,
  };
}

function relayServerEvent(eventName: Exclude<MetaEventName, 'Purchase'>, payload: MetaPayload) {
  const tracking = getBrowserTrackingContext();
  void fetch(API_BASE_URL + '/meta/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName,
      eventId: payload.event_id,
      items: payload.contents.map((item) => ({ productId: item.id, quantity: item.quantity })),
      fbp: tracking.fbp,
      fbc: tracking.fbc,
      eventSourceUrl: tracking.eventSourceUrl,
    }),
  }).catch(() => {
    // Tracking must never break shopping behavior.
  });
}

function pushAndRelay(eventName: Exclude<MetaEventName, 'Purchase'>, payload: Omit<MetaPayload, 'event' | 'event_id'>, onceKey?: string) {
  if (onceKey) {
    if (firedOnceKeys.has(onceKey)) return;
    firedOnceKeys.add(onceKey);
  }

  const fullPayload: MetaPayload = {
    ...payload,
    event: dataLayerEventName[eventName],
    event_id: eventId(eventName),
  };

  pushDataLayer(fullPayload);
  relayServerEvent(eventName, fullPayload);
}

export function trackViewContent(product: Product) {
  const contents = [productContent(product, 1)];
  pushAndRelay(
    'ViewContent',
    {
      content_ids: contents.map((item) => item.id),
      contents,
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: CURRENCY,
      num_items: 1,
    },
    `view_content:${metaProductId(product)}`,
  );
}

export function trackAddToCart(product: Product, quantity = 1) {
  const safeQuantity = Math.max(1, quantity);
  const contents = [productContent(product, safeQuantity)];
  pushAndRelay('AddToCart', {
    content_ids: contents.map((item) => item.id),
    contents,
    content_name: product.name,
    content_type: 'product',
    value: product.price * safeQuantity,
    currency: CURRENCY,
    num_items: safeQuantity,
  });
}

export function trackInitiateCheckout(items: CartItem[], subtotal: number) {
  if (!items.length) return;
  const contents = cartContent(items);
  const onceKey = `initiate_checkout:${contents.map((item) => `${item.id}:${item.quantity}`).join('|')}:${subtotal}`;
  pushAndRelay(
    'InitiateCheckout',
    {
      content_ids: contents.map((item) => item.id),
      contents,
      content_type: 'product',
      value: subtotal,
      currency: CURRENCY,
      num_items: totalQuantity(contents),
    },
    onceKey,
  );
}

function trackedPurchases() {
  if (typeof localStorage === 'undefined') return new Set<string>();
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(PURCHASE_STORAGE_KEY) || '[]'));
  } catch {
    return new Set<string>();
  }
}

function rememberPurchase(orderId: string) {
  if (typeof localStorage === 'undefined') return;
  const purchases = trackedPurchases();
  purchases.add(orderId);
  localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify([...purchases].slice(-100)));
}

export function trackPurchaseOrder(order: Order) {
  if (!order?._id || !order.items?.length) return;
  const purchases = trackedPurchases();
  if (purchases.has(order._id)) return;

  const contents = orderContent(order.items);
  const payload: MetaPayload = {
    event: dataLayerEventName.Purchase,
    event_id: `Purchase:${order._id}`,
    transaction_id: order._id,
    content_ids: contents.map((item) => item.id),
    contents,
    content_type: 'product',
    value: order.totalAmount,
    currency: CURRENCY,
    num_items: totalQuantity(contents),
  };

  pushDataLayer(payload);
  rememberPurchase(order._id);
}

export const trackViewItem = trackViewContent;
export const trackBeginCheckout = trackInitiateCheckout;

export function trackPurchase(items: CartItem[], value: number, transactionId?: string) {
  if (!transactionId || !items.length) return;
  trackPurchaseOrder({
    _id: transactionId,
    customerName: '',
    phone: '',
    address: '',
    paymentMethod: 'cash_on_delivery',
    items: items.map(({ product, quantity }) => ({
      productId: metaProductId(product),
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url,
      quantity,
      price: product.price,
    })),
    totalAmount: value,
    orderStatus: 'pending',
    createdAt: '',
    updatedAt: '',
  });
}
