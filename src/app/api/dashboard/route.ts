import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { artworks, orderItems, orders } from "@/db/schema";
import { currentArtist } from "@/lib/auth";

export async function GET() {
  const artist = await currentArtist();
  if (!artist) {
    return NextResponse.json({ error: "Sign in to view your studio." }, { status: 401 });
  }

  const listings = await db
    .select()
    .from(artworks)
    .where(eq(artworks.artistId, artist.id))
    .orderBy(desc(artworks.createdAt));

  const sales = await db
    .select({
      id: orderItems.id,
      title: artworks.title,
      artworkId: artworks.id,
      priceCents: orderItems.priceCents,
      buyerEmail: orders.email,
      createdAt: orders.createdAt,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(artworks, eq(orderItems.artworkId, artworks.id))
    .where(eq(artworks.artistId, artist.id))
    .orderBy(desc(orders.createdAt))
    .limit(50);

  const grossCents = sales.reduce((s, x) => s + x.priceCents, 0);

  return NextResponse.json({
    artist,
    listings: listings.map((l) => ({
      id: l.id,
      title: l.title,
      kind: l.kind,
      priceCents: l.priceCents,
      imageUrl: l.imageUrl,
      sales: l.sales,
    })),
    sales,
    grossCents,
    payoutCents: Math.round(grossCents * 0.9),
  });
}