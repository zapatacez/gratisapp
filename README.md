# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
#############
# Gratisapp

Full-stack Astro application deployed on Cloudflare Workers with D1 database and Drizzle ORM.

## Tech Stack

- **Framework**: [Astro](https://astro.build/) 5.14.1
- **Deployment**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Runtime**: Cloudflare Workers Runtime with Node.js compatibility

## Project Structure

```
gratisapp/
├── src/              # Astro source code
├── dist/             # Build output (generated)
├── migrations/       # Database migration files
├── wrangler.jsonc    # Cloudflare Workers configuration
├── package.json      # Dependencies and scripts
└── astro.config.mjs  # Astro configuration
```

## Environments

This project uses three environments for safe development and deployment:

| Environment | Worker | Database | URL |
|-------------|--------|----------|-----|
| **Local** | Local dev server | Local SQLite | `http://localhost:4321` |
| **Preview** | `gratisapp-preview` | `gratisapp-preview-db` | `https://gratisapp-preview.*.workers.dev` |
| **Production** | `gratisapp` | `gratisapp-prod-db` | `https://gratisapp.*.workers.dev` |

## Setup

### Prerequisites

- Node.js installed
- Cloudflare account
- Wrangler CLI (installed as dev dependency)

### Install Dependencies

```bash
npm install
```

### Environment Configuration

Database IDs are already configured in `wrangler.jsonc`:
- Production DB: `34ab71e3-18da-4eb0-a4dd-046ca6e41381`
- Preview DB: `b806b6b1-e0ff-4543-a5a5-468a35c066c5`

## Development Workflow

### Daily Development

Start local development server:
```bash
npm run dev
```

Your app runs at `http://localhost:4321` with a local SQLite database.

---

## Database Migrations

### Creating a New Migration

1. Update your Drizzle schema files
2. Generate migration:
   ```bash
   npm run db:generate
   ```

### Applying Migrations

**Local (for testing):**
```bash
npm run db:migrate:local
```

**Preview (cloud testing):**
```bash
npm run db:migrate:preview
```

**Production (live database):**
```bash
npm run db:migrate:prod
```

⚠️ **IMPORTANT**: Always test migrations in this order:
1. Local first
2. Preview second
3. Production last

---

## Database Management

View and edit your databases using Drizzle Studio:

**Local database:**
```bash
npm run db:studio:local
```

**Preview database:**
```bash
npm run db:studio:preview
```

**Production database:**
```bash
npm run db:studio:prod
```

---

## Deployment

### Deploy to Preview (Staging)

Test your changes in the cloud before going live:

```bash
npm run deploy:preview
```

This deploys to `gratisapp-preview` Worker with the preview database.

### Deploy to Production

After testing in preview, deploy to production:

```bash
npm run deploy
```

This deploys to `gratisapp` Worker with the production database.

---

## Complete Feature Development Workflow

When adding a new feature with database changes:

```bash
# 1. Develop locally
npm run dev

# 2. Create migration (if needed)
npm run db:generate
npm run db:migrate:local
npm run dev  # Test locally

# 3. Deploy to preview
npm run db:migrate:preview
npm run deploy:preview
# Visit preview URL and test

# 4. Deploy to production
npm run db:migrate:prod
npm run deploy
```

---

## Available Scripts

### Development
- `npm run dev` - Start local development server
- `npm run build` - Build for production
- `npm run preview` - Build and preview with Wrangler locally

### Deployment
- `npm run deploy` - Deploy to production
- `npm run deploy:preview` - Deploy to preview environment

### Database
- `npm run db:generate` - Generate new migration from schema changes
- `npm run db:migrate:local` - Apply migrations to local database
- `npm run db:migrate:preview` - Apply migrations to preview database
- `npm run db:migrate:prod` - Apply migrations to production database

### Database Studio (GUI)
- `npm run db:studio:local` - Open local database in Drizzle Studio
- `npm run db:studio:preview` - Open preview database in Drizzle Studio
- `npm run db:studio:prod` - Open production database in Drizzle Studio

### Other
- `npm run cf-typegen` - Generate TypeScript types for Cloudflare bindings
- `npm run astro` - Run Astro CLI commands

---

## Important Notes

### Database Migrations
- Migrations cannot be easily undone
- Always test thoroughly in preview before production
- Keep migration files in version control

### Environment Safety
- Never skip the preview environment
- Test all database changes in preview first
- Production should only receive well-tested code

### Local Development
- Local uses SQLite, cloud uses D1 (both SQLite-based)
- Most features work identically
- Some Cloudflare-specific features only work when deployed

---

## Troubleshooting

### Build Issues

**Error: "entry-point file not found"**
```bash
npm run build
# Check that dist/_worker.js is created
```

### Database Issues

**Migration fails in preview/production:**
- Test migration locally first: `npm run db:migrate:local`
- Check migration files in `migrations/` folder
- Verify database IDs in `wrangler.jsonc`

**Can't connect to database:**
- Ensure you're logged into Cloudflare: `npx wrangler login`
- Verify database exists in Cloudflare dashboard
- Check database IDs match in `wrangler.jsonc`

### Deployment Issues

**Wrong environment deployed:**
- Production: `npm run deploy` (no flags)
- Preview: `npm run deploy:preview` (with `--env preview`)

---

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Astro Docs](https://docs.astro.build/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)

---

## Project Configuration Files

### Key Files
- `wrangler.jsonc` - Cloudflare Workers and D1 configuration
- `astro.config.mjs` - Astro and Cloudflare adapter settings
- `package.json` - Dependencies and NPM scripts
- `drizzle.config.ts` - Drizzle ORM configuration (if exists)

---

## Support

For issues specific to:
- **Cloudflare Workers/D1**: [Cloudflare Community](https://community.cloudflare.com/)
- **Astro**: [Astro Discord](https://astro.build/chat)
- **Drizzle**: [Drizzle Discord](https://discord.gg/drizzle)