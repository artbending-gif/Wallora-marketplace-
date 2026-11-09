import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Reads DATABASE_URL from .env (local) or the shell/Vercel environment.
// Falls back to the bundled local Postgres so `npm run dev` works out of the box.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});
