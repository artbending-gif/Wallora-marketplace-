import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, ne } from "drizzle-orm";
import { ArrowLeft, Frame, Palette, Smartphone, Tag } from "lucide-react";
import { db } from "@/db";
import { artworks, artists } from "@/db/schema";
import ArtDetail from "@/components/ArtDetail";
import ArtCard from "@/components/ArtCard";
import { kindLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ArtPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artId = Number(id);
  if (!Number.isInteger(artId)) notFound();

  const rows = await db
    .select()
    .from(artworks)
    .innerJoin(artists, eq(artworks.artistId, artists.id))
    .where(eq(artworks.id, artId))
    .limit(1);

  if (rows.length === 0) notFound();
  const { artworks: art, artists: artist } = rows[0];

  const more = await db
    .select({
      id: artworks.id,
      title: artworks.title,
      kind: artworks.kind,
      priceCents: artworks.priceCents,
      imageUrl: artworks.imageUrl,
      sales: artworks.sales,
      featured: artworks.featured,
      artist: artists.name,
      previewUrl: artworks.previewUrl,
    })
    .from(artworks)
    .innerJoin(artists, eq(artworks.artistId, artists.id))
    .where(and(eq(artworks.artistId, artist.id), ne(artworks.id, art.id)))
    .orderBy(desc(artworks.createdAt))
    .limit(4);

  const tags = art.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-cobalt"
      >
        <ArrowLeft className="h-4 w-4" /> Back to the gallery
      </Link>

      <div className="mt-5 mb-8 flex flex-wrap items-center gap-3">
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            art.kind === "wallpaper"
              ? "bg-cobalt text-white"
              : "bg-butter text-ink"
          }`}
        >
          {art.kind === "wallpaper" ? (
            <Smartphone className="h-3.5 w-3.5" />
          ) : (
            <Frame className="h-3.5 w-3.5" />
          )}
          {kindLabel(art.kind)}
        </span>
        <h1 className="w-full font-display text-4xl font-black tracking-tight sm:text-5xl">
          {art.title}
        </h1>
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          <Palette className="h-4 w-4" /> by{" "}
          <span className="font-semibold text-ink">{artist.name}</span>
          {art.sales > 0 && <span>· {art.sales} sold</span>}
        </p>
      </div>

      <ArtDetail
        item={{
          id: art.id,
          title: art.title,
          artist: artist.name,
          kind: art.kind,
          priceCents: art.priceCents,
          imageUrl: art.imageUrl,
          previewUrl: art.previewUrl ?? art.imageUrl,
        }}
      />

      {(art.description || tags.length > 0 || artist.bio) && (
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {art.description && (
            <div className="rounded-2xl border-2 border-ink bg-white p-6">
              <h2 className="font-display text-xl font-bold">
                About this piece
              </h2>
              <p className="mt-3 leading-relaxed text-ink-soft">
                {art.description}
              </p>
              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1 rounded-full bg-paper-warm px-3 py-1 text-xs font-medium"
                    >
                      <Tag className="h-3 w-3" /> {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="rounded-2xl border-2 border-ink bg-white p-6">
            <h2 className="font-display text-xl font-bold">The artist</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cobalt font-display text-lg font-bold text-white">
                {artist.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-semibold">{artist.name}</p>
                <p className="text-xs text-ink-soft">
                  Independent artist on Wallora
                </p>
              </div>
            </div>
            {artist.bio && (
              <p className="mt-4 leading-relaxed text-ink-soft">{artist.bio}</p>
            )}
          </div>
        </div>
      )}

      {more.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 border-b-2 border-ink pb-3 font-display text-2xl font-black">
            More from {artist.name}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {more.map((m, i) => (
              <ArtCard key={m.id} art={m} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}