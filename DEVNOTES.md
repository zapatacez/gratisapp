Quick development notes

- The app expects a Cloudflare D1 binding named `DB` (configured in `wrangler.jsonc`). The homepage fetches upcoming events from `/api/events`, which queries D1 via Drizzle.
- Install dependencies with `npm install` and run `npm run dev` to start the Astro dev server.

If you don't have an accessible D1 instance locally, you can mock `/api/events` responses during UI development.
