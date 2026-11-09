import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { artists, sessions } from "@/db/schema";

export const SESSION_COOKIE = "wallora_session";

export type SessionArtist = {
  id: number;
  name: string;
  email: string;
  bio: string;
  isOwner: boolean;
};

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

export async function startSession(artistId: number): Promise<void> {
  const token = randomBytes(32).toString("hex");
  await db.insert(sessions).values({ token, artistId });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.token, token));
  jar.delete(SESSION_COOKIE);
}

export async function currentArtist(): Promise<SessionArtist | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({
      id: artists.id,
      name: artists.name,
      email: artists.email,
      bio: artists.bio,
      isOwner: artists.isOwner,
    })
    .from(sessions)
    .innerJoin(artists, eq(sessions.artistId, artists.id))
    .where(eq(sessions.token, token))
    .limit(1);
  return rows[0] ?? null;
}

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}