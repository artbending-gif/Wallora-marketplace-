import { NextResponse } from "next/server";
import { and, eq, isNull, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { artists, artworks, sessions } from "@/db/schema";
import { isAdminKey } from "@/lib/admin";
import {
  currentArtist,
  endSession,
  hashPassword,
  validEmail,
  verifyPassword,
  startSession,
} from "@/lib/auth";

export async function GET() {
  const artist = await currentArtist();
  return NextResponse.json({ artist });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) ?? {};
    const action = String(body.action ?? "");

    if (action === "logout") {
      await endSession();
      return NextResponse.json({ ok: true });
    }

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (action === "login") {
      const [artist] = await db
        .select()
        .from(artists)
        .where(eq(artists.email, email))
        .limit(1);
      if (!artist || !verifyPassword(password, artist.passwordHash)) {
        return NextResponse.json(
          { error: "That email and password don't match an account." },
          { status: 401 }
        );
      }
      await startSession(artist.id);
      return NextResponse.json({
        artist: {
          id: artist.id,
          name: artist.name,
          email: artist.email,
          bio: artist.bio,
          isOwner: artist.isOwner,
        },
      });
    }

    if (action === "signup") {
      const name = String(body.name ?? "").trim();
      if (name.length < 2) {
        return NextResponse.json({ error: "Enter your artist or shop name." }, { status: 400 });
      }
      if (!validEmail(email)) {
        return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
      }
      if (password.length < 8) {
        return NextResponse.json(
          { error: "Use a password with at least 8 characters." },
          { status: 400 }
        );
      }
      const [existing] = await db
        .select({ id: artists.id })
        .from(artists)
        .where(eq(artists.email, email))
        .limit(1);
      if (existing) {
        return NextResponse.json(
          { error: "That email already has an account — log in instead." },
          { status: 409 }
        );
      }

      // The first account to sign up becomes the shop owner.
      const [{ count: ownerCount }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(artists)
        .where(eq(artists.isOwner, true));
      const isOwner = ownerCount === 0;

      const [artist] = await db
        .insert(artists)
        .values({
          name,
          email,
          bio: String(body.bio ?? "").trim(),
          passwordHash: hashPassword(password),
          isOwner,
        })
        .returning();

      if (isOwner) {
        // Adopt the starter catalogue from any passwordless (demo) artist accounts.
        const orphans = await db
          .select({ id: artists.id })
          .from(artists)
          .where(and(isNull(artists.passwordHash), ne(artists.id, artist.id)));
        for (const orphan of orphans) {
          await db
            .update(artworks)
            .set({ artistId: artist.id })
            .where(eq(artworks.artistId, orphan.id));
          await db.delete(artists).where(eq(artists.id, orphan.id));
        }
      }

      await startSession(artist.id);
      return NextResponse.json({
        artist: {
          id: artist.id,
          name: artist.name,
          email: artist.email,
          bio: artist.bio,
          isOwner: artist.isOwner,
        },
      });
    }

    if (action === "reset") {
      // Owner (or the server-side recovery key) can set a new password.
      const viewer = await currentArtist();
      const allowed = viewer?.isOwner === true || isAdminKey(body.key);
      if (!allowed) {
        return NextResponse.json(
          { error: "Only the shop owner can reset a password." },
          { status: 403 }
        );
      }
      if (!validEmail(email)) {
        return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
      }
      if (password.length < 8) {
        return NextResponse.json(
          { error: "The new password needs at least 8 characters." },
          { status: 400 }
        );
      }
      const [target] = await db
        .select({ id: artists.id })
        .from(artists)
        .where(eq(artists.email, email))
        .limit(1);
      if (!target) {
        return NextResponse.json({ error: "No account uses that email." }, { status: 404 });
      }
      await db
        .update(artists)
        .set({ passwordHash: hashPassword(password) })
        .where(eq(artists.id, target.id));
      // Force a fresh login everywhere.
      await db.delete(sessions).where(eq(sessions.artistId, target.id));
      return NextResponse.json({ ok: true, email });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("POST /api/auth failed", err);
    return NextResponse.json({ error: "Sign-in failed. Please try again." }, { status: 500 });
  }
}