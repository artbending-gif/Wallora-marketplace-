"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Frame,
  Info,
  Loader2,
  Lock,
  ShoppingBag,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, remove, clear, totalCents } = useCart();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, itemIds: items.map((i) => i.id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed.");
      clear();
      router.push(`/order/${data.token}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-cobalt"
      >
        <ArrowLeft className="h-4 w-4" /> Keep browsing
      </Link>
      <h1 className="mt-4 font-display text-4xl font-black sm:text-5xl">
        Your cart
      </h1>

      {items.length === 0 ? (
        <div className="mt-10 animate-fade-up rounded-2xl border-2 border-dashed border-ink/30 bg-white/60 p-16 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-ink-soft" />
          <p className="mt-4 font-display text-2xl font-bold">
            Nothing here yet
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Your future favorite wall is one click away.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-butter px-6 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#16161a]"
          >
            Browse the gallery
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <ul className="space-y-4">
            {items.map((item, i) => (
              <li
                key={item.id}
                className="flex animate-fade-up items-center gap-4 rounded-xl border-2 border-ink bg-white p-4"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Link href={`/art/${item.id}`} className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-20 w-20 rounded-lg border border-ink/20 object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/art/${item.id}`}
                    className="truncate font-display text-lg font-semibold hover:text-cobalt"
                  >
                    {item.title}
                  </Link>
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
                <span className="font-display text-lg font-bold">
                  {formatPrice(item.priceCents)}
                </span>
                <button
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.title}`}
                  className="rounded-full p-2 text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </li>
            ))}
          </ul>

          <div className="h-fit rounded-2xl border-2 border-ink bg-white p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-xl font-bold">Checkout</h2>
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-cobalt/30 bg-cobalt/5 p-3 text-xs leading-relaxed text-ink-soft">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" />
              <span>
                <strong className="text-ink">Demo mode:</strong> no real money
                moves. The owner can connect Stripe (free to start) to accept
                real payments — see the{" "}
                <Link href="/guide" className="font-semibold text-cobalt underline">
                  $0 launch guide
                </Link>
                .
              </span>
            </div>

            <label className="mt-5 block text-sm font-semibold">
              Email for your downloads
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-lg border-2 border-ink bg-paper px-3.5 py-2.5 text-sm font-normal outline-none placeholder:text-ink-soft/50 focus:shadow-[3px_3px_0_0_#2742e8]"
              />
            </label>

            <dl className="mt-5 space-y-2 border-t-2 border-dashed border-ink/20 pt-4 text-sm">
              <div className="flex justify-between text-ink-soft">
                <dt>{items.length} digital item{items.length > 1 ? "s" : ""}</dt>
                <dd>{formatPrice(totalCents)}</dd>
              </div>
              <div className="flex justify-between text-ink-soft">
                <dt>Shipping</dt>
                <dd className="font-semibold text-emerald-700">Free — it&apos;s digital</dd>
              </div>
              <div className="flex justify-between pt-2 font-display text-2xl font-black">
                <dt>Total</dt>
                <dd>{formatPrice(totalCents)}</dd>
              </div>
            </dl>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <button
              onClick={checkout}
              disabled={busy}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-cobalt py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#16161a] disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" /> Complete purchase (demo)
                </>
              )}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
              <Lock className="h-3 w-3" /> Instant download link after checkout
            </p>
          </div>
        </div>
      )}
    </div>
  );
}