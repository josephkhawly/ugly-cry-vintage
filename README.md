# Ugly Cry Vintage

Next.js storefront for Ugly Cry Vintage, using Shopify Hydrogen and deployed on Vercel.

## Setup

This repo uses pnpm (`packageManager` in `package.json` is `pnpm@10.15.0`).

```bash
pnpm install
```

Environment variables are listed in `.env.example`. Local env files matching `.env*.local` are gitignored.

## Scripts

- `pnpm dev` — `hydrogen skills check --mode=warn`, then `next dev --turbopack`
- `pnpm build` — `next build --turbopack`
- `pnpm typecheck` — `tsc --noEmit` and `hydrogen gql check`
- `pnpm lint` — `eslint .`
