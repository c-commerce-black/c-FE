# C-commerce Frontend

[한국어](./docs/README.ko.md) | [English](./README.md) | [日本語](./docs/README.ja.md)

Mobile-first commerce storefront for expiry-soon deals, built with Next.js App Router.

This repository contains the C-commerce web client, including:

- buyer flows for explore, product detail, cart, alerts, orders, and account
- seller flows for product registration and dashboard management
- BFF-style route handlers for auth, products, cart, orders, alerts, and seller APIs
- mobile app-frame UI with Tailwind CSS, Framer Motion, Lucide icons, and Zustand stores

## Stack

- Next.js 16.2.1
- React 19
- Tailwind CSS v4
- Framer Motion
- Lucide React
- Zustand
- Vitest
- Playwright

## Features

- App Router structure with `(store)` and `(auth)` route groups
- HttpOnly cookie session handling with a single `accessToken`
- Infinite-scroll explore feed with filter and scroll restoration
- Buyer and seller role-based flows backed by internal BFF routes
- Product, cart, alerts, and order screens designed for a mobile app-style viewport
- Dynamic icon and Open Graph image generation

## Routes

Core user-facing routes:

- `/`
- `/explore`
- `/products/[id]`
- `/alerts`
- `/cart`
- `/orders/[id]/success`
- `/account`
- `/login`
- `/signup`
- `/signup/terms/[termKey]`
- `/seller`
- `/seller/products/new`

Internal API routes are exposed under `/api/*` and proxy the backend API while normalizing session handling.

## Environment Variables

Create a local environment file from `.env.example`.

```bash
cp .env.example .env.local
```

Recommended variables for development, required for deployed environments:

```env
API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SESSION_COOKIE_NAME=cc_access_token
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev         # start the Next.js dev server
npm run build       # production build
npm run start       # start the production server
npm run lint        # run ESLint
npm run test        # run unit tests with Vitest
npm run test:e2e    # run Playwright end-to-end tests
```

For webpack-based build verification used during development:

```bash
npm run build -- --webpack
```

## Testing

Unit tests cover utilities, auth/session helpers, and commerce data behavior.

```bash
npm run test
```

End-to-end tests cover public navigation, explore filtering behavior, and visual review snapshots.

```bash
npx playwright test
```

## Project Notes

- The UI is intentionally constrained to a centered mobile app frame.
- Explore uses infinite scroll rather than visible pagination.
- Public product list APIs and infinite-scroll feed APIs are separated internally so the frontend can keep both document-aligned contracts and app-specific UX behavior.
- The official service logo is served from `/logo/c-commerce.png`.
