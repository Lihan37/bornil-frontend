# GTM Setup for Bornil Vibes

This project loads tracking settings from the backend and injects Google Tag Manager from `src/components/TrackingScripts.tsx`.

## Existing Setup

- GTM loads from the admin-saved `gtmId` returned by `GET /api/settings`.
- Direct Meta Pixel and GA4 snippets are only fallback paths when no GTM ID is configured.
- Do not add another GTM container.
- Do not add another Meta Pixel base tag if the current GTM Pixel base/PageView tag is already working.
- The app pushes ecommerce events to `window.dataLayer` from `src/utils/analytics.ts`.

## Data Layer Events

Create Custom Event triggers for these exact event names:

1. `view_content`
2. `add_to_cart`
3. `initiate_checkout`
4. `purchase`

## Data Layer Variables

Create these Data Layer Variables with the exact variable names:

| GTM variable | Data Layer Variable Name |
| --- | --- |
| DLV - event_id | `event_id` |
| DLV - content_ids | `content_ids` |
| DLV - contents | `contents` |
| DLV - content_name | `content_name` |
| DLV - content_type | `content_type` |
| DLV - value | `value` |
| DLV - currency | `currency` |
| DLV - num_items | `num_items` |
| DLV - transaction_id | `transaction_id` |

## Meta Pixel Event Tags

Map the Custom Event triggers to Meta Pixel standard events:

| Data layer event | Meta event | Required parameters |
| --- | --- | --- |
| `view_content` | `ViewContent` | `content_ids`, `contents`, `content_name`, `content_type`, `value`, `currency`, `eventID` |
| `add_to_cart` | `AddToCart` | `content_ids`, `contents`, `content_name`, `content_type`, `value`, `currency`, `num_items`, `eventID` |
| `initiate_checkout` | `InitiateCheckout` | `content_ids`, `contents`, `content_type`, `value`, `currency`, `num_items`, `eventID` |
| `purchase` | `Purchase` | `content_ids`, `contents`, `content_type`, `value`, `currency`, `num_items`, `transaction_id`, `eventID` |

Use `{{DLV - event_id}}` as Meta Pixel `eventID`. This must match the backend CAPI `event_id` for deduplication.

If the installed GTM Meta Pixel template does not expose an `eventID` field, use a Custom HTML tag for each event and pass the ID as the fourth argument:

```html
<script>
fbq('track', 'AddToCart', {
  content_ids: {{DLV - content_ids}},
  contents: {{DLV - contents}},
  content_type: {{DLV - content_type}},
  value: {{DLV - value}},
  currency: {{DLV - currency}},
  num_items: {{DLV - num_items}}
}, { eventID: {{DLV - event_id}} });
</script>
```

Change the event name and fields for ViewContent, InitiateCheckout, and Purchase.

## Trigger Points

- ViewContent: after product detail data loads.
- AddToCart: after cart store accepts the product.
- InitiateCheckout: when the cart Proceed to checkout link is clicked.
- Purchase: after the backend successfully persists a COD order.

## Testing

1. Open GTM Preview / Tag Assistant.
2. Visit one product detail page and confirm one `view_content`.
3. Add one item to cart and confirm one `add_to_cart`.
4. Click Proceed to checkout and confirm one `initiate_checkout`.
5. Use a safe local/test order path only for `purchase`; do not create a real production order for testing.
6. In Meta Events Manager Test Events, confirm Browser and Server events use the same `event_id` and are deduplicated.
7. Confirm PageView still fires from the existing GTM base setup and is not duplicated by direct source code.
