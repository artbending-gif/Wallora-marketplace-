"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2 } from "lucide-react";

export type CartItem = {
  id: number;
  title: string;
  artist: string;
  kind: string;
  priceCents: number;
  imageUrl: string;
};

type CartCtx = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: number) => void;
  clear: () => void;
  has: (id: number) => boolean;
  totalCents: number;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "wallora-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev;
      return [...prev, item];
    });
    setToast(`“${item.title}” added to cart`);
  }, []);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      add,
      remove,
      clear,
      has: (id: number) => items.some((p) => p.id === id),
      totalCents: items.reduce((s, i) => s + i.priceCents, 0),
    }),
    [items, add, remove, clear]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 animate-pop">
          <div className="flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper shadow-2xl">
            <CheckCircle2 className="h-4.5 w-4.5 text-mint" />
            {toast}
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}