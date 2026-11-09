export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function kindLabel(kind: string): string {
  return kind === "wallpaper" ? "Phone wallpaper" : "Wall art print";
}

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "artwork"
  );
}