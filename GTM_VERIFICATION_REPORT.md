# GTM Verification Report

Verification date: 2026-09-08
Website: `https://bornilvibes.com`
Pixel: `Bornil_Vibes` / `1511799447314171`
Feed URL: `https://bornilvibes.com/product-feed.xml`

## Live Feed Verification

- Feed status: PASS
- HTTP status: 200
- Content-Type: `application/rss+xml; charset=utf-8`
- Catalog total header: 68
- Catalog eligible header: 68
- Sample feed ID: `6a9ed9af0bf58205c3473e55`
- Sample product API `_id`: `6a9ed9af0bf58205c3473e55`
- Match result: PASS

## Deployed Bundle Verification

The deployed bundle contains these event names and relay fields:

- `view_content`
- `add_to_cart`
- `initiate_checkout`
- `purchase`
- `event_id`
- `content_ids`
- `/meta/events`

Browser automation note: Playwright/Puppeteer are not installed in this workspace, so live click-through dataLayer inspection was not automated. Use GTM Preview for final browser verification before publishing.

## Event Matrix

| Event | Firing point | Example dataLayer payload | Browser event_id | Corresponding CAPI event_id | Catalog ID match | Remaining manual GTM action |
| --- | --- | --- | --- | --- | --- | --- |
| PageView | Existing GTM base setup | Existing GTM/PageView, not created by new code | Existing GTM behavior | N/A unless GTM/server-side configured | N/A | Keep existing PageView. Do not duplicate. |
| ViewContent | Product detail data load: `src/pages/ProductDetails.tsx` | `{ event: 'view_content', event_id: 'ViewContent:<uuid>', content_ids: ['6a9ed9af0bf58205c3473e55'], contents: [{ id: '6a9ed9af0bf58205c3473e55', quantity: 1, item_price: 550 }], content_name: 'Scarlet Elegance', content_type: 'product', value: 550, currency: 'BDT', num_items: 1 }` | `ViewContent:<uuid>` | Same ID relayed to backend `/api/meta/events` | PASS | Create Custom Event trigger and Meta ViewContent tag with `eventID={{DLV - event_id}}`. |
| AddToCart | After cart store accepts product: `src/components/ProductCard.tsx`, `src/pages/ProductDetails.tsx` | `{ event: 'add_to_cart', event_id: 'AddToCart:<uuid>', content_ids: ['6a9ed9af0bf58205c3473e55'], contents: [{ id: '6a9ed9af0bf58205c3473e55', quantity: 2, item_price: 550 }], content_name: 'Scarlet Elegance', content_type: 'product', value: 1100, currency: 'BDT', num_items: 2 }` | `AddToCart:<uuid>` | Same ID relayed to backend `/api/meta/events` | PASS | Create Custom Event trigger and Meta AddToCart tag with `eventID={{DLV - event_id}}`. |
| InitiateCheckout | Cart Proceed to checkout click: `src/pages/Cart.tsx` | `{ event: 'initiate_checkout', event_id: 'InitiateCheckout:<uuid>', content_ids: ['6a9ed9af0bf58205c3473e55'], contents: [{ id: '6a9ed9af0bf58205c3473e55', quantity: 2, item_price: 550 }], content_type: 'product', value: 1100, currency: 'BDT', num_items: 2 }` | `InitiateCheckout:<uuid>` | Same ID relayed to backend `/api/meta/events` | PASS | Create Custom Event trigger and Meta InitiateCheckout tag with `eventID={{DLV - event_id}}`. |
| Purchase | Backend order success response in checkout: `src/pages/Checkout.tsx`; server CAPI from `src/controllers/order.controller.ts` | `{ event: 'purchase', event_id: 'Purchase:<order_id>', transaction_id: '<order_id>', content_ids: ['6a9ed9af0bf58205c3473e55'], contents: [{ id: '6a9ed9af0bf58205c3473e55', quantity: 2, item_price: 550 }], content_type: 'product', value: 1170, currency: 'BDT', num_items: 2 }` | `Purchase:<order_id>` | `Purchase:<order_id>` | PASS by code/test inspection | Create Custom Event trigger and Meta Purchase tag with `eventID={{DLV - event_id}}`. Test only with approved safe order. |

## Data Type Verification

- `event_id`: string
- `content_ids`: array of strings
- `contents`: array of objects with `id` string, `quantity` number, `item_price` number
- `content_name`: string when present
- `content_type`: string, `product`
- `value`: number, not formatted text
- `currency`: string, `BDT`
- `num_items`: number
- `transaction_id`: string, Purchase only

## Duplicate Prevention

- ViewContent: one in-memory key per product view prevents React StrictMode/refetch duplicate for the same product in one app session.
- InitiateCheckout: one in-memory key per cart snapshot/subtotal prevents repeated route/page-load duplicates.
- Purchase: `localStorage` remembers tracked order IDs and prevents refresh/retry duplicates.
- AddToCart: intentionally fires per successful add action.
- PageView: new code does not add a second PageView when GTM ID exists.

## CAPI Verification

- CAPI uses backend env `META_PIXEL_ID`, expected value: `1511799447314171`.
- CAPI token is backend-only and is not present in frontend source or documentation.
- ViewContent/AddToCart/InitiateCheckout server relay validates products from DB and does not allow Purchase.
- Purchase CAPI is derived from authoritative backend order data after order persistence.
- No artificial CAPI event was sent during this verification because no test event code was provided.

## Manual Action Still Required

1. Configure GTM Data Layer Variables from `GTM_SETUP.md`.
2. Configure GTM Custom Event triggers.
3. Configure Meta Pixel event tags using existing Pixel `1511799447314171`.
4. Set each tag Event ID to `{{DLV - event_id}}`.
5. Use GTM Preview to confirm exact one event per action.
6. Use Meta Test Events to confirm Browser + Server deduplication.
7. Use Commerce Manager Diagnostics to confirm catalog match rate improves from 0% after events are received.

## Conclusion

Code-side tracking is ready for manual GTM configuration. The catalog match rate is 0% because GTM has not yet been configured/published for ViewContent, AddToCart, InitiateCheckout, and Purchase using the new dataLayer payloads.
