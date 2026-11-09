"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Frame,
  Loader2,
  LogIn,
  Package,
  Pencil,
  Receipt,
  Search,
  Smartphone,
  Trash2,
  Upload,
  Wallet,
  LogOut,
  X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import AuthPanel, { type SessionUser } from "@/components/AuthPanel";

type DashData = {
  artist: { id: number; name: string; email: string; bio: string } | null;
  listings?: {
    id: number;
    title: string;
    kind: string;
    priceCents: number;
    imageUrl: string;
    sales: number;
  }[];
  sales?: {
    id: number;
    title: string;
    artworkId: number;
    priceCents: number;
    buyerEmail: string;
    createdAt: string;
  }[];
  grossCents?: number;
  payoutCents?: number;
};

type Listing = {
  id: number;
  title: string;
  kind: string;
  priceCents: number;
  imageUrl: string;
  sales: number;
};

export default function DashboardPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [booting, setBooting] = useState(true);
  const [data, setData] = useState<DashData | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const lookup = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/dashboard");
      if (res.status === 401) {
        setUser(null);
        setData(null);
        return;
      }
      const json = await res.json();
      setData(json);
      if (json.artist) setUser((prev) => prev ?? { ...json.artist, id: 0 });
    } finally {
      setBusy(false);
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => {
        if (d.artist) {
          setUser(d.artist);
          return lookup();
        }
        setBooting(false);
      })
      .catch(() => setBooting(false));
  }, [lookup]);

  const logout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setUser(null);
    setData(null);
  };

  const openEdit = (l: Listing) => {
    setActionError(null);
    setEditing(l);
    setEditTitle(l.title);
    setEditPrice((l.priceCents / 100).toFixed(2));
  };

  const saveEdit = async () => {
    if (!editing) return;
    setActionBusy(true);
    setActionError(null);
    const cents = Math.round(parseFloat(editPrice) * 100);
    try {
      const res = await fetch(`/api/artworks/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: { title: editTitle, priceCents: Number.isFinite(cents) ? cents : undefined },
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not save changes.");
      setEditing(null);
      await lookup();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not save changes.");
    } finally {
      setActionBusy(false);
    }
  };

  const deleteListing = async (l: Listing) => {
    if (!window.confirm(`Delete “${l.title}” permanently? Buyers who already purchased keep nothing — only do this if you're sure.`)) return;
    setActionBusy(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/artworks/${l.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not delete listing.");
      await lookup();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not delete listing.");
    } finally {
      setActionBusy(false);
    }
  };

  const stats = data?.artist
    ? [
        { icon: Package, label: "Listings", value: String(data.listings?.length ?? 0) },
        { icon: BarChart3, label: "Total sales", value: String(data.sales?.length ?? 0) },
        { icon: Receipt, label: "Gross revenue", value: formatPrice(data.grossCents ?? 0) },
        { icon: Wallet, label: "Your payout (90%)", value: formatPrice(data.payoutCents ?? 0) },
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-black sm:text-5xl">
        Seller studio
      </h1>
      <p className="mt-2 text-ink-soft">
        Your listings, sales and earnings — all in one place.
      </p>

      {booting ? (
        <div className="mt-10 flex items-center gap-2 text-sm text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking your session…
        </div>
      ) : !user ? (
        <div className="mt-8 max-w-lg">
          <AuthPanel onAuthed={(u) => { setUser(u); lookup(); }} ownerHint />
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border-2 border-ink bg-white px-4 py-3">
          <span className="text-sm text-ink-soft">
            Signed in as <strong className="text-ink">{user.email}</strong>
            {user.isOwner && (
              <span className="ml-2 rounded-full bg-butter px-2 py-0.5 text-[11px] font-bold">
                OWNER
              </span>
            )}
          </span>
          <button
            onClick={logout}
            className="ml-auto flex items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-4 py-1.5 text-xs font-bold transition-colors hover:bg-paper-warm"
          >
            <LogOut className="h-3.5 w-3.5" /> Log out
          </button>
        </div>
      )}

      {data?.artist && (
        <div className="animate-fade-up">
          <div className="mt-8 flex items-center gap-4 rounded-2xl border-2 border-ink bg-white p-5">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cobalt font-display text-2xl font-bold text-white">
              {data.artist.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="font-display text-2xl font-bold">{data.artist.name}</p>
              <p className="text-sm text-ink-soft">{data.artist.email}</p>
            </div>
            <Link
              href="/sell"
              className="ml-auto hidden items-center gap-2 rounded-full border-2 border-ink bg-butter px-4 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#16161a] sm:flex"
            >
              <Upload className="h-4 w-4" /> New listing
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map(({ icon: Icon, label, value }, i) => (
              <div
                key={label}
                className="animate-fade-up rounded-xl border-2 border-ink bg-white p-5"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <Icon className="h-5 w-5 text-cobalt" />
                <p className="mt-3 font-display text-3xl font-black">{value}</p>
                <p className="text-xs font-medium tracking-wide text-ink-soft uppercase">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 mb-4 border-b-2 border-ink pb-3 font-display text-2xl font-black">
            Your listings
          </h2>
          {(data.listings?.length ?? 0) === 0 ? (
            <p className="text-sm text-ink-soft">No listings yet.</p>
          ) : (
            <>
            {actionError && (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
                {actionError}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.listings!.map((l) => (
                <div
                  key={l.id}
                  className="flex flex-col gap-3 rounded-xl border-2 border-ink bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#16161a]"
                >
                  <div className="flex items-center gap-3">
                    <Link href={`/art/${l.id}`} className="shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={l.imageUrl}
                        alt={l.title}
                        className="h-16 w-16 rounded-lg border border-ink/20 object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/art/${l.id}`}
                        className="block truncate font-display font-semibold hover:text-cobalt"
                      >
                        {l.title}
                      </Link>
                      <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                        {l.kind === "wallpaper" ? (
                          <Smartphone className="h-3 w-3" />
                        ) : (
                          <Frame className="h-3 w-3" />
                        )}
                        {formatPrice(l.priceCents)} · {l.sales} sold
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-emerald-700">
                        earned {formatPrice(Math.round(l.sales * l.priceCents * 0.9))}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-ink/10 pt-3">
                    <button
                      onClick={() => openEdit(l)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-xs font-bold transition-colors hover:bg-paper-warm"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => deleteListing(l)}
                      disabled={actionBusy}
                      className="flex items-center justify-center gap-1.5 rounded-full border-2 border-ink bg-white px-3 py-1.5 text-xs font-bold text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
               ))}
             </div>
            </>
           )}

           <h2 className="mt-12 mb-4 border-b-2 border-ink pb-3 font-display text-2xl font-black">
             Recent sales
           </h2>
          {(data.sales?.length ?? 0) === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-ink/30 bg-white/60 p-8 text-center text-sm text-ink-soft">
              No sales yet — share your listing links on Pinterest and Instagram
              to get your first one. The{" "}
              <Link href="/guide" className="font-semibold text-cobalt underline">
                guide
              </Link>{" "}
              shows you how, for free.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border-2 border-ink bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-ink bg-paper-warm text-left text-xs font-bold tracking-wide uppercase">
                    <th className="px-4 py-3">Artwork</th>
                    <th className="px-4 py-3">Buyer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Sale</th>
                    <th className="px-4 py-3 text-right">You earn</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sales!.map((s) => (
                    <tr key={s.id} className="border-b border-ink/10 last:border-0">
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/art/${s.artworkId}`} className="hover:text-cobalt">
                          {s.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{s.buyerEmail}</td>
                      <td className="px-4 py-3 text-ink-soft">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">{formatPrice(s.priceCents)}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">
                        {formatPrice(Math.round(s.priceCents * 0.9))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-6 rounded-lg border border-cobalt/30 bg-cobalt/5 p-4 text-xs leading-relaxed text-ink-soft">
            💡 <strong className="text-ink">About payouts:</strong> this demo
            tracks what you&apos;re owed. When the owner connects Stripe
            Connect, payouts to sellers happen automatically to their bank
            accounts. See the <Link href="/guide" className="font-semibold text-cobalt underline">$0 launch guide</Link>.
          </p>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/60 p-4">
          <div className="w-full max-w-md animate-pop rounded-2xl border-2 border-ink bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-xl font-black">Edit listing</h3>
              <button
                onClick={() => setEditing(null)}
                aria-label="Close"
                className="rounded-full p-1.5 text-ink-soft hover:bg-paper-warm"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={editing.imageUrl}
                alt={editing.title}
                className="h-14 w-14 rounded-lg border border-ink/20 object-cover"
              />
              <p className="text-xs text-ink-soft">
                {editing.kind === "wallpaper" ? "Phone wallpaper" : "Wall art print"} ·{" "}
                {editing.sales} sold
              </p>
            </div>
            <label className="mt-4 block text-sm font-semibold">
              Title
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-1.5 w-full rounded-lg border-2 border-ink bg-paper px-3.5 py-2.5 text-sm font-normal outline-none focus:shadow-[3px_3px_0_0_#2742e8]"
              />
            </label>
            <label className="mt-3 block text-sm font-semibold">
              Price (USD)
              <input
                type="number"
                min="0.99"
                step="0.5"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="mt-1.5 w-full rounded-lg border-2 border-ink bg-paper px-3.5 py-2.5 text-sm font-normal outline-none focus:shadow-[3px_3px_0_0_#2742e8]"
              />
            </label>
            {actionError && (
              <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
                {actionError}
              </p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 rounded-full border-2 border-ink bg-paper px-4 py-2.5 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={actionBusy}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-ink bg-cobalt px-4 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#16161a] disabled:opacity-60"
              >
                {actionBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}