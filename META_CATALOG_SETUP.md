# Meta Catalog Setup for Bornil Vibes

The production product feed URL must be exactly:

```text
https://bornilvibes.com/product-feed.xml
```

Netlify proxies this route to the backend dynamic XML endpoint:

```text
/api/products/feed.xml
```

The backend generates the feed from MongoDB `products`, so product name, price, sale price, stock, image, and product URL update automatically when the Bornil Vibes admin updates products.

## Product ID Strategy

`META_PRODUCT_ID_STRATEGY = MongoDB product _id string`

The same ID is used in:

- Catalog feed `g:id`
- Pixel `content_ids[]`
- Pixel `contents[].id`
- CAPI `custom_data.content_ids[]`
- CAPI `custom_data.contents[].id`

## Feed Format

RSS XML with Google/Meta catalog fields:

- `g:id`
- `g:title`
- `g:description`
- `g:availability`
- `g:condition`
- `g:price`
- `g:sale_price`, only when `oldPrice > price`
- `g:link`
- `g:image_link`
- `g:brand`

Rules:

- `condition` is `new`.
- `brand` is `Bornil Vibes`.
- Currency is `BDT`.
- Availability is `in stock` when `stock > 0`, otherwise `out of stock`.
- Only active products with valid price, stock, HTTPS image, and public product URL are included.

## Commerce Manager Steps

1. Open Meta Commerce Manager.
2. Choose the correct Business and Catalog.
3. Go to Catalog > Data Sources.
4. Add Items > Data Feed.
5. Select Scheduled Feed.
6. Enter feed URL: `https://bornilvibes.com/product-feed.xml`.
7. Choose XML/RSS feed format if prompted.
8. Set automatic refresh to Daily.
9. Keep currency as BDT.
10. Save and run the first fetch.

## Connect Pixel/Dataset

1. In Commerce Manager, open Catalog Settings or Event Sources.
2. Connect the existing Meta Pixel/Dataset used by GTM.
3. Do not create a new Pixel unless the client explicitly wants a new Dataset.
4. Open Diagnostics and confirm product IDs match website events.
5. Test ViewContent, AddToCart, InitiateCheckout, and Purchase in Events Manager.

## Product Sets

After the feed syncs, Product Sets can be created from feed fields such as:

- All products
- Category-based products
- In-stock products
- Sale products, when `sale_price` exists

## Dynamic Ads Readiness Checks

Before launching Catalog Sales or Dynamic Product Ads:

1. Feed fetch succeeds.
2. Products show image, price, availability, and public URL.
3. Pixel ViewContent `content_ids` match catalog IDs.
4. Pixel AddToCart `content_ids` match catalog IDs.
5. Pixel Purchase `content_ids` match catalog IDs.
6. Server CAPI events are received and deduplicated with browser events.
7. Commerce Manager Diagnostics has no blocking catalog errors.

No ad campaign is created by code. The client must complete Commerce Manager and Events Manager setup manually.
