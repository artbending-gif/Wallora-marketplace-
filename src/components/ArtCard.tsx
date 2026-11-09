"use client";

import Link from "next/link";
import { Frame, Smartphone, Plus, Check, Eye, Flame } from "lucide-react";
import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/utils";

export type ArtCardData = {
  id: number;
  title: string;
  artist: string;
  kind: string;
  priceCents: number;
  imageUrl: string;
  sales: number;
  featured: boolean;
};

export default function ArtCard({
  art,
  index = 0,
}: {
  art: ArtCardData;
  index?: number;
}) {
  const { add, has } = useCart();
  const inCart = has(art.id);
  const isWallpaper = art.kind === "wallpaper";

  return (
    <article
      className="group animate-fade-up overflow-hidden rounded-xl border-2 border-ink bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[6px_6px_0_0_#16161a]"
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      <Link href={`/art/${art.id}`} className="relative block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={art.imageUrl}
          alt={art.title}
          className="w-full transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="mb-4 flex items-center gap-1.5 rounded-full bg-paper px-4 py-2 text-xs font-bold text-ink">
            <Eye className="h-3.5 w-3.5" /> Preview in {isWallpaper ? "a phone" : "a frame"}
          </span>
        </div>
        <span
          className={`absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
            isWallpaper ? "bg-cobalt text-white" : "bg-butter text-ink"
          }`}
        >
          {isWallpaper ? (
            <Smartphone className="h-3 w-3" />
          ) : (
            <Frame className="h-3 w-3" />
          )}
          {isWallpaper ? "Wallpaper" : "Wall art"}
        </span>
        {art.featured && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-butter">
            <Flame className="h-3 w-3" /> Popular
          </span>
        )}
      </Link>

      <div className="flex items-start justify-between gap-3 border-t-2 border-ink p-4">
        <div className="min-w-0">
          <Link href={`/art/${art.id}`}>
            <h3 className="truncate font-display text-lg font-semibold leading-tight hover:text-cobalt">
              {art.title}
            </h3>
          </Link>
          <p className="mt-0.5 truncate text-xs text-ink-soft">
            by {art.artist}
            {art.sales > 0 && <span> · {art.sales} sold</span>}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="font-display text-lg font-bold">
            {formatPrice(art.priceCents)}
          </span>
          <button
            onClick={() =>
              add({
                id: art.id,
                title: art.title,
                artist: art.artist,
                kind: art.kind,
                priceCents: art.priceCents,
                imageUrl: art.imageUrl,
              })
            }
            disabled={inCart}
            className={`flex items-center gap-1 rounded-full border-2 border-ink px-3 py-1 text-xs font-bold transition-all ${
              inCart
                ? "bg-mint text-ink"
                : "bg-paper hover:bg-cobalt hover:text-white active:scale-95"
            }`}
          >
            {inCart ? (
              <>
                <Check className="h-3.5 w-3.5" /> In cart
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}