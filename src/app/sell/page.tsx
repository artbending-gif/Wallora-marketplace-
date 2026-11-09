"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Frame,
  ImagePlus,
  Info,
  Loader2,
  Rocket,
  Smartphone,
  Upload,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import AuthPanel, { type SessionUser } from "@/components/AuthPanel";

type Step = 1 | 2 | 3;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 1800;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => reject(new Error("Could not read that image file."));
    img.src = url;
  });
}

export default function SellPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [booting, setBooting] = useState(true);
  const [step, setStep] = useState<Step>(1);
  const [image, setImage] = useState<string | null>(null);
  const [kind, setKind] = useState<"wall_art" | "wallpaper">("wall_art");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [price, setPrice] = useState("6.00");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedId, setPublishedId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const priceCents = Math.round(parseFloat(price || "0") * 100) || 0;

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.artist);
        if (d.artist?.bio) setBio(d.artist.bio);
      })
      .finally(() => setBooting(false));
  }, []);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG or PNG).");
      return;
    }
    try {
      setImage(await compressImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read image.");
    }
  };

  const publish = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          kind,
          tags,
          priceCents,
          imageDataUrl: image,
          artistBio: bio,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Publishing failed.");
      setPublishedId(data.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publishing failed.");
    } finally {
      setBusy(false);
    }
  };

  if (publishedId !== null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="animate-pop rounded-2xl border-2 border-ink bg-white p-10 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint">
            <BadgeCheck className="h-8 w-8" />
          </span>
          <h1 className="mt-5 font-display text-4xl font-black">
            You&apos;re live!
          </h1>
          <p className="mt-3 text-ink-soft">
            “{title}” is now listed on the marketplace for{" "}
            <strong className="text-ink">{formatPrice(priceCents)}</strong>.
            Track sales anytime in your Seller Studio — you&apos;re signed in as{" "}
            <strong className="text-ink">{user?.email}</strong>.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={`/art/${publishedId}`}
              className="rounded-full border-2 border-ink bg-cobalt px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#16161a]"
            >
              View your listing
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border-2 border-ink bg-butter px-6 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#16161a]"
            >
              Open Seller Studio
            </Link>
            <button
              onClick={() => {
                setPublishedId(null);
                setStep(1);
                setImage(null);
                setTitle("");
                setDescription("");
                setTags("");
              }}
              className="rounded-full border-2 border-ink bg-paper px-6 py-3 text-sm font-bold transition-all hover:-translate-y-0.5"
            >
              List another
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (booting) {
    return (
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-24 text-sm text-ink-soft sm:px-6">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking your session…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-4xl font-black sm:text-5xl">
          Sell your art. <span className="text-cobalt italic">Keep 90%.</span>
        </h1>
        <p className="mt-3 text-ink-soft">
          Create a free seller account to publish — it takes about 20 seconds
          and keeps your listings and earnings private to you.
        </p>
        <div className="mt-6">
          <AuthPanel onAuthed={setUser} ownerHint />
        </div>
      </div>
    );
  }

  const steps = [
    { n: 1, label: "Your artwork" },
    { n: 2, label: "Details & price" },
    { n: 3, label: "About you" },
  ];

  const canNext1 = !!image;
  const canNext2 = title.trim().length >= 2 && priceCents >= 99;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-black sm:text-5xl">
          Sell your art.{" "}
          <span className="text-cobalt italic">Keep 90%.</span>
        </h1>
        <p className="mt-3 text-lg text-ink-soft">
          Free to list, no subscriptions, no shipping. Upload once — sell
          forever.
        </p>
      </div>

      {/* stepper */}
      <ol className="mt-8 flex gap-2 sm:gap-4">
        {steps.map(({ n, label }) => (
          <li key={n} className="flex-1">
            <button
              onClick={() => n < step && setStep(n as Step)}
              className={`w-full rounded-lg border-2 border-ink px-3 py-2.5 text-left text-xs font-bold transition-colors sm:text-sm ${
                step === n
                  ? "bg-ink text-paper"
                  : step > n
                    ? "bg-mint"
                    : "bg-white text-ink-soft"
              }`}
            >
              <span className="flex items-center gap-2">
                {step > n ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-paper text-[11px] text-ink">
                    {n}
                  </span>
                )}
                {label}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border-2 border-ink bg-white p-6 sm:p-8">
          {step === 1 && (
            <div className="animate-fade-up space-y-6">
              <div>
                <h2 className="font-display text-xl font-bold">
                  What are you selling?
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {(
                    [
                      { v: "wall_art", label: "Wall art print", icon: Frame, hint: "Posters, paintings, photos people print & frame" },
                      { v: "wallpaper", label: "Phone wallpaper", icon: Smartphone, hint: "Tall images sized for phone screens" },
                    ] as const
                  ).map(({ v, label, icon: Icon, hint }) => (
                    <button
                      key={v}
                      onClick={() => setKind(v)}
                      className={`rounded-xl border-2 border-ink p-4 text-left transition-all ${
                        kind === v
                          ? "bg-cobalt text-white shadow-[4px_4px_0_0_#16161a]"
                          : "bg-paper hover:-translate-y-0.5"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <p className="mt-2 text-sm font-bold">{label}</p>
                      <p className={`mt-1 text-xs ${kind === v ? "text-white/75" : "text-ink-soft"}`}>
                        {hint}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-display text-xl font-bold">Upload the file</h2>
                <p className="mt-1 text-xs text-ink-soft">
                  JPG or PNG. We auto-optimize it for fast previews — tip: upload
                  your highest-quality version.
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    onFile(e.dataTransfer.files?.[0]);
                  }}
                  className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/40 bg-paper px-6 py-10 transition-colors hover:border-cobalt hover:bg-cobalt/5"
                >
                  <ImagePlus className="h-8 w-8 text-cobalt" />
                  <span className="text-sm font-bold">
                    {image ? "Replace image" : "Click or drag an image here"}
                  </span>
                  <span className="text-xs text-ink-soft">
                    {kind === "wallpaper"
                      ? "Best: tall 9:19 ratio (e.g. 1170 × 2532)"
                      : "Best: 3000px+ on the long side for crisp prints"}
                  </span>
                </button>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!canNext1}
                className="flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-6 py-3 text-sm font-bold text-paper transition-all enabled:hover:-translate-y-0.5 enabled:hover:shadow-[4px_4px_0_0_#2742e8] disabled:opacity-40"
              >
                Next: details <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-up space-y-5">
              <label className="block text-sm font-semibold">
                Title *
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midnight Tide"
                  className="mt-1.5 w-full rounded-lg border-2 border-ink bg-paper px-3.5 py-2.5 text-sm font-normal outline-none focus:shadow-[3px_3px_0_0_#2742e8]"
                />
              </label>
              <label className="block text-sm font-semibold">
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What inspired this piece? What's included?"
                  className="mt-1.5 w-full rounded-lg border-2 border-ink bg-paper px-3.5 py-2.5 text-sm font-normal outline-none focus:shadow-[3px_3px_0_0_#2742e8]"
                />
              </label>
              <label className="block text-sm font-semibold">
                Tags <span className="font-normal text-ink-soft">(comma separated — helps buyers find you)</span>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="abstract, blue, minimal"
                  className="mt-1.5 w-full rounded-lg border-2 border-ink bg-paper px-3.5 py-2.5 text-sm font-normal outline-none focus:shadow-[3px_3px_0_0_#2742e8]"
                />
              </label>
              <div>
                <label className="block text-sm font-semibold">
                  Price (USD) *
                  <div className="relative mt-1.5">
                    <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-bold">$</span>
                    <input
                      type="number"
                      min="0.99"
                      step="0.5"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-lg border-2 border-ink bg-paper py-2.5 pr-3.5 pl-8 text-sm font-normal outline-none focus:shadow-[3px_3px_0_0_#2742e8]"
                    />
                  </div>
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(kind === "wallpaper" ? ["1.99", "2.99", "3.99"] : ["4.99", "7.99", "12.99"]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPrice(p)}
                      className={`rounded-full border-2 border-ink px-3 py-1 text-xs font-bold transition-colors ${
                        price === p ? "bg-butter" : "bg-white hover:bg-paper-warm"
                      }`}
                    >
                      ${p}
                    </button>
                  ))}
                  <span className="flex items-center gap-1 text-xs text-ink-soft">
                    <Info className="h-3 w-3" /> typical prices
                  </span>
                </div>
                <p className="mt-3 rounded-lg bg-mint/50 p-3 text-sm">
                  You earn{" "}
                  <strong>{formatPrice(Math.round(priceCents * 0.9))}</strong>{" "}
                  per sale (90% after the 10% platform fee).
                </p>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-5 py-3 text-sm font-bold"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canNext2}
                  className="flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-6 py-3 text-sm font-bold text-paper transition-all enabled:hover:-translate-y-0.5 enabled:hover:shadow-[4px_4px_0_0_#2742e8] disabled:opacity-40"
                >
                  Next: about you <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-up space-y-5">
              <div className="rounded-xl border-2 border-ink bg-mint/40 p-4">
                <p className="flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase">
                  <BadgeCheck className="h-4 w-4" /> Publishing as
                </p>
                <p className="mt-1.5 font-display text-lg font-bold">{user?.name}</p>
                <p className="text-sm text-ink-soft">{user?.email}</p>
                <p className="mt-2 text-xs text-ink-soft">
                  Your listing is tied to this account — only you (and the shop
                  owner) can edit it. <Link href="/dashboard" className="font-semibold text-cobalt underline">Open my studio</Link>
                </p>
              </div>

              <label className="block text-sm font-semibold">
                Update your public bio <span className="font-normal text-ink-soft">(optional)</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Tell buyers who you are in one or two sentences."
                  className="mt-1.5 w-full rounded-lg border-2 border-ink bg-paper px-3.5 py-2.5 text-sm font-normal outline-none focus:shadow-[3px_3px_0_0_#2742e8]"
                />
              </label>

              <div className="flex items-start gap-2.5 rounded-lg border border-cobalt/30 bg-cobalt/5 p-3 text-xs leading-relaxed text-ink-soft">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" />
                Only upload art you created yourself or have the rights to sell.
                Buyers receive a personal-use license.
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-5 py-3 text-sm font-bold"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={publish}
                  disabled={busy}
                  className="flex items-center gap-2 rounded-full border-2 border-ink bg-cobalt px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#16161a] disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Publishing…
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" /> Publish listing — free
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* live preview */}
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-ink-soft uppercase">
            <Upload className="h-3.5 w-3.5" /> Live preview
          </p>
          <div className="mt-3 flex min-h-[380px] items-center justify-center rounded-2xl border-2 border-ink bg-paper-warm p-8">
            {image ? (
              kind === "wallpaper" ? (
                <div className="phone-shell w-48 animate-pop">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="Preview" className="block aspect-[9/19] w-full object-cover" />
                </div>
              ) : (
                <div className="frame-wood w-full max-w-[260px] animate-pop">
                  <div className="bg-white p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="Preview" className="block w-full" />
                  </div>
                </div>
              )
            ) : (
              <div className="text-center text-ink-soft">
                <ImagePlus className="mx-auto h-10 w-10 opacity-40" />
                <p className="mt-3 text-sm">
                  Your art appears here as buyers will see it
                </p>
              </div>
            )}
          </div>
          {image && (
            <div className="mt-3 rounded-xl border-2 border-ink bg-white p-4">
              <p className="font-display text-lg font-semibold">
                {title || "Untitled piece"}
              </p>
              <p className="text-xs text-ink-soft">
                by {user?.name ?? "you"} ·{" "}
                <span className="font-bold text-ink">{formatPrice(priceCents)}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}