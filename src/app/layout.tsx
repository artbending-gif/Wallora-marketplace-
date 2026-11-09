import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Frame, Smartphone, Heart } from "lucide-react";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Wallora — Smart Art | Digital Wall Art & Phone Wallpapers",
  description:
    "A marketplace for printable wall art and phone wallpapers. Buy instantly, download instantly — or upload your own art and start selling for free.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="grain min-h-screen bg-paper font-body text-ink antialiased">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <footer className="mt-20 border-t-2 border-ink bg-ink text-paper">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-paper text-ink">
                    <Frame className="h-5 w-5" />
                    <Smartphone className="absolute -right-1.5 -bottom-1.5 h-4.5 w-4.5 rounded bg-cobalt p-0.5 text-white" />
                  </span>
                  <span className="flex flex-col leading-none">
                    <span className="font-display text-xl font-bold">
                      Wallora
                    </span>
                    <span className="mt-0.5 text-[9px] font-bold tracking-[0.32em] text-butter uppercase">
                      Smart Art
                    </span>
                  </span>
                </div>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/60">
                  Independent digital art for your walls and your pocket.
                  Instant downloads, fair prices, artists keep 90%.
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-[0.2em] text-paper/50 uppercase">
                  Explore
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li><Link className="transition-colors hover:text-butter" href="/">Marketplace</Link></li>
                  <li><Link className="transition-colors hover:text-butter" href="/?kind=wall_art">Wall art prints</Link></li>
                  <li><Link className="transition-colors hover:text-butter" href="/?kind=wallpaper">Phone wallpapers</Link></li>
                  <li><Link className="transition-colors hover:text-butter" href="/cart">Your cart</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-[0.2em] text-paper/50 uppercase">
                  For artists
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li><Link className="transition-colors hover:text-butter" href="/sell">Upload &amp; sell your art</Link></li>
                  <li><Link className="transition-colors hover:text-butter" href="/dashboard">Seller studio</Link></li>
                  <li><Link className="transition-colors hover:text-butter" href="/guide">Launch with $0 — the guide</Link></li>
                  <li><Link className="transition-colors hover:text-butter" href="/deploy">Deploy your shop (free)</Link></li>
                  <li><Link className="transition-colors hover:text-butter" href="/access">Access &amp; storage</Link></li>
                  <li><Link className="transition-colors hover:text-butter" href="/admin">Owner tools (Admin)</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-paper/10 py-5 text-center text-xs text-paper/40">
              <span className="inline-flex items-center gap-1.5">
                Made with <Heart className="h-3 w-3 text-butter" /> for
                independent artists · Demo checkout — connect Stripe to accept
                real payments
              </span>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}