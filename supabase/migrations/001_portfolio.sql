-- Run once in the Supabase SQL Editor on a NEW database.
create table public.projects (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(title) between 1 and 150),
 year text not null check (year ~ '^\d{4}$'),
 tools text not null,
 category text not null check (category in ('3D modelling','CAD drafting','Plant design','Engineering projects')),
 description text not null,
 published boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.project_files (
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.projects(id) on delete cascade,
 name text not null,
 mime text not null,
 size bigint not null check (size > 0 and size <= 262144000),
 storage_key text not null unique,
 status text not null default 'pending' check (status in ('pending','ready')),
 created_at timestamptz not null default now()
);
create index projects_published_created_idx on public.projects(published, created_at desc);
create index project_files_project_idx on public.project_files(project_id);
-- Browsers have no direct database access. Only the server service-role client
-- can query these tables. Public API queries explicitly restrict to published work;
-- all write APIs and draft reads require a validated, allowlisted Supabase user.
alter table public.projects enable row level security;
alter table public.project_files enable row level security;
revoke all on public.projects, public.project_files from anon, authenticated;
grant all on public.projects, public.project_files to service_role;
