"use client";

import { useMemo, useState } from "react";
import { Frame, Smartphone, LayoutGrid, Search, SlidersHorizontal } from "lucide-react";
import ArtCard, { type ArtCardData } from "./ArtCard";

type Sort = "newest" | "price-asc" | "price-desc" | "popular";

const sorts: { value: Sort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "popular", label: "Best selling" },
  { value: "price-asc", label: "Price: low → high" },
  { value: "price-desc", label: "Price: high → low" },
];

export default function Gallery({
  artworks,
  initialKind,
}: {
  artworks: ArtCardData[];
  initialKind: string;
}) {
  const [kind, setKind] = useState(initialKind || "all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");

  const counts = useMemo(
    () => ({
      all: artworks.length,
      wall_art: artworks.filter((a) => a.kind === "wall_art").length,
      wallpaper: artworks.filter((a) => a.kind === "wallpaper").length,
    }),
    [artworks]
  );

  const filtered = useMemo(() => {
    let list = artworks.filter(
      (a) => kind === "all" || a.kind === kind
    );
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.artist.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.priceCents - b.priceCents);
    else if (sort === "price-desc") sorted.sort((a, b) => b.priceCents - a.priceCents);
    else if (sort === "popular") sorted.sort((a, b) => b.sales - a.sales);
    return sorted;
  }, [artworks, kind, query, sort]);

  const tabs = [
    { value: "all", label: "Everything", icon: LayoutGrid, count: counts.all },
    { value: "wall_art", label: "Wall art", icon: Frame, count: counts.wall_art },
    { value: "wallpaper", label: "Phone wallpapers", icon: Smartphone, count: counts.wallpaper },
  ];

  return (
    <div id="gallery">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map(({ value, label, icon: Icon, count }) => (
            <button
              key={value}
              onClick={() => setKind(value)}
              className={`flex items-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-sm font-bold transition-all ${
                kind === value
                  ? "bg-ink text-paper shadow-[3px_3px_0_0_#2742e8]"
                  : "bg-white hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#16161a]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  kind === value ? "bg-paper/20" : "bg-paper-warm"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <label className="relative flex-1 lg:w-64">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or artist…"
              className="w-full rounded-full border-2 border-ink bg-white py-2 pr-4 pl-10 text-sm outline-none placeholder:text-ink-soft/60 focus:shadow-[3px_3px_0_0_#2742e8]"
            />
          </label>
          <label className="relative">
            <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="appearance-none rounded-full border-2 border-ink bg-white py-2 pr-8 pl-10 text-sm font-medium outline-none focus:shadow-[3px_3px_0_0_#2742e8]"
            >
              {sorts.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-xl border-2 border-dashed border-ink/30 bg-white/60 p-16 text-center">
          <Search className="mx-auto h-8 w-8 text-ink-soft" />
          <p className="mt-3 font-display text-xl font-semibold">
            Nothing matches “{query}”
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Try a different word, or clear the filters.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setKind("all");
            }}
            className="mt-5 rounded-full border-2 border-ink bg-butter px-5 py-2 text-sm font-bold transition-transform hover:-translate-y-0.5"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="masonry mt-8">
          {filtered.map((art, i) => (
            <ArtCard key={art.id} art={art} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}