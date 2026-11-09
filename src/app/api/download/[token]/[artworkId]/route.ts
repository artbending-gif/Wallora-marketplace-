import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { artworks, orderItems, orders } from "@/db/schema";
import { slugify } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string; artworkId: string }> }
) {
  const { token, artworkId } = await params;
  const id = Number(artworkId);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.token, token))
    .limit(1);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const [item] = await db
    .select()
    .from(orderItems)
    .where(and(eq(orderItems.orderId, order.id), eq(orderItems.artworkId, id)))
    .limit(1);
  if (!item) {
    return NextResponse.json(
      { error: "This artwork is not part of that order." },
      { status: 403 }
    );
  }

  const [art] = await db
    .select()
    .from(artworks)
    .where(eq(artworks.id, id))
    .limit(1);
  if (!art) {
    return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
  }

  let buffer: Buffer;
  let mime = "image/jpeg";

  if (art.imageUrl.startsWith("data:")) {
    const match = art.imageUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Stored file is invalid." }, { status: 500 });
    }
    mime = match[1];
    buffer = Buffer.from(match[2], "base64");
  } else {
    const relative = art.imageUrl.replace(/^\/+/, "");
    if (relative.includes("..")) {
      return NextResponse.json({ error: "Invalid path." }, { status: 400 });
    }
    try {
      buffer = await readFile(path.join(process.cwd(), "public", relative));
    } catch {
      return NextResponse.json({ error: "File missing on server." }, { status: 404 });
    }
    if (relative.endsWith(".png")) mime = "image/png";
  }

  const ext = mime === "image/png" ? "png" : "jpg";
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${slugify(art.title)}-wallora.${ext}"`,
      "Cache-Control": "private, no-store",
    },
  });
}