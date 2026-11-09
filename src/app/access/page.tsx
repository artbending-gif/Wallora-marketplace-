import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Cloud,
  Database,
  FileImage,
  KeyRound,
  Lock,
  Server,
  ShieldCheck,
  ShoppingBag,
  UserCog,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Access & storage — Wallora",
};

const roles = [
  {
    icon: UserCog,
    role: "Owner (you)",
    color: "bg-butter",
    can: "Full control of the entire shop: every listing, every artist's work, prices, featured badges, shop statistics.",
    how: "The first account created on the site becomes the owner automatically. Log in at /admin or /dashboard.",
  },
  {
    icon: Users,
    role: "Artist / seller",
    color: "bg-mint",
    can: "Publish new art, edit and delete only their own listings, see their own sales and 90% payout figure.",
    how: "Creates a free account with email + password. Cannot see anyone else's studio or sales.",
  },
  {
    icon: ShoppingBag,
    role: "Buyer",
    color: "bg-paper-warm",
    can: "Browse everything, buy, download their files. No account needed.",
    how: "Checkout emails a permanent order page (/order/…token). Downloads are only issued for a token that actually bought that artwork.",
  },
  {
    icon: Lock,
    role: "Public visitor",
    color: "bg-paper-warm",
    can: "Browse the gallery, artwork detail pages and previews. Cannot edit, upload or read sales data.",
    how: "No login. All write actions are rejected by the server, not just hidden in the UI.",
  },
];

const storage = [
  {
    icon: Database,
    title: "PostgreSQL database",
    where: "Local Postgres now → Neon / Supabase free tier in production",
    holds: [
      "artists — name, email, salted scrypt password hash, owner flag, bio",
      "artworks — title, description, tags, category, price, sales count, image location",
      "orders + order_items — buyer email, total, download token, what was bought",
      "sessions — random login tokens (the cookie only stores this token)",
    ],
  },
  {
    icon: FileImage,
    title: "Artwork image files",
    where: "Uploaded art: inside the database as encoded image data. Starter art: public/art/ in the repo.",
    holds: [
      "When a seller uploads, the browser compresses the image and the result is saved in artworks.image_url — so backups of the database include the art.",
      "The shipped catalogue lives as JPEGs in public/art/, served by the site and deployed with the code.",
      "Free-tier math: Neon gives ~0.5 GB. A compressed listing is ~200–400 KB, so roughly 1,000–2,000 uploads before you need object storage.",
    ],
  },
  {
    icon: Cloud,
    title: "Code, hosting and secrets",
    where: "GitHub (private repo) → Vercel (hosting) + environment variables",
    holds: [
      "The Next.js app itself is deployed on Vercel's free Hobby tier with automatic HTTPS.",
      "DATABASE_URL and ADMIN_KEY are environment variables stored in Vercel — never in the code or GitHub.",
      "Visitors' passwords are never stored: only the scrypt hash and salt from the database.",
    ],
  },
];

export default function AccessPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-mint px-4 py-1.5 text-xs font-bold tracking-wide uppercase">
        <ShieldCheck className="h-4 w-4" /> Ownership, permissions &amp; data locations
      </p>
      <h1 className="mt-5 font-display text-4xl font-black tracking-tight sm:text-6xl">
        You own the shop.{" "}
        <span className="text-cobalt italic">Here&apos;s the whole map.</span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
        Who can do what, and exactly where every record and image lives. Nothing
        is locked in a service you can&apos;t export — it&apos;s your database,
        your files, your code.
      </p>

      {/* claim access */}
      <div className="mt-8 rounded-2xl border-2 border-ink bg-cobalt p-6 text-white sm:p-8">
        <h2 className="flex items-center gap-2 font-display text-2xl font-black">
          <KeyRound className="h-6 w-6 text-butter" /> Claim full owner access
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          The first account you create on Wallora becomes the owner and adopts
          the starter catalogue. Use your own email and a strong password — then
          you can manage every listing from{" "}
          <Link href="/admin" className="font-bold text-butter underline">/admin</Link>.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-full border-2 border-ink bg-butter px-5 py-2.5 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5"
          >
            Create / log in to owner account <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border-2 border-white/60 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-cobalt"
          >
            Open my seller studio
          </Link>
        </div>
      </div>

      {/* roles */}
      <h2 className="mt-14 mb-5 border-b-2 border-ink pb-3 font-display text-3xl font-black">
        Who can access what
      </h2>
      <div className="space-y-4">
        {roles.map(({ icon: Icon, role, color, can, how }) => (
          <div key={role} className="rounded-2xl border-2 border-ink bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink ${color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-xl font-bold">{role}</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{can}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              <strong className="text-ink">How:</strong> {how}
            </p>
          </div>
        ))}
      </div>

      {/* storage */}
      <h2 className="mt-14 mb-5 border-b-2 border-ink pb-3 font-display text-3xl font-black">
        Where everything is stored
      </h2>
      <div className="space-y-4">
        {storage.map(({ icon: Icon, title, where, holds }) => (
          <div key={title} className="rounded-2xl border-2 border-ink bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-paper-warm">
                <Icon className="h-5 w-5 text-cobalt" />
              </span>
              <div>
                <h3 className="font-display text-xl font-bold">{title}</h3>
                <p className="text-xs text-ink-soft">{where}</p>
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {holds.map((h) => (
                <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-ink-soft">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cobalt" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* backup + growth */}
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border-2 border-ink bg-paper-warm p-6">
          <Server className="h-6 w-6 text-cobalt" />
          <h3 className="mt-3 font-display text-xl font-bold">Your backup plan</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Everything worth keeping is in one PostgreSQL database, so one dump
            is a full backup:{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">
              pg_dump $DATABASE_URL &gt; wallora-backup.sql
            </code>
            . Neon also keeps automatic point-in-time history on its free tier.
            Keep the repo on GitHub and the catalogue lives in three places.
          </p>
        </div>
        <div className="rounded-2xl border-2 border-ink bg-paper-warm p-6">
          <Boxes className="h-6 w-6 text-cobalt" />
          <h3 className="mt-3 font-display text-xl font-bold">When to upgrade storage</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Past a few thousand uploads, move image files to object storage —
            Cloudflare R2 (10 GB free) or Vercel Blob — and keep only the URL in
            the database. The schema already separates image data from listing
            records, so switching is a one-file change.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border-2 border-ink bg-ink p-8 text-paper sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-black">Going live?</h2>
          <p className="mt-1 text-sm text-paper/70">
            The deploy walkthrough covers Neon, Vercel and setting your own
            ADMIN_KEY.
          </p>
        </div>
        <Link
          href="/deploy"
          className="flex items-center gap-2 rounded-full border-2 border-paper bg-butter px-6 py-3 text-sm font-bold text-ink transition-all hover:-translate-y-0.5"
        >
          Deploy steps <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}