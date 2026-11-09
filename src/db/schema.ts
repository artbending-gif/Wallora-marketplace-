import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  bio: text("bio").notNull().default(""),
  passwordHash: text("password_hash"),
  isOwner: boolean("is_owner").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  artistId: integer("artist_id")
    .notNull()
    .references(() => artists.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id")
    .notNull()
    .references(() => artists.id),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  kind: text("kind").notNull(), // 'wall_art' | 'wallpaper'
  tags: text("tags").notNull().default(""),
  priceCents: integer("price_cents").notNull(),
  imageUrl: text("image_url").notNull(), // public path or data URL
  previewUrl: text("preview_url"), // fuller-resolution version for mockups
  featured: boolean("featured").notNull().default(false),
  sales: integer("sales").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  totalCents: integer("total_cents").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  artworkId: integer("artwork_id")
    .notNull()
    .references(() => artworks.id),
  priceCents: integer("price_cents").notNull(),
});

export type Artwork = typeof artworks.$inferSelect;
export type Artist = typeof artists.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;