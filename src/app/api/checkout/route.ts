import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { artworks, orders, orderItems } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { email, itemIds } = (await req.json()) ?? {};
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Enter a valid email — your download link is tied to it." },
        { status: 400 }
      );
    }
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }
    const ids = [...new Set(itemIds.map(Number).filter(Number.isInteger))];
    const items = await db
      .select()
      .from(artworks)
      .where(inArray(artworks.id, ids));
    if (items.length === 0) {
      return NextResponse.json(
        { error: "None of the items in your cart exist anymore." },
        { status: 400 }
      );
    }

    const totalCents = items.reduce((s, i) => s + i.priceCents, 0);
    const token = randomBytes(16).toString("hex");

    // Demo checkout: no payment processor is connected yet.
    // Swap this for a Stripe Checkout session to take real money.
    const [order] = await db
      .insert(orders)
      .values({ email: cleanEmail, token, totalCents })
      .returning();

    await db.insert(orderItems).values(
      items.map((i) => ({
        orderId: order.id,
        artworkId: i.id,
        priceCents: i.priceCents,
      }))
    );

    await db
      .update(artworks)
      .set({ sales: sql`${artworks.sales} + 1` })
      .where(inArray(artworks.id, ids));

    return NextResponse.json({ token });
  } catch (err) {
    console.error("POST /api/checkout failed", err);
    return NextResponse.json(
      { error: "Checkout failed. Please try again." },
      { status: 500 }
    );
  }
}