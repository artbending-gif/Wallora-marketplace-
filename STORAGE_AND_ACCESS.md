# Where everything is stored, and who can access it

## Two separate stores

Wallora never mixes records with artwork files.

### 1. Structured records → PostgreSQL

| Table | What it holds |
|---|---|
| `products` | Listings: title, description, price, category, preview URL, seller, sales count, catalog key |
| `purchases` | Orders: product, buyer email, seller email, price, creator share, timestamp |
| `users` | Accounts: name, email, shop name, scrypt password hash, role (`admin` / `creator`) |
| `sessions` | Login sessions: SHA-256 hash of the token, user id, expiry |
| `favorites` | Saved products per email |

- **In this preview:** the sandbox PostgreSQL server (`127.0.0.1:5432/app_db`).
- **In production:** your Neon database, reached only from server-side code through `DATABASE_URL`.

The database is not downloadable from the browser. There is no public API that dumps it, and every admin endpoint checks the session role first.

### 2. Artwork → files

| Folder | Contents | Public? | In Git? |
|---|---|---|---|
| `public/designs/` | Source artwork for the catalog | **Yes** — anyone can fetch it | Yes |
| `public/previews/` | Storefront previews and phone versions | **Yes** | Yes |
| `private-products/` | Paid originals, if you stage them locally | No | **No** — gitignored |

Anything inside `public/` is served by the CDN and can be downloaded without paying. That is acceptable for watermarked previews and unacceptable for full-resolution deliverables.

**Before real sales**, paid files must move to private object storage (S3, Cloudflare R2, Supabase Storage, Neon object storage, or similar) with short-lived signed URLs issued only after a verified payment webhook.

### 3. Secrets → environment variables

`.env` locally, Netlify environment variables in production. Never committed. `.gitignore` excludes `.env`.

## Who can access what

| Capability | Visitor | Creator | Owner (admin) |
|---|---|---|---|
| Browse, search, cart, checkout | ✅ | ✅ | ✅ |
| Publish a listing | ❌ | ✅ own shop only | ✅ |
| See a creator dashboard | ❌ | ✅ own listings + sales | ✅ all listings + sales |
| Delete a listing | ❌ | ✅ own only | ✅ any |
| Read another buyer's library | ❌ | ❌ | ❌ (library is session-scoped for everyone) |
| Owner console `/admin` | ❌ | ❌ | ✅ |
| See database size, file inventory, env checks | ❌ | ❌ | ✅ |

Creator identity is taken from the **session**, never from the request body, so nobody can publish or claim sales under another seller's email.

## How you become the owner

**Recommended for any public deployment:** add `ADMIN_EMAILS` to Netlify environment variables *before* your first deploy:

```
ADMIN_EMAILS=you@example.com
```

Only those addresses receive the `admin` role. Everyone else registers as a creator.

**Without an allowlist**, the first account created becomes the owner — convenient locally, risky on a public URL, because the first stranger to register would take control. If you already deployed without the allowlist, add it now; existing roles stay as they are, and you can promote yourself with:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

## Recovering access

There is no email service wired up yet, so password recovery is done with a script that talks to the database directly.

```bash
# Reset a password (signs out any stale session)
node scripts/reset-password.mjs you@example.com 'NewPassword123'

# Promote an existing account to owner
node scripts/reset-password.mjs you@example.com --admin

# Just sign out everywhere, keep the password
node scripts/reset-password.mjs you@example.com
```

Use the **unpooled/direct** connection string (`DATABASE_URL_UNPOOLED`) when running it against Neon.

The registration form asks for the password twice and shows a live match indicator plus a Show/Hide toggle, which prevents the typo situation that locks you out.

## Password and session handling

- Passwords: scrypt with a random 16-byte salt per user. Plain passwords are never stored.
- Sessions: a 32-byte random token in an `httpOnly`, `sameSite=lax` cookie, `secure` in production.
- The database stores only a SHA-256 hash of that token, so a database leak cannot be replayed as a login.
- Sessions expire after 30 days and are deleted on sign-out.

## Still required before taking real money

1. Private object storage for paid files with signed downloads.
2. Stripe Connect onboarding for each creator and payout handling.
3. Webhook-verified fulfilment (grant a download only after `payment_succeeded`).
4. Email verification and password reset.
5. Rate limiting on login and registration.
6. Terms, privacy policy, refund policy, and a copyright takedown process.
7. Database backups and an audit log of admin actions.
