# Wallora

Wallora is a Next.js + PostgreSQL marketplace prototype for digital wall art and phone wallpapers.

## Current status

- Storefront, catalog, cart, simulated checkout, library, creator dashboard, accounts, and owner console are implemented.
- Checkout is **simulated**. Do not accept real payments until private file delivery, Stripe Connect, and webhook-verified fulfilment are added.
- Public preview images live in `public/`. Paid originals must not be placed there.

## Quick start

```bash
npm install
npx drizzle-kit migrate
npm run dev
```

You need a PostgreSQL database and a local `.env` file. Use `.env.example` as the template.

## Deployment

Read these files in order:

1. `START_HERE_WINDOWS.md` — Windows laptop setup and safe Git usage.
2. `DEPLOYMENT.md` — GitHub, Neon, Netlify, migrations, and verification.
3. `STORAGE_AND_ACCESS.md` — where data is stored and who can access it.

The app also includes a browser checklist at `/deploy`.

### Required repository contents

GitHub must contain the full project, not only root configuration files. At minimum, verify these exist:

```text
src/
public/
catalog/
drizzle/
scripts/
netlify.toml
package.json
package-lock.json
```

You can check a local folder with:

```bash
node scripts/check-deployment.mjs
```

## Owner access

Set `ADMIN_EMAILS` before the first public deployment. Only those emails become owners. If no allowlist is configured, the first registered account becomes owner.

## Useful commands

```bash
npm run build
npm exec tsc -- --noEmit
node scripts/catalog.mjs validate
```
