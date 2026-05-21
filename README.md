# Bornil Vibes Frontend

React + Vite + TypeScript frontend for the Bornil Vibes jewelry e-commerce platform.

## Setup

```bash
npm install
```

Create `.env`:

```bash
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

Run locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Netlify

The included `netlify.toml` uses:

```txt
Build command: npm run build
Publish directory: dist
```

SPA redirects are configured so direct routes like `/products/:id`, `/dashboard`, and `/admin` do not 404.
