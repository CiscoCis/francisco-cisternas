-- ============================================================================
--  Forum & Community — Supabase schema
-- ============================================================================
--
--  Run this once, in full, in a brand-new Supabase project's SQL Editor
--  (Supabase dashboard → SQL Editor → New query → paste this whole file →
--  Run). It creates every table the Forum's dynamic (visitor-generated) data
--  lives in, plus a small number of public VIEWs that expose only the safe
--  columns of each table.
--
--  WHY there are both tables and views, and why RLS is enabled with NO
--  policies added for `anon`:
--    Every base table below has Row Level Security turned on but is given no
--    policy at all for the `anon` role — which means, by default, the anon
--    key (the one that ends up in the website's public JS bundle) can read
--    or write NOTHING directly. All writes happen through a separate Apps
--    Script Web App that uses the *service role* key instead (which bypasses
--    RLS entirely and never appears in any browser-served file). The public
--    VIEWs exist purely so the website can do fast, live, read-only lookups
--    (e.g. "12 comments" or "8 going") directly from the browser using the
--    anon key, without ever exposing an email address or an unpublished
--    comment. A Postgres view runs with the privileges of whoever created
--    it (not the querying role), so granting `anon` SELECT on the view
--    exposes exactly the columns/rows the view defines — nothing more —
--    even though `anon` still has zero access to the underlying table.
--
--  After running this, you need three values for the website / Apps Script:
--    1. Project URL           — Settings → API → Project URL
--    2. anon public key       — Settings → API → Project API keys → anon/public
--    3. service_role key      — Settings → API → Project API keys → service_role
--       (never share this one outside the Apps Script's own Script Properties)

-- ---------------------------------------------------------------------------
-- 1. Comments on a Conversation
-- ---------------------------------------------------------------------------
create table if not exists forum_comments (
  id uuid primary key default gen_random_uuid(),
  conversation_slug text not null,
  author_name text not null,
  author_email text not null,
  body text not null,
  status text not null default 'pending', -- 'pending' | 'published' | 'hidden'
  created_at timestamptz not null default now()
);
create index if not exists forum_comments_slug_idx on forum_comments (conversation_slug);

alter table forum_comments enable row level security;
-- No policies for anon: reads happen via the view below, writes via the
-- Apps Script's service-role key. This table itself is not directly
-- reachable from the browser at all.

create or replace view forum_comments_public as
  select id, conversation_slug, author_name, body, created_at
  from forum_comments
  where status = 'published'
  order by created_at asc;

grant select on forum_comments_public to anon;

-- ---------------------------------------------------------------------------
-- 2. Reaction counts per Conversation (one row per conversation, four counters)
-- ---------------------------------------------------------------------------
create table if not exists forum_reaction_counts (
  conversation_slug text primary key,
  insightful int not null default 0,
  interesting int not null default 0,
  agree int not null default 0,
  curious int not null default 0
);

alter table forum_reaction_counts enable row level security;

-- This one is safe to expose as-is (just aggregate counts, no personal
-- data), so it's granted directly rather than through a separate view.
-- IMPORTANT: the GRANT alone is not enough once RLS is turned on -- with
-- RLS enabled and zero policies, Postgres defaults to blocking every role
-- (other than the owner / service_role's BYPASSRLS) from seeing ANY row,
-- regardless of table-level GRANTs. An explicit permissive policy is
-- required too, unlike forum_comments_public and forum_event_rsvp_counts
-- below, which are VIEWs (a view runs with its creator's privileges, so
-- it isn't subject to the base table's RLS at all).
grant select on forum_reaction_counts to anon;
create policy "Reaction counts are public" on forum_reaction_counts
  for select using (true);

-- ---------------------------------------------------------------------------
-- 3. Event RSVPs
-- ---------------------------------------------------------------------------
create table if not exists forum_event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);
create index if not exists forum_event_rsvps_slug_idx on forum_event_rsvps (event_slug);

alter table forum_event_rsvps enable row level security;
-- No anon policies here either — names and emails never reach the browser.

create or replace view forum_event_rsvp_counts as
  select event_slug, count(*)::int as count
  from forum_event_rsvps
  group by event_slug;

grant select on forum_event_rsvp_counts to anon;

-- ---------------------------------------------------------------------------
-- 4. Opportunity suggestions awaiting the professor's review
-- ---------------------------------------------------------------------------
create table if not exists forum_opportunity_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organisation text,
  type text,
  description text,
  url text,
  submitted_by_name text,
  submitted_by_email text,
  status text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at timestamptz not null default now()
);

alter table forum_opportunity_submissions enable row level security;
-- Write-only from the website's point of view (via the Apps Script); the
-- professor reviews these directly in the Supabase table editor, so no
-- public view is needed at all.

-- ---------------------------------------------------------------------------
-- 4b. "Join the People directory" self-submissions awaiting review
-- ---------------------------------------------------------------------------
-- Deliberately separate from newsletter subscribers: subscribing to emails
-- and asking to be publicly listed on the People page are two different
-- consents. A submission here is moderated exactly like an opportunity
-- suggestion -- the professor reviews it in the Supabase table editor and,
-- for ones he's happy to publish, adds a matching entry himself in TinaCMS
-- ("Forum -- People"). Nothing here becomes public on its own.
create table if not exists forum_people_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  role text,
  organisation text,
  location text,
  programme text,
  graduation_year text,
  linkedin_url text,
  intro text,
  expertise text,
  status text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at timestamptz not null default now()
);

alter table forum_people_submissions enable row level security;
-- Write-only from the website's point of view; no public view needed.

-- ---------------------------------------------------------------------------
-- 5. "Request an introduction" to a person in the directory
-- ---------------------------------------------------------------------------
create table if not exists forum_introduction_requests (
  id uuid primary key default gen_random_uuid(),
  target_person_slug text not null,
  requester_name text not null,
  requester_email text not null,
  reason text,
  created_at timestamptz not null default now()
);

alter table forum_introduction_requests enable row level security;
-- Write-only; the professor reviews these in the Supabase table editor.

-- ---------------------------------------------------------------------------
-- 6. Ask the Professor — incoming questions
-- ---------------------------------------------------------------------------
create table if not exists forum_ask_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  asker_name text,
  asker_email text,
  status text not null default 'pending', -- 'pending' | 'answered' | 'declined'
  created_at timestamptz not null default now()
);

alter table forum_ask_questions enable row level security;
-- Write-only; published answers live in TinaCMS (forumAnswer collection),
-- not here — this table is just the professor's inbox of raw questions.

-- ---------------------------------------------------------------------------
-- 7. Newsletter subscribers
-- ---------------------------------------------------------------------------
create table if not exists forum_newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null unique,
  interests text[] default '{}',
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

alter table forum_newsletter_subscribers enable row level security;
-- Write-only; Francisco exports this table (Supabase table editor → export
-- CSV, or a simple SQL query) to BCC when he sends an issue by hand.

-- ---------------------------------------------------------------------------
-- 8. Grant the service_role its expected default privileges
-- ---------------------------------------------------------------------------
-- service_role is meant to bypass RLS and have full access to every table
-- by default -- but on some projects, unchecking "Automatically expose new
-- tables" during project creation (the right call for locking down `anon`,
-- see this file's own header) also blocks service_role's own default
-- grants, since Supabase bundles both under one setting. Without this,
-- every insert from the Apps Script fails with "permission denied for
-- table ..." (Postgres error 42501) even though service_role should never
-- see that error. Safe to run even if it already has these grants.
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- The three GRANTs above only cover tables that already exist -- Postgres
-- doesn't retroactively apply them to anything created afterward, which is
-- exactly what bit us adding forum_people_submissions later (same
-- "permission denied for table ..." error, on a table created well after
-- the grants above were first run). ALTER DEFAULT PRIVILEGES fixes this
-- going forward: any new table created in `public` from now on
-- automatically grants service_role full access, no manual GRANT needed
-- again. Safe to run even if already in place.
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
