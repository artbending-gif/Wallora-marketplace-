import Link from "next/link";
import {
  ArrowRight,
  Cloud,
  Database,
  FileCode2,
  FolderGit2,
  Globe,
  KeyRound,
  LifeBuoy,
  Rocket,
  ServerCog,
  Sprout,
  Timer,
} from "lucide-react";
import CopyBlock from "@/components/CopyBlock";
import DeployChecklist from "@/components/DeployChecklist";

export const metadata = {
  title: "Deploy for free — Wallora",
};

const steps = [
  {
    n: "1",
    icon: FolderGit2,
    title: "Put the code on GitHub",
    time: "~5 minutes",
    intro:
      "Vercel deploys straight from a GitHub repo — every time you push a change, the site updates automatically.",
    points: [
      "Create a free account at github.com, then click + → New repository. Name it wallora. Do not add a README when creating the empty repo.",
      "First, download/export the Wallora project as a folder onto your laptop. The preview URL is only a running website; it is not a code download. Find the folder containing package.json, src/, and public/.",
      "In Git Bash, cd into THAT project folder (not C:/Users/YourName). Run pwd and ls package.json to confirm. Then run git init, git add ., git commit, and git push. The included .gitignore excludes .env, node_modules and .next.",
      "Do not upload .env or your Neon connection string to GitHub. Check git status before committing.",
    ],
    command: null,
  },
  {
    n: "2",
    icon: Database,
    title: "Create a free PostgreSQL database",
    time: "~3 minutes",
    intro:
      "The app stores artists, artworks and orders in PostgreSQL. Neon.tech gives you a free cloud database — no credit card.",
    points: [
      "Sign up free at neon.tech (or supabase.com — both work). Create a project and pick the region closest to you.",
      "Copy the connection string it shows you. It looks like: postgresql://user:password@ep-something.us-east-2.aws.neon.tech/neondb?sslmode=require",
      "Important: this string is a secret. Never post it publicly or commit it to GitHub.",
    ],
    command: null,
  },
  {
    n: "3",
    icon: KeyRound,
    title: "Point your project at the new database",
    time: "~2 minutes",
    intro:
      "On your computer, open the .env file in the project root and replace DATABASE_URL with your Neon connection string.",
    points: [
      "Locally (on your own computer) this lets you run the next step. On Vercel you'll add the same variable in step 5.",
      "Keep the ?sslmode=require part — cloud databases require a secure connection.",
    ],
    command: 'DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"',
    commandLabel: ".env file",
  },
  {
    n: "4",
    icon: ServerCog,
    title: "Create the tables in the database",
    time: "~1 minute",
    intro:
      "Run this once from your project folder (with the .env from step 3 in place). It creates the artists, artworks, orders and order_items tables in your new Neon database.",
    points: [
      "You need Node.js installed locally — nodejs.org, LTS version, free.",
      "Run it again any time the schema changes.",
    ],
    command: "npx drizzle-kit push",
    commandLabel: "Terminal, from the project root",
  },
  {
    n: "5",
    icon: Cloud,
    title: "Deploy to Vercel (free)",
    time: "~5 minutes",
    intro:
      "Vercel's Hobby plan is free forever for projects like this and runs Next.js natively — it's literally the same platform Next.js is built for.",
    points: [
      "Sign up free at vercel.com with your GitHub account.",
      "Click Add New → Project → Import your wallora repo. Vercel detects Next.js automatically — leave the framework and build settings as they are.",
      "Before clicking Deploy, open Environment Variables and add one: key DATABASE_URL, value = your Neon connection string (with ?sslmode=require). Mark it sensitive if asked.",
      "Hit Deploy. In about a minute you get a live URL like your-app.vercel.app. Every future git push redeploys automatically.",
    ],
    command: null,
  },
  {
    n: "6",
    icon: Sprout,
    title: "Fill the shop — start selling",
    time: "Day one",
    intro:
      "The deployed app starts with an empty gallery, which is perfect: every listing should be real.",
    points: [
      "Go to your-app.vercel.app/sell and upload your first artwork. Publishing creates your artist account and the listing instantly — no seed data needed.",
      "Test the full loop yourself: list an item, buy it through the cart (demo checkout), download the file from the order page.",
      "Check /dashboard with the email you used to see your Seller Studio populate.",
    ],
    command: null,
  },
];

const later = [
  {
    title: "Real payments — Stripe",
    text: "Create a free Stripe account, add STRIPE_SECRET_KEY to Vercel's environment variables, and replace the demo checkout with a Stripe Checkout session. No monthly fee — only a % per sale. Stripe Connect then auto-pays your sellers.",
  },
  {
    icon: Globe,
    title: "Custom domain (~$10/year)",
    text: "Buy a domain (Cloudflare or Namecheap are cheapest), then add it in Vercel → Project → Domains. Vercel handles SSL automatically. This is the only thing worth spending on early.",
  },
  {
    icon: Database,
    title: "Free-tier limits to know",
    text: "Neon free: 0.5 GB storage & monthly compute — thousands of listings fit easily. Vercel Hobby: 100 GB bandwidth/month. If images grow large, move them to Cloudflare R2 (10 GB free) later.",
  },
];

export default function DeployPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-mint px-4 py-1.5 text-xs font-bold tracking-wide uppercase">
        <Rocket className="h-4 w-4" /> Total cost to go live: $0
      </p>
      <h1 className="mt-5 font-display text-4xl font-black tracking-tight sm:text-6xl">
        Deploy your shop in{" "}
        <span className="text-cobalt italic">about 20 minutes.</span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
        Three free accounts (GitHub, Neon, Vercel) and six steps. You&apos;ll
        finish with a live public URL that updates itself every time you change
        the code. Do these in order.
      </p>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border-2 border-ink bg-white p-5">
        <Timer className="h-6 w-6 shrink-0 text-cobalt" />
        <p className="text-sm leading-relaxed text-ink-soft">
          <strong className="text-ink">The stack:</strong> GitHub (code) →
          Vercel (hosting, free) → Neon (PostgreSQL database, free). All three
          have no-credit-card free tiers that comfortably run this shop.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border-2 border-ink bg-white p-6 sm:p-8">
        <h2 className="font-display text-2xl font-black">Using Git Bash on Windows?</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          If the prompt says <code className="font-mono">~</code> or{" "}
          <code className="font-mono">/c/Users/Paul</code>, you are in your whole
          user folder, <strong className="text-ink">not the Wallora project</strong>.
          That is why <code className="font-mono">git add .</code> tries to read
          protected Windows folders. First export/download the project as a
          folder, then navigate to the folder containing <code className="font-mono">package.json</code>.
        </p>
        <div className="mt-4 rounded-xl bg-ink p-4 text-paper">
          <CopyBlock label="Example only — change Downloads/wallora to your actual project location" command={'cd "/c/Users/Paul/Downloads/wallora"'} />
          <CopyBlock label="Confirm you are in the project" command="pwd && ls package.json" />
          <CopyBlock label="Only after package.json appears" command="git init && git add . && git status" />
          <CopyBlock label="Commit the project" command={'git commit -m "Initial Wallora app"'} />
          <CopyBlock label="Replace YOUR_USERNAME with your GitHub username" command="git remote add origin https://github.com/YOUR_USERNAME/wallora.git" />
          <CopyBlock label="Push to GitHub" command="git branch -M main && git push -u origin main" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Already ran <code className="font-mono">git init</code> in your home folder?
          That did <strong className="text-ink">not damage your Windows files</strong>.
          Simply leave that folder; do not run <code className="font-mono">git add .</code> there again.
          You can remove the accidental <code className="font-mono">C:\\Users\\Paul\\.git</code> folder later,
          but only after checking it was created by that mistaken command and contains no work you need.
        </p>
      </div>

      <DeployChecklist />

      <ol className="mt-12 space-y-10">
        {steps.map(({ n, icon: Icon, title, time, intro, points, command, commandLabel }, i) => (
          <li
            key={n}
            className="animate-fade-up relative rounded-2xl border-2 border-ink bg-white p-6 sm:p-8"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ink bg-butter font-display text-2xl font-black">
                {n}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] text-ink-soft uppercase">
                  <Icon className="h-3.5 w-3.5" /> Step {n} · {time}
                </p>
                <h2 className="font-display text-xl font-black sm:text-2xl">{title}</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">{intro}</p>

            {command && (
              <div className="mt-4 rounded-xl border-2 border-ink bg-ink p-4">
                <CopyBlock command={command} label={commandLabel ?? "Command"} />
              </div>
            )}

            {points.length > 0 && (
              <ul className="mt-4 space-y-3">
                {points.map((p) => (
                  <li key={p} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-paper-warm text-[11px] font-bold text-ink">
                      ✓
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>

      {/* troubleshooting */}
      <section className="mt-14 rounded-2xl border-2 border-ink bg-white p-6 sm:p-8">
        <h2 className="flex items-center gap-2 font-display text-2xl font-black">
          <LifeBuoy className="h-6 w-6 text-cobalt" /> If something breaks
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
          <li>
            <strong className="text-ink">“DATABASE_URL is required” on Vercel:</strong>{" "}
            you skipped the environment variable in step 5. Add DATABASE_URL in
            Vercel → Settings → Environment Variables, then redeploy.
          </li>
          <li>
            <strong className="text-ink">Tables not found / empty site errors:</strong>{" "}
            step 4 didn&apos;t run against the right database. Check your local{" "}
            <code className="rounded bg-paper-warm px-1.5 py-0.5 font-mono text-xs">.env</code>{" "}
            points at the Neon URL, then run{" "}
            <code className="rounded bg-paper-warm px-1.5 py-0.5 font-mono text-xs">npx drizzle-kit push</code>{" "}
            again.
          </li>
          <li>
            <strong className="text-ink">Connection timeouts:</strong> make sure
            your Neon URL ends with{" "}
            <code className="rounded bg-paper-warm px-1.5 py-0.5 font-mono text-xs">?sslmode=require</code>.
          </li>
          <li>
            <strong className="text-ink">Build logs:</strong> in Vercel → Project
            → Deployments, click a deployment and read the build output — it
            almost always names the exact problem.
          </li>
        </ul>
      </section>

      {/* after launch */}
      <h2 className="mt-14 mb-5 border-b-2 border-ink pb-3 font-display text-3xl font-black">
        After launch (in priority order)
      </h2>
      <div className="grid gap-5 md:grid-cols-3">
        {later.map(({ title, text }, i) => (
          <div
            key={title}
            className="animate-fade-up rounded-2xl border-2 border-ink bg-paper-warm p-5"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-white">
              {i === 0 ? (
                <FileCode2 className="h-5 w-5 text-cobalt" />
              ) : i === 1 ? (
                <Globe className="h-5 w-5 text-cobalt" />
              ) : (
                <Database className="h-5 w-5 text-cobalt" />
              )}
            </span>
            <h3 className="mt-3 font-display text-lg font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border-2 border-ink bg-cobalt p-8 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-black">
            Ready? Start at step 1.
          </h2>
          <p className="mt-1 text-sm text-white/75">
            And once you&apos;re live, read the $0 launch guide to get your
            first sales.
          </p>
        </div>
        <Link
          href="/guide"
          className="flex items-center gap-2 rounded-full border-2 border-ink bg-butter px-6 py-3 text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#16161a]"
        >
          Open the launch guide <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}