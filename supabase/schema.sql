-- =============================================
-- IMEI CROCHET SHOP — Supabase Schema
-- Paste this in: Supabase Dashboard > SQL Editor > New Query
-- =============================================

-- Products table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price integer not null,           -- price in rupees (e.g. 399)
  category text not null,           -- e.g. 'Keychains', 'Bouquets', etc.
  image_url text,                   -- public URL from Supabase Storage
  stock integer not null default 0, -- 0 = out of stock
  is_available boolean default true,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table products enable row level security;

-- Allow anyone to READ products (public shop)
create policy "Public can view products"
  on products for select
  using (true);

-- Allow anyone to INSERT/UPDATE/DELETE (admin panel uses anon key + password check in UI)
-- For production you can tighten this with a service_role key
create policy "Anyone can manage products"
  on products for all
  using (true)
  with check (true);

-- =============================================
-- Storage bucket for product images
-- Go to: Supabase Dashboard > Storage > New Bucket
-- Name it: product-images
-- Set it to PUBLIC
-- =============================================

-- Optional: seed some example categories
-- (you can delete these from the admin panel later)
insert into products (name, description, price, category, stock, is_available) values
  ('Bee Amigurumi', 'A cute little crocheted bee, perfect as a desk companion or gift!', 399, 'Amigurumi', 3, true),
  ('Sunflower Bouquet', 'A bouquet of crocheted sunflowers that never wilt. Great for gifting!', 599, 'Bouquets', 2, true),
  ('Cat Keychain', 'Adorable crochet cat keychain in blue. Fits your keys or bag.', 199, 'Keychains', 5, true),
  ('Daisy Headband', 'Green headband with white daisy flowers. Handmade with love.', 299, 'Headbands', 0, true);
