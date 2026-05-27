-- Run this in your Supabase SQL editor to create the users table

create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  username    text not null unique,
  email       text not null unique,
  password    text not null,
  is_admin    boolean not null default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table if exists users add column if not exists is_admin boolean not null default false;

-- Optional: auto-update updated_at on row changes
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
before update on users
for each row execute procedure update_updated_at();

create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  price       numeric(10,2) not null check (price >= 0),
  stock       integer not null default 0 check (stock >= 0),
  category    text,
  image_url   text,
  is_active   boolean not null default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists payments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references users(id) on delete set null,
  product_id     uuid references products(id) on delete set null,
  amount         numeric(10,2) not null check (amount >= 0),
  currency       char(3) not null default 'USD',
  status         text not null default 'pending'
                   check (status in ('pending','completed','failed','refunded')),
  payment_method text,
  reference      text unique,
  notes          text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create trigger products_updated_at before update on products
  for each row execute procedure update_updated_at();

create trigger payments_updated_at before update on payments
  for each row execute procedure update_updated_at();
