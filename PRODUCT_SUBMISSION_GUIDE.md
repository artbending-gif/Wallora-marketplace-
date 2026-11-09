# Give your products to Wallora

The application is ready for your real catalog. Supply one folder per product and a short metadata list. You do not need to format the database yourself; the catalog importer handles that.

## What to provide for each product

### 1. The paid deliverable

Provide the exact file the buyer should receive:

- Wall art: preferably a ZIP containing high-resolution JPG/PNG files, print-size PDFs, and a small printing guide.
- Phone wallpaper: full-resolution JPG or PNG files; include separate lock-screen and home-screen versions if available.
- Desktop wallpaper: common wide-screen sizes or one sufficiently large master image.
- Bundle: a clearly organized ZIP with every included design and a contents/readme file.

Use simple filenames without special characters, for example `terracotta-dreams-wall-art.zip`.

Paid originals belong in `private-products/` during preparation. They must never be placed in `public/` or committed to GitHub. Real delivery will use private object storage and purchase-authorized signed URLs.

### 2. A public preview image

Provide a separate JPG or WebP preview for the storefront:

- Recommended long edge: 1600–2400 pixels.
- Recommended size: under 2 MB.
- Use a tasteful watermark for paid artwork.
- Do not provide the full printable resolution as the preview.
- Wall art can use a framed room mockup as the first preview.
- Phone wallpaper can use a phone mockup, but also provide one clean preview if possible.

### 3. Product information

For every product, provide:

- Product title
- One-paragraph description
- Category: Wall Art, Phone Wallpaper, Desktop, or Bundle
- Style: for example Abstract, Botanical, Nature, Gradient, Typography, Photography, or Illustration
- Price in USD; use `0` for a free product
- Search tags
- Pixel dimensions and DPI where relevant
- Included file types
- Whether it should be featured

Also provide once for the whole catalog:

- Your public creator name
- Shop name
- Seller/contact email

The structured example is in `catalog/product-template.json`. Prices use cents: `$6.99` is `699`.

## Recommended product quality

### Printable wall art

- Export at 300 DPI.
- Include common aspect ratios when possible: 2:3, 3:4, 4:5, ISO/A-series, and 11:14.
- State the largest recommended print size for each file.
- Avoid claiming exact color matching because screens and printers differ.

### Phone wallpapers

- A useful master size is at least 1440 × 3200 px.
- Leave readable space for the clock and icons.
- Test on both Android and iPhone-style screens.
- Avoid important details at extreme edges where devices crop.

### Bundles

- Use numbered subfolders or clear filenames.
- Include a contents list.
- Verify the ZIP opens correctly before submitting it.

## Current catalog (four designs)

The storefront now contains wall-print and phone-wallpaper listings derived from these four designs:

1. Save Me! / “.PDF or .PNG?”
2. Evergreen Glow (Christmas tree)
3. Cigar Lounge
4. Call Your Mother!

Their preview artwork currently ships as **vector recreations** because the original image files were not present in the project. To swap in your originals, drop files into `public/designs/` using the filenames listed in `public/designs/README.md`, point each `imageUrl` in `catalog/products.json` at the new path, then validate and replace the catalog.

Wall and phone mockups are composed live by `src/components/ArtworkMockup.tsx`, so a changed `imageUrl` updates the hero, product cards, product page and listing preview with no further edits.

## Rights confirmation

Only supply work you created or have explicit commercial resale rights to use. Do not submit:

- Copyrighted characters, logos, celebrities, or brands without permission
- Stock photos that prohibit resale as standalone digital products
- Fonts, templates, or AI assets whose licenses prohibit this use
- Other artists' work or lightly modified copies

Keep proof of licenses for every third-party element.

## What happens when the products arrive

1. Each public preview is optimized and assigned a stable catalog key.
2. Metadata is entered in `catalog/products.json`.
3. The catalog validator checks categories, prices, required text, unique keys, and preview locations.
4. The database migration is applied if needed.
5. The replacement tool removes only managed demo/catalog products and preserves creator-uploaded listings.
6. Replacement runs inside one transaction; any failure rolls everything back.
7. The storefront, cart, dashboard, and library are retested.

The importer refuses to erase catalog purchase history by default. Catalog replacement should happen before real payments begin.

## Current payment status

The present application uses simulated checkout. Public previews and product metadata can be replaced now, but paid originals should not be publicly delivered until authentication, private storage, Stripe Connect, and verified payment webhooks are implemented.
