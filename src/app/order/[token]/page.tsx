import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  Bookmark,
  Download,
  Frame,
  PartyPopper,
  Smartphone,
} from "lucide-react";
import { db } from "@/db";
import { artworks, artists, orderItems, orders } from "@/db/schema";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.token, token))
    .limit(1);
  if (!order) notFound();

  const items = await db
    .select({
      id: artworks.id,
      title: artworks.title,
      kind: artworks.kind,
      imageUrl: artworks.imageUrl,
      priceCents: orderItems.priceCents,
      artist: artists.name,
    })
    .from(orderItems)
    .innerJoin(artworks, eq(orderItems.artworkId, artworks.id))
    .innerJoin(artists, eq(artworks.artistId, artists.id))
    .where(eq(orderItems.orderId, order.id));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="animate-pop rounded-2xl border-2 border-ink bg-white p-8 text-center sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint">
          <PartyPopper className="h-8 w-8 text-ink" />
        </span>
        <h1 className="mt-5 font-display text-4xl font-black">
          It&apos;s yours!
        </h1>
        <p className="mt-3 text-ink-soft">
          Order confirmed for <strong className="text-ink">{order.email}</strong>.
          Total paid: <strong className="text-ink">{formatPrice(order.totalCents)}</strong>{" "}
          <span className="text-xs">(demo — no charge made)</span>
        </p>
        <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-butter bg-butter/20 p-3 text-left text-xs leading-relaxed text-ink-soft">
          <Bookmark className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
          <span>
            <strong className="text-ink">Save this page&apos;s link.</strong> It&apos;s
            your permanent download page — bookmark it to re-download your files
            anytime.
          </span>
        </div>
      </div>

      <h2 className="mt-10 mb-4 font-display text-2xl font-black">
        Your downloads
      </h2>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li
            key={item.id}
            className="flex animate-fade-up flex-col gap-4 rounded-xl border-2 border-ink bg-white p-4 sm:flex-row sm:items-center"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-24 w-24 shrink-0 rounded-lg border border-ink/20 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-semibold">{item.title}</p>
              <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                {item.kind === "wallpaper" ? (
                  <Smartphone className="h-3 w-3" />
                ) : (
                  <Frame className="h-3 w-3" />
                )}
                {item.kind === "wallpaper" ? "Phone wallpaper" : "Wall art print"}{" "}
                · by {item.artist}
              </p>
            </div>
            <a
              href={`/api/download/${order.token}/${item.id}`}
              className="flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-butter px-5 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#16161a]"
            >
              <Download className="h-4 w-4" /> Download file
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-xl border-2 border-dashed border-ink/30 bg-white/60 p-6 text-sm leading-relaxed text-ink-soft">
        <p className="font-semibold text-ink">What now?</p>
        {items.some((i) => i.kind === "wall_art") && (
          <p className="mt-2">
            🖼 <strong>Wall art:</strong> print at home on matte photo paper, or
            upload the file to a local print shop / online printing service and
            pick a frame size you like.
          </p>
        )}
        {items.some((i) => i.kind === "wallpaper") && (
          <p className="mt-2">
            📱 <strong>Wallpaper:</strong> send the file to your phone (AirDrop,
            email, cloud drive), then set it as your lock or home screen.
          </p>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-6 py-3 text-sm font-bold text-paper transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#2742e8]"
        >
          Back to the gallery
        </Link>
      </div>
    </div>
  );
}