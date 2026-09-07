# GTM Setup for Bornil Vibes

Use this document to configure the existing GTM container for the existing Bornil Vibes Pixel/Dataset.

- Website: `https://bornilvibes.com`
- Existing Pixel name: `Bornil_Vibes`
- Existing Pixel ID: `1511799447314171`
- Existing catalog feed: `https://bornilvibes.com/product-feed.xml`
- Current feed count verified: 68 eligible products

Do not create another GTM container, Pixel base tag, or PageView tag if the existing PageView is already firing.

## Existing Code Behavior

The storefront loads GTM from the admin-saved GTM ID in `src/components/TrackingScripts.tsx`.

When a GTM ID exists, direct Meta Pixel and direct GA4 fallback snippets are not loaded from app source code. This prevents duplicate PageView/base Pixel risk.

Commerce events are pushed as top-level objects to `window.dataLayer` from `src/utils/analytics.ts`.

## Meta Product ID Strategy

Use the MongoDB product `_id` string everywhere.

Example live catalog product:

```text
6a9ed9af0bf58205c3473e55
```

This same value appears as:

- Feed `g:id`
- Product URL `/products/6a9ed9af0bf58205c3473e55`
- Product API `_id`
- Pixel `content_ids[0]`
- Pixel `contents[0].id`
- CAPI `custom_data.content_ids[0]`
- CAPI `custom_data.contents[0].id`

## Exact Data Layer Variables

Create these GTM Data Layer Variables with Version 2 enabled.

| GTM variable name | Data Layer Variable Name | Type expected |
| --- | --- | --- |
| `DLV - event_id` | `event_id` | string |
| `DLV - content_ids` | `content_ids` | array of strings |
| `DLV - contents` | `contents` | array of objects |
| `DLV - content_name` | `content_name` | string; only on product-specific events |
| `DLV - content_type` | `content_type` | string, always `product` |
| `DLV - value` | `value` | number |
| `DLV - currency` | `currency` | string, always `BDT` |
| `DLV - num_items` | `num_items` | number |
| `DLV - transaction_id` | `transaction_id` | string; Purchase only |

## Exact Custom Event Triggers

Create these GTM Custom Event triggers.

| Trigger name | Custom event name |
| --- | --- |
| `CE - view_content` | `view_content` |
| `CE - add_to_cart` | `add_to_cart` |
| `CE - initiate_checkout` | `initiate_checkout` |
| `CE - purchase` | `purchase` |

## Exact Data Layer Payloads

### ViewContent

Fires after a product detail page loads valid product data.

```js
{
  event: 'view_content',
  event_id: 'ViewContent:<uuid>',
  content_ids: ['6a9ed9af0bf58205c3473e55'],
  contents: [
    { id: '6a9ed9af0bf58205c3473e55', quantity: 1, item_price: 550 }
  ],
  content_name: 'Scarlet Elegance',
  content_type: 'product',
  value: 550,
  currency: 'BDT',
  num_items: 1
}
```

### AddToCart

Fires only after the cart store accepts the item.

```js
{
  event: 'add_to_cart',
  event_id: 'AddToCart:<uuid>',
  content_ids: ['6a9ed9af0bf58205c3473e55'],
  contents: [
    { id: '6a9ed9af0bf58205c3473e55', quantity: 2, item_price: 550 }
  ],
  content_name: 'Scarlet Elegance',
  content_type: 'product',
  value: 1100,
  currency: 'BDT',
  num_items: 2
}
```

### InitiateCheckout

Fires when the user clicks Proceed to checkout from cart. It does not fire on cart page load or checkout page load.

```js
{
  event: 'initiate_checkout',
  event_id: 'InitiateCheckout:<uuid>',
  content_ids: ['6a9ed9af0bf58205c3473e55'],
  contents: [
    { id: '6a9ed9af0bf58205c3473e55', quantity: 2, item_price: 550 }
  ],
  content_type: 'product',
  value: 1100,
  currency: 'BDT',
  num_items: 2
}
```

### Purchase

Fires only after the backend successfully creates the COD order. Do not trigger Purchase from button clicks.

```js
{
  event: 'purchase',
  event_id: 'Purchase:<order_id>',
  transaction_id: '<order_id>',
  content_ids: ['6a9ed9af0bf58205c3473e55'],
  contents: [
    { id: '6a9ed9af0bf58205c3473e55', quantity: 2, item_price: 550 }
  ],
  content_type: 'product',
  value: 1170,
  currency: 'BDT',
  num_items: 2
}
```

For Purchase, `value` is the confirmed order total from the backend response. In the example above, `1100 + 70 inside Dhaka delivery = 1170`.

## Meta Pixel Tags

Use the existing Pixel/Dataset ID: `1511799447314171`.

Create one Meta Pixel event tag for each Custom Event trigger.

| GTM trigger | Meta Pixel event | Parameters |
| --- | --- | --- |
| `CE - view_content` | `ViewContent` | `content_ids`, `contents`, `content_name`, `content_type`, `value`, `currency` |
| `CE - add_to_cart` | `AddToCart` | `content_ids`, `contents`, `content_name`, `content_type`, `value`, `currency`, `num_items` |
| `CE - initiate_checkout` | `InitiateCheckout` | `content_ids`, `contents`, `content_type`, `value`, `currency`, `num_items` |
| `CE - purchase` | `Purchase` | `content_ids`, `contents`, `content_type`, `value`, `currency`, `num_items`, `transaction_id` |

## Event ID / Deduplication

Every Meta Pixel event tag must pass:

```text
eventID = {{DLV - event_id}}
```

This is required for Browser Pixel and CAPI deduplication.

Expected matching:

| Event | Browser Pixel eventID | Backend CAPI event_id |
| --- | --- | --- |
| ViewContent | `{{DLV - event_id}}` | same event ID relayed to `/api/meta/events` |
| AddToCart | `{{DLV - event_id}}` | same event ID relayed to `/api/meta/events` |
| InitiateCheckout | `{{DLV - event_id}}` | same event ID relayed to `/api/meta/events` |
| Purchase | `Purchase:<order_id>` | `Purchase:<order_id>` from backend order creation |

If the GTM Meta Pixel template has an Event ID field, use that field.

If the template does not support Event ID, use a Custom HTML event tag that calls `fbq('track', eventName, params, { eventID: eventId })`. Keep the existing base Pixel/PageView tag unchanged.

## GTM Preview Testing

1. Open GTM Preview for `https://bornilvibes.com`.
2. Visit a product page, for example `/products/6a9ed9af0bf58205c3473e55`.
3. Confirm one `view_content` dataLayer event.
4. Confirm the ViewContent Pixel tag fires once.
5. Confirm `content_ids[0]` equals the catalog `g:id`.
6. Click Add to cart.
7. Confirm one `add_to_cart` event and one AddToCart Pixel tag.
8. Go to cart and click Proceed to checkout.
9. Confirm one `initiate_checkout` event and one InitiateCheckout Pixel tag.
10. Do not submit a real production order just to test Purchase.
11. For Purchase, use a safe test order only if the business has approved it.

## Meta Test Events Verification

In Meta Events Manager > Test Events:

1. Confirm PageView still arrives once from the existing GTM base setup.
2. Confirm ViewContent arrives with `content_ids` matching a catalog item.
3. Confirm AddToCart arrives with matching `content_ids`.
4. Confirm InitiateCheckout arrives with matching `content_ids`.
5. Confirm Purchase only after a real accepted COD order or approved safe test order.
6. Confirm Browser and Server events show deduplicated status when both are received.
7. Confirm no duplicate PageView and no duplicate Purchase.

## Catalog Match Verification

Open Commerce Manager catalog item IDs and compare them with event `content_ids`.

Expected:

```text
Catalog item id: 6a9ed9af0bf58205c3473e55
ViewContent content_ids: ["6a9ed9af0bf58205c3473e55"]
AddToCart content_ids: ["6a9ed9af0bf58205c3473e55"]
InitiateCheckout content_ids includes: "6a9ed9af0bf58205c3473e55"
Purchase content_ids includes: "6a9ed9af0bf58205c3473e55"
```
