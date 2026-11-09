import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { artworks, artists } from "@/db/schema";
import { currentArtist } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      kind,
      tags,
      priceCents,
      imageDataUrl,
      artistBio,
    } = body ?? {};

    const artist = await currentArtist();
    if (!artist) {
      return NextResponse.json(
        { error: "Please sign in (or create a seller account) before publishing." },
        { status: 401 }
      );
    }

    if (typeof title !== "string" || title.trim().length < 2) {
      return NextResponse.json(
        { error: "Please give your artwork a title (at least 2 characters)." },
        { status: 400 }
      );
    }
    if (kind !== "wall_art" && kind !== "wallpaper") {
      return NextResponse.json(
        { error: "Choose a category: wall art or phone wallpaper." },
        { status: 400 }
      );
    }
    const price = Number(priceCents);
    if (!Number.isInteger(price) || price < 99 || price > 99900) {
      return NextResponse.json(
        { error: "Price must be between $0.99 and $999.00." },
        { status: 400 }
      );
    }
    if (
      typeof imageDataUrl !== "string" ||
      !imageDataUrl.startsWith("data:image/") ||
      imageDataUrl.length > 6_000_000
    ) {
      return NextResponse.json(
        { error: "Please upload a valid image (max ~4 MB after compression)." },
        { status: 400 }
      );
    }
    if (typeof artistBio === "string" && artistBio.trim()) {
      await db
        .update(artists)
        .set({ bio: artistBio.trim() })
        .where(eq(artists.id, artist.id));
    }

    const [art] = await db
      .insert(artworks)
      .values({
        artistId: artist.id,
        title: title.trim(),
        description: String(description ?? "").trim(),
        kind,
        tags: String(tags ?? "").trim(),
        priceCents: price,
        imageUrl: imageDataUrl,
      })
      .returning({ id: artworks.id });

    return NextResponse.json({ id: art.id });
  } catch (err) {
    console.error("POST /api/artworks failed", err);
    return NextResponse.json(
      { error: "Something went wrong while publishing. Please try again." },
      { status: 500 }
    );
  }
}