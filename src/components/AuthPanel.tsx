"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogIn,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  bio: string;
  isOwner: boolean;
};

export default function AuthPanel({
  onAuthed,
  ownerHint = false,
  compact = false,
}: {
  onAuthed: (user: SessionUser) => void;
  ownerHint?: boolean;
  compact?: boolean;
}) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = mode === "signup" && confirm.length > 0 && confirm !== password;
  const matches = mode === "signup" && confirm.length > 0 && confirm === password;

  const submit = async () => {
    setError(null);
    if (mode === "signup" && password !== confirm) {
      setError("The two passwords don't match — retype them and check the eye icon to see what you typed.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not sign you in.");
      onAuthed(data.artist);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign you in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border-2 border-ink bg-white ${compact ? "p-5" : "p-6 sm:p-8"}`}
    >
      <div className="flex gap-2">
        <button
          onClick={() => setMode("signup")}
          className={`flex items-center gap-1.5 rounded-full border-2 border-ink px-4 py-1.5 text-xs font-bold transition-colors ${
            mode === "signup" ? "bg-ink text-paper" : "bg-white"
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" /> Create account
        </button>
        <button
          onClick={() => setMode("login")}
          className={`flex items-center gap-1.5 rounded-full border-2 border-ink px-4 py-1.5 text-xs font-bold transition-colors ${
            mode === "login" ? "bg-ink text-paper" : "bg-white"
          }`}
        >
          <LogIn className="h-3.5 w-3.5" /> Log in
        </button>
      </div>

      <h2 className="mt-4 font-display text-2xl font-black">
        {mode === "signup" ? "Get your own studio" : "Welcome back"}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        {mode === "signup"
          ? "Email + password. Your listings, edits and payouts stay tied to this account only."
          : "Log in to manage your listings and see your sales."}
      </p>

      {ownerHint && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-cobalt/30 bg-cobalt/5 p-3 text-xs leading-relaxed text-ink-soft">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" />
          <span>
            No owner exists yet — the first account created here becomes the{" "}
            <strong className="text-ink">shop owner</strong> with full control of
            every listing and the admin panel.
          </span>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {mode === "signup" && (
          <label className="block text-sm font-semibold">
            Artist or shop name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Studio Mara"
              className="mt-1.5 w-full rounded-lg border-2 border-ink bg-paper px-3.5 py-2.5 text-sm font-normal outline-none focus:shadow-[3px_3px_0_0_#2742e8]"
            />
          </label>
        )}
        <label className="block text-sm font-semibold">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-lg border-2 border-ink bg-paper px-3.5 py-2.5 text-sm font-normal outline-none focus:shadow-[3px_3px_0_0_#2742e8]"
          />
        </label>
        <label className="block text-sm font-semibold">
          Password
          <div className="relative mt-1.5">
            <KeyRound className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="At least 8 characters"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="w-full rounded-lg border-2 border-ink bg-paper py-2.5 pr-11 pl-10 text-sm font-normal outline-none focus:shadow-[3px_3px_0_0_#2742e8]"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-ink-soft transition-colors hover:text-ink"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        {mode === "signup" && (
          <label className="block text-sm font-semibold">
            Confirm password
            <div className="relative mt-1.5">
              <KeyRound className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <input
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Type it once more"
                autoComplete="new-password"
                className={`w-full rounded-lg border-2 bg-paper py-2.5 pr-11 pl-10 text-sm font-normal outline-none focus:shadow-[3px_3px_0_0_#2742e8] ${
                  mismatch ? "border-red-500" : matches ? "border-emerald-600" : "border-ink"
                }`}
              />
              {matches && (
                <Check className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-emerald-600" />
              )}
            </div>
            {mismatch && (
              <span className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5" /> Passwords don&apos;t match yet
              </span>
            )}
            {matches && (
              <span className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <Check className="h-3.5 w-3.5" /> Passwords match
              </span>
            )}
          </label>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={busy || mismatch || (mode === "signup" && confirm.length === 0)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-cobalt py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#16161a] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> One moment…
          </>
        ) : mode === "signup" ? (
          <>
            <UserPlus className="h-4 w-4" /> Create my account
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" /> Log in
          </>
        )}
      </button>
      <p className="mt-3 text-center text-[11px] text-ink-soft">
        Passwords are stored as salted scrypt hashes, never in plain text. Use the
        eye icon to check for typos before saving.
      </p>
    </div>
  );
}