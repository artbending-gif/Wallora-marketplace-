export const ADMIN_KEY = process.env.ADMIN_KEY ?? "wallora-admin";

export function isAdminKey(key: unknown): boolean {
  return typeof key === "string" && key === ADMIN_KEY;
}