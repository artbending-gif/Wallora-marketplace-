# Wallora deployment guide — $0 public beta

This guide publishes Wallora as a **public demo/beta with simulated checkout**. It does not turn the current demo checkout into a secure real-money marketplace.

## Recommended free stack

| Service | Purpose | Cost to start |
|---|---|---:|
| GitHub | Stores the source code and triggers deployments | $0 |
| Neon | Permanent PostgreSQL database | $0 free plan |
| Netlify | Hosts the Next.js application and API routes | $0 free plan |
| `*.netlify.app` URL | Public web address | $0 |

Why Netlify instead of Vercel Hobby: Netlify Free permits commercial projects within its usage limits. Vercel Hobby is intended for personal, non-commercial use, so it is not the recommended free host for a marketplace.

Do not buy a domain yet. Launch on the included `your-name.netlify.app` address and buy a domain from the first revenue later.

---

## Phase 1 — Prepare the project

> **Windows users:** read `START_HERE_WINDOWS.md` first. Do not run `git init` or `git add .` from `C:/Users/YourName`. Open Git Bash inside the extracted Wallora project folder, where `package.json` and `netlify.toml` are visible.

Install these free tools on your computer:

1. [Git](https://git-scm.com/downloads)
2. [Node.js 22 LTS](https://nodejs.org/)
3. A free [GitHub](https://github.com/) account

From the project folder, run:

```bash
npm install
npm run build
```

The build must finish successfully before deployment.

### Confirm secrets are protected

This repository includes `.gitignore`, which excludes `.env` files. Confirm it before the first commit:

```bash
git check-ignore .env
```

The output should be `.env`. Never paste a database password, Stripe key, or other secret into source code, GitHub, chat, screenshots, or `netlify.toml`.

---

## Phase 2 — Put the code on GitHub

1. In GitHub, create an empty repository, or use the empty repository you already created.
2. A private repository is fine. The repository name can be `wallora` or another name you choose.
3. Do not initialize it with a README if you plan to push this project from your computer.
4. In the Wallora project folder, run the commands GitHub displays. They will look like:

```bash
git init
git add .
git commit -m "Initial Wallora marketplace"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Before pushing, run `git status` and confirm `.env` is not listed.

If you upload through GitHub's web interface instead, use **Add file → Upload files** and drag the full project folders from the extracted ZIP: `src/`, `public/`, `catalog/`, `drizzle/`, `scripts/`, plus `netlify.toml` and the root files. Do not upload only `package.json`, `README.md`, and other loose configuration files.

After the upload or push, GitHub must show these folders:

```text
src/
public/
catalog/
drizzle/
scripts/
```

You can also check a local project folder with:

```bash
node scripts/check-deployment.mjs
```

---

## Phase 3 — Create the free Neon database

1. Create an account at [neon.com](https://neon.com/).
2. Click **New Project**.
3. Name it `wallora` and choose a region close to most of your expected visitors.
4. Keep the free plan and the default database/branch.
5. If Neon shows a welcome screen, click **Go to project**.
6. In the project dashboard, click **Connect** or **Connection Details**.

Neon provides two connection strings for the same database:

- **Pooled URL:** pooling is on and the hostname contains `-pooler`. This is `DATABASE_URL` for the deployed application.
- **Direct URL:** pooling is off and the hostname does not contain `-pooler`. This is used only by Drizzle for schema migrations.

Save both temporarily in a password manager. Treat them like passwords.

### Create the production tables

Run the committed migrations once using the **direct** Neon URL:

macOS/Linux:

```bash
DATABASE_URL_UNPOOLED='PASTE_DIRECT_NEON_URL_HERE' npx drizzle-kit migrate
```

Windows PowerShell:

```powershell
$env:DATABASE_URL_UNPOOLED='PASTE_DIRECT_NEON_URL_HERE'
npx drizzle-kit migrate
Remove-Item Env:DATABASE_URL_UNPOOLED
```

This creates `users`, `sessions`, `products`, `purchases`, and `favorites`. Wallora inserts the starter catalog automatically on the first product request.

Do not put `npx drizzle-kit migrate` in the normal Netlify build command. Run migrations intentionally before deploying code that depends on a schema change.

---

## Phase 4 — Deploy to Netlify

1. Create a free account at [netlify.com](https://www.netlify.com/), preferably by signing in with GitHub.
2. Choose **Add new project → Import an existing project**.
3. Choose **GitHub** and authorize access to the `wallora` repository.
4. Select the `main` branch.
5. Netlify should detect Next.js. The committed `netlify.toml` already sets:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node.js: `22`
6. Before deploying, open **Environment variables** and add:

| Key | Value |
|---|---|
| `DATABASE_URL` | The **pooled** Neon URL containing `-pooler` |
| `ADMIN_EMAILS` | Comma-separated owner email addresses, for example `you@example.com` |

Make the variables available to both builds and functions/all deploy contexts if the UI asks. Do **not** add `DATABASE_URL_UNPOOLED` to Netlify; it is only needed where migrations are run.

7. Click **Deploy**.
8. Wait for the build to finish. Netlify will provide an address such as `wallora-market.netlify.app`.
9. Under **Domain management**, rename the included Netlify subdomain if desired. This is free.

Every later push to GitHub's `main` branch automatically creates a new production deployment.

---

## Phase 5 — Verify the deployment

Perform these checks in order:

1. Open `https://YOUR-SITE.netlify.app/api/health`.
2. Confirm the response is `{"ok":true}`. If it is not, recheck `DATABASE_URL` and the Neon migration.
3. Open the home page and verify the product catalog and images load.
4. Search and switch product categories.
5. Create an account at `/login` using an email listed in `ADMIN_EMAILS`, then confirm `/admin` opens.
6. Add an item to the cart and complete simulated checkout while signed in.
7. Confirm it appears in **My Library** and can be downloaded.
8. Publish one test product from **Sell & Earn**, and confirm it appears in the Creator Dashboard.
9. Check the Netlify **Functions** logs and Neon monitoring if any API route fails.

The first product request may be slightly slower while Neon wakes from idle and the starter catalog is seeded.

---

## Phase 6 — How to publish updates

After changing the application:

```bash
npm run build
git add .
git commit -m "Describe the update"
git push
```

Netlify deploys the new commit automatically.

When the Drizzle schema changes:

1. Run `npx drizzle-kit generate` and review the generated SQL.
2. Commit the migration.
3. Apply it to Neon using the direct URL and `npx drizzle-kit migrate`.
4. Push the application update.

Back up the database before destructive schema changes.

---

## Replacing the demo catalog with your products

Prepare products using `PRODUCT_SUBMISSION_GUIDE.md` and the example in `catalog/product-template.json`. Paid originals stay in `private-products/` during preparation and must never be committed or placed in `public/`.

Validate the manifest without changing the database:

```bash
node scripts/catalog.mjs validate
```

Apply all database migrations before the first replacement. Then replace managed catalog items using a direct database URL:

```bash
REPLACE_CATALOG=YES DATABASE_URL_UNPOOLED='YOUR_DIRECT_DATABASE_URL' node scripts/catalog.mjs replace
```

The replacement runs in one transaction, preserves creator-uploaded listings, and rolls back on any error. It refuses to delete catalog purchase history. During a demo-only reset, that protection can be explicitly overridden with `ALLOW_CATALOG_PURCHASE_DELETE=YES`; never use that override after real sales begin.

After replacement, test the storefront, product details, cart, library, and creator dashboard before redeploying.

---

## Accounts and owner access

Wallora now has real accounts, roles, and server-side sessions. See `STORAGE_AND_ACCESS.md` for the full map of where data lives and who can reach it.

Set this in Netlify **before** the first production deploy:

```
ADMIN_EMAILS=you@example.com
```

With an allowlist set, only those emails can open `/admin`. Without it, the first registered account becomes the owner — fine locally, unsafe on a public URL. The owner console shows database size, table counts, file inventories, environment-variable checks, every listing, and recent orders.

Access rules enforced today: publishing, dashboards, deletion, and libraries all require a valid session; creators are scoped to their own rows; anonymous requests to `/api/dashboard`, `/api/products` (POST), and `/api/library` return 401.

---

## Free-tier guardrails

- **Netlify Free:** uses a monthly credit allowance with a hard limit. The site pauses instead of producing an unexpected bill when the allowance is exhausted. Avoid unnecessary production deploys and monitor usage.
- **Neon Free:** compute scales to zero while idle. The first database request after inactivity can be slower. Monitor storage, compute, and transfer in Neon.
- Keep remote product images optimized. Do not store large original artwork as base64 text in Postgres for a real launch.
- Use the free `netlify.app` domain until revenue justifies purchasing a custom domain.

---

## Critical: requirements before accepting real money

The deployed application is currently a functional **prototype**, not a secure marketplace. Checkout is intentionally simulated, identity is stored in the browser, and demo downloads use public image URLs. Complete these gates before enabling live sales:

1. **Authentication and authorization**
   - Add real buyer and creator accounts, verified email, sessions, password reset, and role checks.
   - Product creation/deletion, seller dashboards, purchases, and downloads must be authorized server-side.

2. **Private digital-file storage**
   - Store full-resolution paid files in private object storage, not Postgres, local browser data, or public URLs.
   - Serve watermarked/low-resolution previews publicly.
   - Generate short-lived signed download links only for verified purchases.
   - Add file size/type limits and malware scanning.

3. **Stripe Connect—not ordinary Stripe Checkout**
   - Every creator needs a Stripe connected account and Stripe-hosted onboarding for identity and payout details.
   - Use destination charges when one order belongs to one seller, or separate charges/transfers when an order contains products from multiple sellers.
   - Set the platform application fee deliberately. Stripe processing and Connect fees come out of the platform economics, so verify that a 15% commission covers them.

4. **Webhook-confirmed fulfillment**
   - Never grant a purchase because the browser reports success.
   - Create the order as pending, verify Stripe's webhook signature, and grant the download only after a successful payment webhook.
   - Handle duplicate webhooks, refunds, disputes, failed payments, and chargebacks.

5. **Marketplace policies and compliance**
   - Publish Terms, Privacy, creator agreement, license terms, refund policy, and copyright/takedown process.
   - Add reporting, moderation, blocked content, and seller removal tools.
   - Determine who handles sales tax/VAT and whether the platform is the merchant of record in each market.
   - Ask a qualified local professional about business, tax, and consumer-protection obligations before launch.

6. **Operations and security**
   - Add rate limiting, audit logs, backups, error monitoring, transactional email, and an admin moderation dashboard.
   - Rotate any credential that is ever exposed and keep production and preview databases separate.

### Safest launch sequence

1. Deploy this version as a public demo or invite-only beta.
2. Test the complete user experience with simulated payments.
3. Add authentication and private file storage.
4. Add Stripe Connect in test mode and complete seller onboarding yourself.
5. Test successful payment, failed payment, refund, dispute, duplicate webhook, and unauthorized download cases.
6. Complete policies and tax/legal checks.
7. Switch Stripe to live mode and make the first real sale.

---

## Official references

- [Netlify: Next.js overview](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/)
- [Netlify: Free plan](https://www.netlify.com/pricing/)
- [Netlify: environment variables](https://docs.netlify.com/build/environment-variables/overview/)
- [Neon: connect an application](https://neon.com/docs/connect/connect-from-any-app)
- [Neon: connection pooling](https://neon.com/docs/connect/connection-pooling)
- [Drizzle: migrations](https://orm.drizzle.team/docs/migrations)
- [Stripe: build a marketplace](https://docs.stripe.com/connect/marketplace)
- [Stripe: marketplace onboarding](https://docs.stripe.com/connect/marketplace/tasks/onboard)
