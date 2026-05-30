# Marktech Nepal — Repair Receipt System

Web app for managing customer device repair receipts (Marktech Nepal).

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind, shadcn/ui
- **Backend:** Supabase (Postgres, Auth, RLS)
- **Hosting:** Himalayan Host cPanel (`public_html` via Git deploy)

## Quick start

```bash
npm install
cp .env.example .env   # then add Supabase keys
npm run dev            # http://localhost:8080
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development server |
| `npm run build` | Production build → `dist/` |
| `npm run build:host` | Build + sync to `public_html/` for cPanel |
| `npm run preview` | Preview production build locally |

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for full deploy steps to GitHub and cPanel.
