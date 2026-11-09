# Wallora — Smart Art

Next.js App Router + PostgreSQL/Drizzle marketplace for wall art and phone wallpapers.

## Start here

This source code includes the product image files in `public/art`, but **does not include the preview database** (accounts, listings, or orders). A newly deployed database starts empty. Do not create your owner account until you control the production site.

**Payments are DEMO ONLY.** Checkout currently delivers downloads without collecting money. Do not sell or advertise it as a paid shop until a real payment provider is integrated.

## Upload to GitHub from Windows (Git Bash)

1. Extract the ZIP into a dedicated folder, e.g. `C:\Users\Paul\Downloads\wallora`.
2. Open Git Bash and run `cd "/c/Users/Paul/Downloads/wallora"` (adjust the path to the actual folder).
3. Run `pwd && ls package.json`. Do not proceed unless `package.json` is found.
4. Create an **empty** GitHub repository and copy its HTTPS URL.
5. In the project folder run:

   ```sh
   git init
   git add .
   git status
   git commit -m "Initial Wallora app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

   Replace the remote URL with your own repository URL. `.gitignore` protects `.env`, `node_modules`, and `.next`; nevertheless, inspect `git status` before committing. Never run `git add .` from your whole home folder.

## Deploy

1. Create a free hosted PostgreSQL database (e.g. Neon). Copy its connection URL.
2. Locally create `.env` in the project root with `DATABASE_URL="your-neon-postgres-url"`. **Do not commit it.**
3. Install Node.js LTS and run `npm ci` then `npx drizzle-kit push` in the project root to create the tables.
4. Import the GitHub repository into Vercel. Set `DATABASE_URL` and a long random `ADMIN_KEY` in Vercel's Environment Variables before deploying.
5. Visit the deployed `/api/health` and the home page. Visit `/admin` to create the first account (owner). Add your own products at `/sell`.

The preview database is separate from Neon. GitHub stores source code, not the existing database records. To copy listings/accounts, you need a deliberate database export/import; do **not** assume the ZIP contains them.
