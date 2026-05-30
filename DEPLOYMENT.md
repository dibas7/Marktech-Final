# Deployment — GitHub + Himalayan Host (cPanel)

## Architecture

| Layer | Detail |
|--------|--------|
| Frontend | Vite + React SPA (`base: "./"`) |
| Hosting | Himalayan Host cPanel → `public_html` |
| Database | Supabase (PostgreSQL + Auth) |
| CI trigger | Push to `main` → cPanel Git deploy (`.cpanel.yml`) |

Environment variables are **baked into the JS bundle at build time** (`VITE_*`). There is no runtime `.env` on the server.

## One-time setup

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from [Supabase](https://supabase.com/dashboard) → Project Settings → API.
3. Apply database migrations in `supabase/migrations/` via Supabase SQL editor or CLI.

## Local development

```bash
npm install
npm run dev
```

App runs at **http://localhost:8080/** (see `vite.config.ts`).

## Production build (required before deploy)

```bash
npm run build:host
```

This will:

1. Verify `.env` has valid Supabase variables
2. Run `vite build` → `dist/`
3. Replace `public_html/` with a clean copy of `dist/` (no stale asset files)

## Deploy to Himalayan Host

1. Commit updated `public_html/` after `npm run build:host`
2. Push to GitHub `main`
3. cPanel runs `.cpanel.yml`:
   - Copies `public_html/*` → `/home1/marktech/public_html/`

### After deploy — verify live site

1. Hard refresh (Ctrl+Shift+R) or clear cache for your domain
2. Open DevTools → Network → confirm latest `assets/index-*.js` loads
3. Test login and dashboard (Supabase connectivity)

## GitHub

- Remote: `origin` → your `Marktech-Final` repository
- **Never commit `.env`** — only `.env.example`
- `public_html/` is the deploy artifact for cPanel

## Troubleshooting

| Issue | Fix |
|--------|-----|
| Blank page / old UI | Run `build:host`, commit `public_html`, push, hard refresh |
| Supabase errors in browser | Rebuild with correct `.env`, redeploy |
| `ERR_CONNECTION_REFUSED` on localhost | Run `npm run dev` and keep terminal open |
| 404 on refresh (deep links) | Ensure `public_html/.htaccess` SPA rewrite is present |

## Security

If `.env` was ever pushed to a public repository, **rotate your Supabase anon/publishable key** in the Supabase dashboard.
