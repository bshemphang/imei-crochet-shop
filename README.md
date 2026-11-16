# IMEI Crochet Shop

Online shop for handmade crochet goods. Browse the shop by category, read about the maker, and manage products from an admin section.

## Pages

- Home, Shop, Categories, About
- Admin and Admin login

## Tech stack

- React, Vite, JavaScript
- React Router
- Supabase (database)

## Getting started

```bash
npm install
npm run dev
```

Create a `.env` file with your Supabase credentials:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The database schema lives in `supabase/schema.sql`.

## Scripts

- `npm run dev` - start the development server
- `npm run build` - build for production
- `npm run preview` - preview the production build
- `npm run lint` - run ESLint
