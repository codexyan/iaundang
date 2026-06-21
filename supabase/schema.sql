-- iaundang Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- INVITATIONS
-- ============================================================
create table if not exists public.invitations (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  slug        text not null unique,
  template_id text not null default 'modern-white',
  data        jsonb not null default '{}',
  is_published boolean not null default false,
  is_paid     boolean not null default false,
  expires_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists invitations_slug_idx on public.invitations(slug);
create index if not exists invitations_user_id_idx on public.invitations(user_id);

-- ============================================================
-- GALLERIES
-- ============================================================
create table if not exists public.galleries (
  id            uuid primary key default uuid_generate_v4(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  url           text not null,
  "order"       int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists galleries_invitation_id_idx on public.galleries(invitation_id);

-- ============================================================
-- GUESTS (RSVP)
-- ============================================================
create table if not exists public.guests (
  id            uuid primary key default uuid_generate_v4(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name          text not null,
  attending     boolean not null default true,
  total_guests  int not null default 1,
  created_at    timestamptz not null default now()
);

create index if not exists guests_invitation_id_idx on public.guests(invitation_id);

-- ============================================================
-- WISHES (Buku Ucapan)
-- ============================================================
create table if not exists public.wishes (
  id            uuid primary key default uuid_generate_v4(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name          text not null,
  message       text not null,
  created_at    timestamptz not null default now()
);

create index if not exists wishes_invitation_id_idx on public.wishes(invitation_id);

-- ============================================================
-- ORDERS (Payment tracking)
-- ============================================================
create table if not exists public.orders (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  order_id      text not null unique,  -- Midtrans order_id
  amount        int not null default 149000,
  status        text not null default 'pending', -- pending | success | failed | expired
  payment_type  text,
  midtrans_data jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists orders_order_id_idx on public.orders(order_id);
create index if not exists orders_user_id_idx on public.orders(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.invitations enable row level security;
alter table public.galleries enable row level security;
alter table public.guests enable row level security;
alter table public.wishes enable row level security;
alter table public.orders enable row level security;

-- Invitations: user bisa baca/ubah milik sendiri
create policy "Users can manage own invitations"
  on public.invitations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Invitations: semua bisa baca yang published
create policy "Anyone can read published invitations"
  on public.invitations for select
  using (is_published = true);

-- Galleries: owner manage, public read jika published
create policy "Owner can manage galleries"
  on public.galleries for all
  using (
    exists (
      select 1 from public.invitations
      where id = galleries.invitation_id and user_id = auth.uid()
    )
  );

create policy "Anyone can read galleries of published invitations"
  on public.galleries for select
  using (
    exists (
      select 1 from public.invitations
      where id = galleries.invitation_id and is_published = true
    )
  );

-- Guests: public bisa insert, owner bisa baca
create policy "Anyone can submit RSVP"
  on public.guests for insert
  with check (true);

create policy "Owner can read guests"
  on public.guests for select
  using (
    exists (
      select 1 from public.invitations
      where id = guests.invitation_id and user_id = auth.uid()
    )
  );

-- Wishes: public bisa insert + baca
create policy "Anyone can submit wishes"
  on public.wishes for insert
  with check (true);

create policy "Anyone can read wishes of published invitations"
  on public.wishes for select
  using (
    exists (
      select 1 from public.invitations
      where id = wishes.invitation_id and is_published = true
    )
  );

create policy "Owner can read all wishes"
  on public.wishes for select
  using (
    exists (
      select 1 from public.invitations
      where id = wishes.invitation_id and user_id = auth.uid()
    )
  );

-- Orders: user bisa baca milik sendiri
create policy "Users can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT trigger
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger invitations_updated_at
  before update on public.invitations
  for each row execute function public.handle_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run these separately in Supabase Storage UI or via API:
-- 1. Create bucket "galleries" (public)
-- 2. Create bucket "music" (public)
-- 3. Create bucket "hero-photos" (public)
--
-- Storage policies (add in Supabase dashboard):
-- galleries: authenticated users can upload to their own folder (user_id/*)
-- music: authenticated users can upload
-- hero-photos: authenticated users can upload
