import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import {
  ArrowDown,
  ArrowRight,
  Download,
  Percent,
  Printer,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { db } from "@/db";
import { artworks, artists } from "@/db/schema";
import Gallery from "@/components/Gallery";

export const dynamic = "force-dynamic";

const tickerItems = [
  { icon: Zap, text: "Instant download after purchase" },
  { icon: Printer, text: "Print at home or any print shop" },
  { icon: Percent, text: "Artists keep 90% of every sale" },
  { icon: Upload, text: "Anyone can sell — listing is free" },
  { icon: Download, text: "High-resolution files, yours forever" },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const rows = await db
    .select({
      id: artworks.id,
      title: artworks.title,
      kind: artworks.kind,
      priceCents: artworks.priceCents,
      imageUrl: artworks.imageUrl,
      sales: artworks.sales,
      featured: artworks.featured,
      artist: artists.name,
    })
    .from(artworks)
    .innerJoin(artists, eq(artworks.artistId, artists.id))
    .orderBy(desc(artworks.createdAt));

  const artistCount = new Set(rows.map((r) => r.artist)).size;
  const totalSales = rows.reduce((s, r) => s + r.sales, 0);

  return (
    <div>
      {/* ticker */}
      <div className="overflow-hidden border-b-2 border-ink bg-cobalt py-2 text-white">
        <div className="flex w-max animate-marquee gap-10">
          {[...tickerItems, ...tickerItems].map(({ icon: Icon, text }, i) => (
            <span
              key={i}
              className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase"
            >
              <Icon className="h-3.5 w-3.5 text-butter" />
              {text}
              <span className="ml-6 text-white/40">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* opening: type + living collage */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(#16161a 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:py-20">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-1.5 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5 text-cobalt" />
              A marketplace for independent digital artists
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] font-black tracking-tight sm:text-6xl lg:text-7xl">
              Walls worth
              <br />
              staring at.
              <br />
              <span className="text-cobalt italic">Screens</span> worth
              <br />
              waking up to.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              Printable wall art and phone wallpapers by real artists. Buy it,
              download it, own it — no shipping, no waiting.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#gallery"
                className="flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-6 py-3 text-sm font-bold text-paper transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#2742e8]"
              >
                Browse the gallery <ArrowDown className="h-4 w-4" />
              </a>
              <Link
                href="/sell"
                className="flex items-center gap-2 rounded-full border-2 border-ink bg-butter px-6 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#16161a]"
              >
                <Upload className="h-4 w-4" /> Sell your art — free
              </Link>
            </div>
            <dl className="mt-10 flex gap-8">
              {[
                { n: rows.length, label: "artworks" },
                { n: artistCount, label: "artists" },
                { n: totalSales, label: "downloads sold" },
              ].map(({ n, label }) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-3xl font-black">{n}</dd>
                  <dd className="text-xs font-medium tracking-wide text-ink-soft uppercase">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* floating collage */}
          <div className="relative mx-auto hidden h-[460px] w-full max-w-md sm:block">
            <div
              className="frame-wood absolute top-4 left-2 w-52 animate-float-slow"
              style={{ "--tilt": "-5deg" } as React.CSSProperties}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/pink-freud-print.jpg" alt="Pink Freud line art print" className="block w-full" />
            </div>
            <div
              className="phone-shell absolute top-16 right-2 w-44 animate-float-slow"
              style={{ "--tilt": "6deg", animationDelay: "1.2s" } as React.CSSProperties}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/offshore-wallpaper.jpg" alt="Offshore phone wallpaper" className="block aspect-[9/19] w-full object-cover" />
            </div>
            <div
              className="frame-wood absolute bottom-0 left-24 w-60 animate-float-slow"
              style={{ "--tilt": "3deg", animationDelay: "0.6s" } as React.CSSProperties}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/save-me-print.jpg" alt="Save Me! line art print" className="block w-full" />
            </div>
            <span className="absolute right-10 bottom-16 rotate-[-8deg] rounded-full border-2 border-ink bg-butter px-4 py-2 font-display text-sm font-bold shadow-[3px_3px_0_0_#16161a]">
              from $2.49
            </span>
          </div>
        </div>
      </section>

      {/* gallery */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="mb-6 flex items-end justify-between border-b-2 border-ink pb-4">
          <h2 className="font-display text-3xl font-black sm:text-4xl">
            The gallery
          </h2>
          <p className="hidden text-sm text-ink-soft sm:block">
            Every purchase = an instant, high-res download
          </p>
        </div>
        <Gallery artworks={rows} initialKind={kind ?? "all"} />
      </section>

      {/* seller CTA band */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border-2 border-ink bg-cobalt px-6 py-12 text-white sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(#ffffff 1.5px, transparent 1.5px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-black sm:text-4xl">
                Made something beautiful?
                <br />
                <span className="text-butter italic">Put a price on it.</span>
              </h2>
              <p className="mt-3 max-w-lg text-white/80">
                Uploading is free. No subscriptions, no listing fees. You keep
                90% of every sale, and buyers download instantly — you never
                ship a thing.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sell"
                className="flex items-center gap-2 rounded-full border-2 border-ink bg-butter px-6 py-3 text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#16161a]"
              >
                <Upload className="h-4 w-4" /> Start selling
              </Link>
              <Link
                href="/guide"
                className="flex items-center gap-2 rounded-full border-2 border-white/60 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white hover:text-cobalt"
              >
                Read the $0 guide <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}