"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Download,
  Frame,
  Image as ImageIcon,
  ShoppingBag,
  Smartphone,
  Zap,
} from "lucide-react";
import { useCart, type CartItem } from "./CartContext";
import { formatPrice } from "@/lib/utils";

type View = "flat" | "mockup";

type DetailItem = CartItem & { previewUrl?: string };

export default function ArtDetail({ item }: { item: DetailItem }) {
  const full = item.previewUrl ?? item.imageUrl;
  const { add, has } = useCart();
  const router = useRouter();
  const [view, setView] = useState<View>("mockup");
  const inCart = has(item.id);
  const isWallpaper = item.kind === "wallpaper";

  const buyNow = () => {
    add(item);
    router.push("/cart");
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      {/* preview stage */}
      <div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("mockup")}
            className={`flex items-center gap-1.5 rounded-full border-2 border-ink px-4 py-1.5 text-xs font-bold transition-colors ${
              view === "mockup" ? "bg-ink text-paper" : "bg-white"
            }`}
          >
            {isWallpaper ? (
              <Smartphone className="h-3.5 w-3.5" />
            ) : (
              <Frame className="h-3.5 w-3.5" />
            )}
            {isWallpaper ? "On a phone" : "In a frame"}
          </button>
          <button
            onClick={() => setView("flat")}
            className={`flex items-center gap-1.5 rounded-full border-2 border-ink px-4 py-1.5 text-xs font-bold transition-colors ${
              view === "flat" ? "bg-ink text-paper" : "bg-white"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" /> Artwork only
          </button>
        </div>

        <div
          className={`relative mt-4 flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border-2 border-ink p-8 sm:p-12 ${
            view === "mockup" && !isWallpaper
              ? "bg-[linear-gradient(180deg,#e8e4da_0%,#e8e4da_78%,#c9c2b2_78%,#b8b09d_100%)]"
              : "bg-paper-warm"
          }`}
        >
          {view === "flat" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={full}
              alt={item.title}
              className="max-h-[560px] w-auto max-w-full animate-pop rounded shadow-xl"
            />
          ) : isWallpaper ? (
            <div className="phone-shell w-56 animate-pop sm:w-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={full}
                alt={item.title}
                className="block aspect-[9/19] w-full object-cover"
              />
              <div className="absolute inset-x-0 top-12 text-center text-white drop-shadow-lg">
                <p className="text-sm font-medium opacity-90">Tue, June 9</p>
                <p className="font-display text-5xl font-semibold">9:41</p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-sm animate-pop">
              <div className="frame-wood mx-auto w-full">
                <div className="bg-white p-4 sm:p-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={full} alt={item.title} className="block w-full" />
                </div>
              </div>
              <div className="mx-auto mt-8 h-3 w-3/4 rounded-full bg-ink/15 blur-sm" />
            </div>
          )}
          <span className="absolute right-4 bottom-4 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-medium text-paper">
            Preview mockup — you receive the full-resolution file
          </span>
        </div>
      </div>

      {/* buy panel */}
      <div className="animate-fade-up">
        <div className="rounded-2xl border-2 border-ink bg-white p-6 sm:p-8 lg:sticky lg:top-28">
          <p className="font-display text-4xl font-black">
            {formatPrice(item.priceCents)}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            One-time purchase · personal-use license
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={buyNow}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-cobalt py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#16161a]"
            >
              <Zap className="h-4 w-4" /> Buy now — instant download
            </button>
            <button
              onClick={() => add(item)}
              disabled={inCart}
              className={`flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink py-3.5 text-sm font-bold transition-all ${
                inCart
                  ? "bg-mint"
                  : "bg-paper hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#16161a]"
              }`}
            >
              {inCart ? (
                <>
                  <Check className="h-4 w-4" /> Already in your cart
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" /> Add to cart
                </>
              )}
            </button>
          </div>

          <ul className="mt-7 space-y-3 border-t-2 border-dashed border-ink/20 pt-6 text-sm">
            <li className="flex gap-2.5">
              <Download className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" />
              High-resolution file, delivered instantly after checkout
            </li>
            <li className="flex gap-2.5">
              {isWallpaper ? (
                <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" />
              ) : (
                <Frame className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" />
              )}
              {isWallpaper
                ? "Sized for modern phone screens — set it as your lock or home screen"
                : "Print at home, at a local shop, or via a print-on-demand service"}
            </li>
            <li className="flex gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" />
              Keep it forever — re-download anytime with your order link
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}