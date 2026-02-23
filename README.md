# Noire Store (Next.js 14 + Prisma + next-intl)

Production-ready mobile-first ecommerce for an Instagram clothing store.

## Stack
- Next.js 14 App Router + TypeScript
- TailwindCSS (mobile-first)
- Prisma + PostgreSQL
- NextAuth (credentials)
- next-intl (`/en`, `/fr`, `/ar` + RTL for Arabic)
- Zod validation
- Meta Pixel + Conversions API (consent-gated)

## Features
- Client storefront:
  - Home with premium hero, category shortcuts, featured products, trust badges
  - Category pages: pants, tshirts, shoes
  - Product page with swipe gallery, size selector, stock, add-to-cart, related products
  - Mobile cart and 2-step COD checkout
  - Dynamic shipping price by Algerian wilaya
  - Order success page with optional WhatsApp CTA
  - Static pages: About, Shipping & Returns, Contact
- Admin dashboard:
  - Login-protected
  - Product CRUD (multilingual fields)
  - Orders list + status update (`new`, `confirmed`, `shipped`, `delivered`, `canceled`, `returned`)
  - Shipping-by-wilaya price management
  - Site settings (store info + Meta tracking config)
- Tracking:
  - Events: `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`
  - Dedup via shared client-generated `event_id`
  - CAPI with SHA-256 hashed email/phone
  - Tracking loads only after user consent
- Security:
  - API payload validation with Zod
  - In-memory rate limiting on checkout and meta tracking endpoints

## Mobile-first implementation notes
- No horizontal overflow (`html, body { overflow-x: hidden }`)
- Large tap targets (`min-h-12` buttons/inputs)
- Bottom thumb dock navigation on mobile
- Sticky bottom CTA on product/cart/checkout
- iPhone safe area support (`env(safe-area-inset-*)`)
- Optimized image loading with `next/image`
- Server components used by default for data-heavy views

## Project structure
```txt
src/
  app/
    [locale]/
      page.tsx
      category/[slug]/page.tsx
      product/[slug]/page.tsx
      cart/page.tsx
      checkout/page.tsx
      order-success/[id]/page.tsx
      about/page.tsx
      shipping-returns/page.tsx
      contact/page.tsx
      admin/
        login/page.tsx
        products/page.tsx
        orders/page.tsx
        shipping/page.tsx
        settings/page.tsx
    api/
      auth/[...nextauth]/route.ts
      checkout/route.ts
      meta/track/route.ts
  components/
    shop/*
    admin/*
    layout/*
    tracking/*
  lib/
    auth/*
    db/prisma.ts
    i18n/*
    meta/client.ts
    queries.ts
    store.ts
    utils.ts
  messages/
    en.json
    fr.json
    ar.json
prisma/
  schema.prisma
  seed.ts
docker-compose.yml
.env.example
```

## Setup
1. Install dependencies:
```bash
npm install
```
2. Copy env file:
```bash
cp .env.example .env
```
3. Start PostgreSQL with Docker:
```bash
docker compose up -d
```
4. Run migrations + generate Prisma client:
```bash
npx prisma migrate dev --name init
npx prisma generate
```
5. Seed database:
```bash
npm run db:seed
```
6. Start development server:
```bash
npm run dev
```

## Seeded defaults
- Admin email: `admin@noire.dz`
- Admin password: `Admin@12345`
- 58 Algerian wilayas inserted with editable shipping prices
- Sample products for pants, t-shirts, and shoes

## Meta configuration
Set these via Admin > Settings:
- `metaPixelId`
- `metaAccessToken`
- optional `metaTestEventCode`
- `trackingEnabled=true`

Tracking remains disabled until:
1. `trackingEnabled` is true in settings
2. User accepts consent banner

## Build check
```bash
npm run build
```
(Verified successfully)

## Vercel deployment
- Add environment variables from `.env.example` in Vercel project settings
- Use managed Postgres or external Postgres URL for `DATABASE_URL`
- Run migrations on deploy pipeline
