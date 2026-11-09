"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Frame,
  Smartphone,
  ShoppingBag,
  Upload,
  LayoutDashboard,
  Compass,
  Rocket,
  Store,
} from "lucide-react";
import { useCart } from "./CartContext";

const links = [
  { href: "/", label: "Marketplace", icon: Store },
  { href: "/sell", label: "Sell your art", icon: Upload },
  { href: "/dashboard", label: "Seller studio", icon: LayoutDashboard },
  { href: "/guide", label: "$0 launch guide", icon: Compass },
  { href: "/access", label: "Access", icon: Rocket },
];

export default function Header() {
  const { items } = useCart();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-paper transition-transform duration-300 group-hover:-rotate-6">
            <Frame className="h-5 w-5" />
            <Smartphone className="absolute -right-1.5 -bottom-1.5 h-4.5 w-4.5 rounded bg-cobalt p-0.5 text-white" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-bold tracking-tight">
              Wallora
            </span>
            <span className="mt-0.5 text-[9px] font-bold tracking-[0.32em] text-cobalt uppercase">
              Smart Art
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:bg-paper-warm hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/cart"
          className="relative flex items-center gap-2 rounded-full border-2 border-ink bg-butter px-4 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#16161a]"
        >
          <ShoppingBag className="h-4.5 w-4.5" />
          <span className="hidden sm:inline">Cart</span>
          {items.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cobalt px-1 text-xs font-bold text-white">
              {items.length}
            </span>
          )}
        </Link>
      </div>

      {/* mobile nav */}
      <nav className="flex gap-1 overflow-x-auto border-t border-ink/10 px-3 py-1.5 md:hidden">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                active ? "bg-ink text-paper" : "text-ink-soft"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}