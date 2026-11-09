"use client";

import { useEffect, useState } from "react";
import { Check, RotateCcw, Rocket } from "lucide-react";

type Task = { id: string; label: string; hint?: string };
type Phase = { key: string; title: string; blurb: string; tasks: Task[] };

const phases: Phase[] = [
  {
    key: "github",
    title: "Phase 1 · GitHub",
    blurb: "Put the code somewhere safe that Vercel can read.",
    tasks: [
      { id: "gh-account", label: "Create a free GitHub account", hint: "github.com/signup" },
      { id: "gh-repo", label: "Make a new empty repository (private is fine)", hint: "name it wallora" },
      { id: "gh-folder", label: "Download/export the Wallora source folder to your laptop", hint: "the preview URL is not the source code" },
      { id: "gh-check", label: "In Git Bash: cd into that folder, then run pwd && ls package.json", hint: "never run git add . from C:/Users/YourName" },
      { id: "gh-upload", label: "Commit and push the project from inside that folder", hint: ".gitignore protects .env, node_modules and .next" },
      { id: "gh-public", label: "Confirm your images are included", hint: "public/art/ folder should be in the repo" },
    ],
  },
  {
    key: "neon",
    title: "Phase 2 · Neon database",
    blurb: "A free cloud PostgreSQL for accounts, listings and orders.",
    tasks: [
      { id: "neon-account", label: "Sign up free at neon.tech", hint: "no credit card required" },
      { id: "neon-project", label: "Create a project in the region closest to you" },
      { id: "neon-copy", label: "Copy the connection string (postgresql://…)", hint: "keep the ?sslmode=require part" },
      { id: "neon-env", label: "Paste it into your local .env as DATABASE_URL" },
      { id: "neon-push", label: "Run: npx drizzle-kit push", hint: "creates the tables in Neon" },
    ],
  },
  {
    key: "vercel",
    title: "Phase 3 · Vercel",
    blurb: "Free hosting with HTTPS, redeployed on every push.",
    tasks: [
      { id: "vercel-account", label: "Sign up at vercel.com with GitHub" },
      { id: "vercel-import", label: "Add New → Project → import your repo", hint: "keep default Next.js settings" },
      { id: "vercel-db", label: "Add env var DATABASE_URL = your Neon string" },
      { id: "vercel-key", label: "Add env var ADMIN_KEY = a long random secret", hint: "your password-recovery key" },
      { id: "vercel-deploy", label: "Click Deploy and wait for the 🎉" },
      { id: "vercel-live", label: "Open your *.vercel.app URL and visit /api/health", hint: "should say {\"ok\":true}" },
    ],
  },
  {
    key: "launch",
    title: "Phase 4 · Claim & launch",
    blurb: "Make it yours, then start selling.",
    tasks: [
      { id: "launch-owner", label: "Go to /admin and create the owner account", hint: "first account = owner of the shop" },
      { id: "launch-test", label: "Buy something yourself to test the download loop" },
      { id: "launch-art", label: "Upload your real artwork at /sell" },
      { id: "launch-share", label: "Share the link on Pinterest / Instagram" },
    ],
  },
];

const STORAGE_KEY = "wallora-deploy-checklist";

export default function DeployChecklist() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
  }, [done, loaded]);

  const all = phases.flatMap((p) => p.tasks);
  const completed = all.filter((t) => done[t.id]).length;
  const pct = Math.round((completed / all.length) * 100);

  return (
    <div className="mt-10 rounded-2xl border-2 border-ink bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-black">
            <Rocket className="h-5 w-5 text-cobalt" /> Your deployment checklist
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Tick items as you go — progress is saved in this browser.
          </p>
        </div>
        <button
          onClick={() => setDone({})}
          className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-xs font-bold transition-colors hover:bg-paper-warm"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-bold">
          <span>
            {completed} of {all.length} done
          </span>
          <span className={pct === 100 ? "text-emerald-700" : "text-ink-soft"}>
            {pct === 100 ? "Live! 🎉" : `${pct}%`}
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-ink bg-paper">
          <div
            className={`h-full transition-all duration-500 ${pct === 100 ? "bg-mint" : "bg-cobalt"}`}
            style={{ width: `${Math.max(pct, 2)}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {phases.map((phase) => (
          <div key={phase.key} className="rounded-xl border-2 border-ink bg-paper p-4">
            <h3 className="font-display text-lg font-bold">{phase.title}</h3>
            <p className="text-xs text-ink-soft">{phase.blurb}</p>
            <ul className="mt-3 space-y-2">
              {phase.tasks.map((task) => {
                const checked = !!done[task.id];
                return (
                  <li key={task.id}>
                    <button
                      onClick={() =>
                        setDone((prev) => ({ ...prev, [task.id]: !prev[task.id] }))
                      }
                      className="flex w-full items-start gap-2.5 text-left"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-ink transition-colors ${
                          checked ? "bg-mint" : "bg-white"
                        }`}
                      >
                        {checked && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-sm leading-snug ${
                            checked ? "text-ink-soft line-through" : "font-medium"
                          }`}
                        >
                          {task.label}
                        </span>
                        {task.hint && (
                          <span className="block text-[11px] text-ink-soft">{task.hint}</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}