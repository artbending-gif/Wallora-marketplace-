import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { artworks, artists, orders } from "@/db/schema";
import { isAdminKey } from "@/lib/admin";
import { currentArtist } from "@/lib/auth";

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  const artist = await currentArtist();
  const allowed = artist?.isOwner === true || isAdminKey(key);
  if (!allowed) {
    return NextResponse.json(
      { error: "Owner access required. Sign in with the owner account." },
      { status: 401 }
    );
  }

  const listings = await db
    .select({
      id: artworks.id,
      title: artworks.title,
      kind: artworks.kind,
      priceCents: artworks.priceCents,
      imageUrl: artworks.imageUrl,
      sales: artworks.sales,
      featured: artworks.featured,
      artist: artists.name,
      artistEmail: artists.email,
    })
    .from(artworks)
    .innerJoin(artists, eq(artworks.artistId, artists.id))
    .orderBy(desc(artworks.createdAt));

  const [artworkCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(artworks);
  const [artistCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(artists);
  const [orderStats] = await db
    .select({
      c: sql<number>`count(*)::int`,
      gross: sql<number>`coalesce(sum(total_cents),0)::int`,
    })
    .from(orders);

  return NextResponse.json({
    listings,
    stats: {
      artworks: artworkCount?.c ?? 0,
      artists: artistCount?.c ?? 0,
      orders: orderStats?.c ?? 0,
      grossCents: orderStats?.gross ?? 0,
    },
  });
}