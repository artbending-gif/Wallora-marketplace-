import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  CreditCard,
  Globe,
  ImagePlus,
  Megaphone,
  Palette,
  Rocket,
  ShieldCheck,
  Store,
  Upload,
} from "lucide-react";

export const metadata = {
  title: "Launch with $0 — Wallora Guide",
};

const phases = [
  {
    icon: Palette,
    phase: "Phase 1",
    title: "Create your first 10 products (cost: $0)",
    time: "Week 1",
    color: "bg-butter",
    points: [
      "Start with what you can make today: digital art needs no inventory. Design in free tools like Canva (free tier), Krita, Inkscape or Photopea — all run in your browser or desktop for free.",
      "Make two kinds of products: wall art prints (posters, line art, photography — aim for 3000px+ so they print crisply) and phone wallpapers (tall 9:19 images, e.g. 1170 × 2532).",
      "Wallpapers sell cheap ($1.99–$3.99) but often; wall art sells higher ($4.99–$14.99). Having both gives buyers two reasons to checkout.",
      "Only sell work you made yourself or own the rights to. Never resell other people's art or stock images you don't have a commercial license for.",
    ],
    action: { href: "/sell", label: "Upload your first piece", icon: Upload },
  },
  {
    icon: Store,
    phase: "Phase 2",
    title: "Open your shop (cost: $0)",
    time: "Week 1–2",
    color: "bg-mint",
    points: [
      "You're looking at it — this marketplace is your shop. Listings are free, there are no monthly fees, and everything (site + database) runs on free tiers while you're small.",
      "Write titles people search for: 'Minimalist Line Art Botanical Print' beats 'Untitled #4'. Add comma-separated tags — that's how buyers find you.",
      "Use the live preview when uploading: buyers decide in seconds, and seeing art in a frame or on a phone converts far better than a flat image.",
      "Alternative while you grow: also list the same files on Etsy (listing costs $0.20) or Gumroad (free, pay per sale) to reach their existing traffic. Your own site keeps 100% of the margin.",
    ],
    action: { href: "/dashboard", label: "Check your Seller Studio", icon: Store },
  },
  {
    icon: CreditCard,
    phase: "Phase 3",
    title: "Turn on real payments (cost: $0 upfront)",
    time: "Week 2–3",
    color: "bg-butter",
    points: [
      "Right now checkout is in demo mode — orders and downloads work, but no money moves. To accept real payments, create a free Stripe account (no monthly fee, they take ~2.9% + 30¢ per sale).",
      "Stripe Checkout is the easiest path: the developer replaces the demo checkout with a Stripe session; buyers pay by card, Apple Pay or Google Pay, and are redirected back to their download page.",
      "Paying other sellers? Stripe Connect splits each sale automatically — e.g. 90% to the artist, 10% to you — so you never manually transfer money.",
      "If Stripe isn't available in your country, alternatives with the same $0-upfront model: PayPal, Paddle, or Lemon Squeezy.",
    ],
    action: { href: "/cart", label: "See the demo checkout", icon: CreditCard },
  },
  {
    icon: Megaphone,
    phase: "Phase 4",
    title: "Get your first sales for free",
    time: "Week 3+",
    color: "bg-mint",
    points: [
      "Pinterest is the #1 free traffic source for wall art — people literally search there for 'living room poster ideas'. Pin every product with its mockup image and a link. 5 pins a day, consistently.",
      "Instagram & TikTok: post 15-second process videos (timelapse of you making the art) and 'phone makeover' clips showing your wallpaper on a lock screen. Link your shop in bio.",
      "Reddit & niche communities: share genuinely useful posts in r/InteriorDesign, r/Amoledbackgrounds, r/phone setups — read each community's self-promo rules first.",
      "SEO takes months but is free forever: good titles, descriptions and tags on every listing mean Google can send you buyers while you sleep.",
    ],
    action: { href: "/", label: "Browse what sells", icon: Megaphone },
  },
  {
    icon: Rocket,
    phase: "Phase 4.5",
    title: "Put your shop online — deploy it free",
    time: "Once, ~20 minutes",
    color: "bg-butter",
    points: [
      "A shop nobody can reach doesn't sell. Deploy it to a live public URL for $0: GitHub (free) holds the code, Neon (free) holds the PostgreSQL database, Vercel (free) hosts the site and redeploys on every change.",
      "The full click-by-click walkthrough lives in this app — including the exact commands, where to paste your database password, and what to do if a step fails.",
      "You get a live address like your-shop.vercel.app immediately. A custom domain (~$10/year) can wait until your first sale.",
    ],
    action: { href: "/deploy", label: "Open the deploy walkthrough", icon: Rocket },
  },
  {
    icon: Globe,
    phase: "Phase 5",
    title: "Grow without spending",
    time: "Month 2+",
    color: "bg-butter",
    points: [
      "Hosting on a budget of zero: Vercel's free tier (Next.js) + Neon or Supabase's free tier (PostgreSQL) comfortably run a small shop. Move images to Cloudflare R2 (10 GB free) when you have many listings.",
      "Let others sell: every artist who lists here brings their own audience. Your 10% platform fee means you earn from their sales too — that's the marketplace flywheel.",
      "Reinvest your first earnings, not savings: a custom domain (~$10/year) is the only purchase worth making early. Everything else can wait.",
      "Add bestsellers' variations: if one botanical print sells, make five more in the same style. Data beats guessing.",
    ],
    action: { href: "/sell", label: "List something new", icon: ImagePlus },
  },
];

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-butter px-4 py-1.5 text-xs font-bold tracking-wide uppercase">
        <BadgeDollarSign className="h-4 w-4" /> Total budget required: $0
      </p>
      <h1 className="mt-5 font-display text-4xl font-black tracking-tight sm:text-6xl">
        Launch your digital art shop{" "}
        <span className="text-cobalt italic">with no money.</span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
        New to this? Perfect. Digital products are the best first business
        because there&apos;s no inventory, no shipping and no upfront cost.
        Here&apos;s the exact order to do things in.
      </p>

      <div className="mt-8 grid gap-3 rounded-2xl border-2 border-ink bg-white p-6 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, text: "No inventory — files sell an infinite number of times" },
          { icon: Rocket, text: "No shipping — buyers download instantly" },
          { icon: BadgeDollarSign, text: "No upfront fees — pay only a % when you actually sell" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-2.5 text-sm">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-cobalt" />
            {text}
          </div>
        ))}
      </div>

      <div className="mt-12 space-y-10">
        {phases.map(({ icon: Icon, phase, title, time, color, points, action }, i) => (
          <section
            key={phase}
            className="animate-fade-up relative rounded-2xl border-2 border-ink bg-white p-6 sm:p-8"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ink ${color}`}>
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-ink-soft uppercase">
                  {phase} · {time}
                </p>
                <h2 className="font-display text-xl font-black sm:text-2xl">
                  {title}
                </h2>
              </div>
            </div>
            <ul className="mt-5 space-y-3.5">
              {points.map((p) => (
                <li key={p} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-cobalt" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <Link
              href={action.href}
              className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-5 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 hover:bg-butter hover:shadow-[3px_3px_0_0_#16161a]"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border-2 border-ink bg-ink p-8 text-paper sm:p-10">
        <h2 className="font-display text-3xl font-black">
          The honest math 🧮
        </h2>
        <p className="mt-3 leading-relaxed text-paper/70">
          Sell a $6 print → you keep about <strong className="text-butter">$5.10</strong> after
          payment fees. 10 sales a week ≈ $200/month. 100 sales a week ≈
          $2,000/month. It takes consistent uploads and daily free marketing to
          get there — most shops make their first sale in weeks 2–6. The people
          who win are simply the ones who keep listing.
        </p>
        <Link
          href="/sell"
          className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-paper bg-butter px-6 py-3 text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#f4f3ef]"
        >
          <Upload className="h-4 w-4" /> Start with step one — upload art
        </Link>
      </div>
    </div>
  );
}