import { NextResponse } from "next/server";
import { eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { artworks, artists, orderItems, orders } from "@/db/schema";
import { isAdminKey } from "@/lib/admin";
import { currentArtist } from "@/lib/auth";

async function authorize(id: number, body: Record<string, unknown>) {
  const rows = await db
    .select({ art: artworks, artistEmail: artists.email })
    .from(artworks)
    .innerJoin(artists, eq(artworks.artistId, artists.id))
    .where(eq(artworks.id, id))
    .limit(1);
  if (rows.length === 0) return { error: "Artwork not found.", status: 404 } as const;

  const viewer = await currentArtist();
  const admin = viewer?.isOwner === true || isAdminKey(body.key);
  const owner = !!viewer && viewer.email === rows[0].artistEmail;
  if (!admin && !owner) {
    return { error: "You don't have permission to change this listing.", status: 403 } as const;
  }
  return { row: rows[0] } as const;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Bad request." }, { status: 400 });
    }
    const body = (await req.json()) ?? {};
    const auth = await authorize(id, body);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const updates: Record<string, unknown> = {};
    const u = body.updates ?? {};
    if (typeof u.title === "string" && u.title.trim().length >= 2) {
      updates.title = u.title.trim();
    }
    if (typeof u.description === "string") updates.description = u.description.trim();
    if (typeof u.tags === "string") updates.tags = u.tags.trim();
    if (u.priceCents !== undefined) {
      const price = Number(u.priceCents);
      if (!Number.isInteger(price) || price < 99 || price > 99900) {
        return NextResponse.json(
          { error: "Price must be between $0.99 and $999.00." },
          { status: 400 }
        );
      }
      updates.priceCents = price;
    }
    if (typeof u.featured === "boolean") updates.featured = u.featured;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    await db.update(artworks).set(updates).where(eq(artworks.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/artworks/[id] failed", err);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Bad request." }, { status: 400 });
    }
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      /* DELETE without body */
    }
    const auth = await authorize(id, body);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // remove the artwork from any orders, then clean up emptied orders
    await db.delete(orderItems).where(eq(orderItems.artworkId, id));
    const orphaned = await db
      .select({ orderId: orders.id })
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .where(isNull(orderItems.id));
    if (orphaned.length > 0) {
      await db
        .delete(orders)
        .where(inArray(orders.id, orphaned.map((o) => o.orderId)));
    }
    await db.delete(artworks).where(eq(artworks.id, id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/artworks/[id] failed", err);
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}