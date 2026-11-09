"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  Frame,
  Loader2,
  Lock,
  Package,
  Receipt,
  Smartphone,
  Star,
  Trash2,
  Upload,
  Users,
  Wand2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import AuthPanel, { type SessionUser } from "@/components/AuthPanel";

type Listing = {
  id: number;
  title: string;
  kind: string;
  priceCents: number;
  imageUrl: string;
  sales: number;
  featured: boolean;
  artist: string;
  artistEmail: string;
};

type Stats = { artworks: number; artists: number; orders: number; grossCents: number };

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resetErr, setResetErr] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const load = useCallback(async (k: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin?key=${encodeURIComponent(k)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load admin data.");
      setListings(data.listings);
      setStats(data.stats);
      if (k) localStorage.setItem("wallora-admin-key", k);
    } catch (e) {
      setListings(null);
      setStats(null);
      setError(e instanceof Error ? e.message : "Load failed.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then(async (d) => {
        setUser(d.artist);
        setChecked(true);
        if (d.artist?.isOwner) {
          await load("");
          return;
        }
        const saved = localStorage.getItem("wallora-admin-key");
        if (saved) {
          setKey(saved);
          await load(saved);
        }
      })
      .catch(() => setChecked(false));
  }, [load]);

  const patch = async (id: number, updates: Record<string, unknown>) => {
    setBusyId(id);
    const res = await fetch(`/api/artworks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, updates }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Update failed.");
    } else {
      await load(key);
    }
    setBusyId(null);
  };

  const editPrice = async (l: Listing) => {
    const next = window.prompt(`New price for “${l.title}” (USD):`, (l.priceCents / 100).toFixed(2));
    if (next === null) return;
    const cents = Math.round(parseFloat(next) * 100);
    if (!Number.isFinite(cents) || cents < 99) {
      setError("Price must be at least $0.99.");
      return;
    }
    await patch(l.id, { priceCents: cents });
  };

  const doReset = async () => {
    setResetErr(null);
    setResetMsg(null);
    if (resetPassword !== resetConfirm) {
      setResetErr("The two passwords don't match.");
      return;
    }
    if (resetPassword.length < 8) {
      setResetErr("The new password needs at least 8 characters.");
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset",
          email: resetEmail.trim().toLowerCase(),
          password: resetPassword,
          key,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reset failed.");
      setResetMsg(`Password updated for ${data.email}. They can log in with the new one now.`);
      setResetEmail("");
      setResetPassword("");
      setResetConfirm("");
    } catch (e) {
      setResetErr(e instanceof Error ? e.message : "Reset failed.");
    } finally {
      setResetting(false);
    }
  };

  const remove = async (l: Listing) => {
    if (!window.confirm(`Delete “${l.title}” permanently? This cannot be undone.`)) return;
    setBusyId(l.id);
    const res = await fetch(`/api/artworks/${l.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Delete failed.");
    } else {
      await load(key);
    }
    setBusyId(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-butter px-4 py-1.5 text-xs font-bold tracking-wide uppercase">
        <Lock className="h-4 w-4" /> Owner tools
      </p>
      <h1 className="mt-4 font-display text-4xl font-black sm:text-5xl">Admin</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Manage every listing in the shop — swap demo art out, put your real
        products in, and watch the numbers.
      </p>

      {checked && user?.isOwner && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border-2 border-ink bg-mint px-4 py-3">
          <ShieldCheck className="h-5 w-5" />
          <p className="text-sm">
            Signed in as <strong>{user.email}</strong> — owner access to every
            listing.
          </p>
          <Link
            href="/dashboard"
            className="ml-auto rounded-full border-2 border-ink bg-white px-4 py-1.5 text-xs font-bold"
          >
            Go to my studio
          </Link>
        </div>
      )}

      {checked && !user?.isOwner && !listings && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <AuthPanel onAuthed={(u) => { setUser(u); if (u.isOwner) load(""); }} ownerHint />
          <div className="rounded-2xl border-2 border-ink bg-paper-warm p-6">
            <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase">
              <Lock className="h-4 w-4" /> Recovery key
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Lost owner access? The server-side recovery key still works. Set
              your own with the <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">ADMIN_KEY</code>{" "}
              environment variable.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load(key)}
                placeholder="Recovery key"
                className="w-full rounded-full border-2 border-ink bg-white px-4 py-2 text-sm outline-none focus:shadow-[3px_3px_0_0_#2742e8]"
              />
              <button
                onClick={() => load(key)}
                disabled={busy}
                className="rounded-full border-2 border-ink bg-ink px-4 py-2 text-sm font-bold text-paper disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlock"}
              </button>
            </div>
            <p className="mt-3 text-[11px] text-ink-soft">
              Default key for this demo: <code className="font-mono">wallora-admin</code>
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>
      )}

      {listings && stats && (
        <div className="animate-fade-up">
          {/* stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { icon: Package, label: "Listings", value: String(stats.artworks) },
              { icon: Users, label: "Artists", value: String(stats.artists) },
              { icon: Receipt, label: "Orders", value: String(stats.orders) },
              { icon: BarChart3, label: "Gross sales", value: formatPrice(stats.grossCents) },
            ].map(({ icon: Icon, label, value }, i) => (
              <div
                key={label}
                className="animate-fade-up rounded-xl border-2 border-ink bg-white p-5"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Icon className="h-5 w-5 text-cobalt" />
                <p className="mt-3 font-display text-3xl font-black">{value}</p>
                <p className="text-xs font-medium tracking-wide text-ink-soft uppercase">{label}</p>
              </div>
            ))}
          </div>

          {/* replace products */}
          <div className="mt-8 rounded-2xl border-2 border-ink bg-cobalt p-6 text-white">
            <h2 className="font-display text-2xl font-black">
              Swap in your own products
            </h2>
            <div className="mt-3 grid gap-3 text-sm leading-relaxed text-white/85 md:grid-cols-2">
              <p>
                <strong className="text-butter">1. Delete the demo art</strong>{" "}
                — use the 🗑 button on any listing below. Demo listings belong
                to example artists, so only the admin key can remove them.
              </p>
              <p>
                <strong className="text-butter">2. Upload your files</strong> —
                open <Link href="/sell" className="font-bold text-white underline">Sell your art</Link>,
                drag &amp; drop each image, set the price, publish. Your shop is
                now 100% your products.
              </p>
            </div>
          </div>

          {/* account recovery */}
          <div className="mt-8 rounded-2xl border-2 border-ink bg-white p-6">
            <h2 className="flex items-center gap-2 font-display text-2xl font-black">
              <KeyRound className="h-5 w-5 text-cobalt" /> Reset an account password
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Typo&apos;d a password at signup, or a seller forgot theirs? Set a
              new one here — no email needed. Their old sessions are signed out.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Account email"
                className="rounded-lg border-2 border-ink bg-paper px-3.5 py-2.5 text-sm outline-none focus:shadow-[3px_3px_0_0_#2742e8]"
              />
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="New password (8+ chars)"
                className="rounded-lg border-2 border-ink bg-paper px-3.5 py-2.5 text-sm outline-none focus:shadow-[3px_3px_0_0_#2742e8]"
              />
              <input
                type="password"
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
                placeholder="Confirm new password"
                className={`rounded-lg border-2 bg-paper px-3.5 py-2.5 text-sm outline-none focus:shadow-[3px_3px_0_0_#2742e8] ${
                  resetConfirm && resetConfirm !== resetPassword
                    ? "border-red-500"
                    : resetConfirm && resetConfirm === resetPassword
                      ? "border-emerald-600"
                      : "border-ink"
                }`}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={doReset}
                disabled={resetting || !resetEmail || !resetPassword}
                className="flex items-center gap-2 rounded-full border-2 border-ink bg-cobalt px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#16161a] disabled:opacity-50"
              >
                {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Set new password
              </button>
              {resetConfirm && resetConfirm !== resetPassword && (
                <span className="text-xs font-medium text-red-600">
                  Passwords don&apos;t match yet
                </span>
              )}
              {resetMsg && (
                <span className="text-xs font-semibold text-emerald-700">{resetMsg}</span>
              )}
              {resetErr && (
                <span className="text-xs font-semibold text-red-600">{resetErr}</span>
              )}
            </div>
          </div>

          {/* listings table */}
          <h2 className="mt-10 mb-4 border-b-2 border-ink pb-3 font-display text-2xl font-black">
            All listings ({listings.length})
          </h2>
          <ul className="space-y-3">
            {listings.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border-2 border-ink bg-white p-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={l.imageUrl}
                  alt={l.title}
                  className="h-16 w-16 shrink-0 rounded-lg border border-ink/20 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link href={`/art/${l.id}`} className="font-display font-semibold hover:text-cobalt">
                    {l.title}
                  </Link>
                  <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                    {l.kind === "wallpaper" ? (
                      <Smartphone className="h-3 w-3" />
                    ) : (
                      <Frame className="h-3 w-3" />
                    )}
                    {l.artist} ({l.artistEmail}) · {l.sales} sold
                  </p>
                </div>
                <span className="font-display font-bold">{formatPrice(l.priceCents)}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => patch(l.id, { featured: !l.featured })}
                    disabled={busyId === l.id}
                    title={l.featured ? "Remove Popular badge" : "Mark as Popular"}
                    className={`rounded-full border-2 border-ink p-2 transition-colors ${
                      l.featured ? "bg-butter" : "bg-white hover:bg-paper-warm"
                    }`}
                  >
                    <Star className={`h-4 w-4 ${l.featured ? "fill-ink" : ""}`} />
                  </button>
                  <button
                    onClick={() => editPrice(l)}
                    disabled={busyId === l.id}
                    className="rounded-full border-2 border-ink bg-white px-3 py-1.5 text-xs font-bold transition-colors hover:bg-paper-warm"
                  >
                    Edit price
                  </button>
                  <a
                    href={`/art/${l.id}`}
                    title="View listing"
                    className="rounded-full border-2 border-ink bg-white p-2 transition-colors hover:bg-paper-warm"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => remove(l)}
                    disabled={busyId === l.id}
                    title="Delete listing"
                    className="rounded-full border-2 border-ink bg-white p-2 text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    {busyId === l.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {listings.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-ink/30 bg-white/60 p-12 text-center">
              <Upload className="mx-auto h-9 w-9 text-ink-soft" />
              <p className="mt-3 font-display text-xl font-bold">The shop is empty</p>
              <p className="mt-1 text-sm text-ink-soft">
                Perfect starting point — publish your real products now.
              </p>
              <Link
                href="/sell"
                className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-butter px-6 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#16161a]"
              >
                <Upload className="h-4 w-4" /> Upload your art
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}