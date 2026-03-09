-- Run this in your Supabase SQL editor to create the users table

create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  username    text not null unique,
  email       text not null unique,
  password    text not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

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
