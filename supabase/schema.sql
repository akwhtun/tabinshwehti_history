-- ============================================================
-- Tabinshwehti Historical Archive — Full Schema + Seed Data
-- Run this in the Supabase SQL editor.
-- ============================================================

create extension if not exists "pgcrypto" with schema extensions;

-- ------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------

-- Categories (static UI mapping)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon text not null default 'menu_book',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Add columns that may be missing if table already existed from an older schema
alter table public.categories add column if not exists icon text not null default 'menu_book';
alter table public.categories add column if not exists sort_order int default 0;
-- Ensure year_start is text (Myanmar numerals may be used)
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='history_topics' and column_name='year_start' and data_type='integer') then
    alter table public.history_topics alter column year_start type text using year_start::text;
  end if;
end $$;
alter table public.history_topics add column if not exists votes jsonb not null default '{"true":0,"false":0,"disputed":0,"needs_more_evidence":0}';
alter table public.history_topics add column if not exists sources jsonb not null default '[]';
alter table public.history_topics add column if not exists cover_image_url text not null default '';
alter table public.history_topics add column if not exists period_label text not null default '';
alter table public.history_topics add column if not exists year_start text not null default '';
alter table public.history_topics add column if not exists location text not null default '';
alter table public.history_topics add column if not exists admin_note text default '';
alter table public.topic_reasons add column if not exists position text not null default 'supports';
alter table public.topic_reasons add column if not exists source_title text default '';
alter table public.topic_reasons add column if not exists source_url text default '';
alter table public.topic_reasons add column if not exists reviewed_by uuid references public.profiles(id);
alter table public.topic_reasons add column if not exists reviewed_at timestamptz;

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  bio text,
  role text not null default 'member' check (role in ('member', 'admin', 'super_admin')),
  preferred_language text default 'my',
  is_banned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- History topics (core content)
create table if not exists public.history_topics (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id),
  title text not null,
  slug text unique not null,
  summary text not null default '',
  content text not null default '',
  cover_image_url text not null default '',
  period_label text not null default '',
  year_start text not null default '',
  location text not null default '',
  authenticity_status text default 'unverified'
    check (authenticity_status in ('unverified','likely_true','disputed','needs_review','corrected','verified')),
  admin_note text default '',
  votes jsonb not null default '{"true":0,"false":0,"disputed":0,"needs_more_evidence":0}',
  sources jsonb not null default '[]',
  is_published boolean default true,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Topic votes (per-user)
create table if not exists public.topic_votes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.history_topics(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  vote text not null check (vote in ('true','false','disputed','needs_more_evidence')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (topic_id, user_id)
);

-- Evidence / reasons submitted by users
create table if not exists public.topic_reasons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.history_topics(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  position text not null default 'supports',
  body text not null default '',
  source_title text default '',
  source_url text default '',
  source_type text default '',
  status text default 'pending' check (status in ('pending','visible','hidden','accepted','rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Comments (threaded, max depth 2)
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.history_topics(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null,
  status text default 'visible' check (status in ('visible','hidden','deleted','flagged')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Admin revision log
create table if not exists public.topic_revisions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.history_topics(id) on delete cascade,
  edited_by uuid references public.profiles(id),
  previous_snapshot jsonb not null,
  new_snapshot jsonb not null,
  correction_note text default '',
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 2. VIEWS
-- ------------------------------------------------------------

create or replace view public.topic_vote_summary as
select
  topic_id,
  count(*)::int as total_votes,
  count(*) filter (where vote = 'true')::int as true_votes,
  count(*) filter (where vote = 'false')::int as false_votes,
  count(*) filter (where vote = 'disputed')::int as disputed_votes,
  count(*) filter (where vote = 'needs_more_evidence')::int as needs_more_evidence_votes
from public.topic_votes
group by topic_id;

-- ------------------------------------------------------------
-- 3. FUNCTIONS & RPC
-- ------------------------------------------------------------

-- Cast/change a vote and recalculate the topic's votes JSONB.
-- Returns the updated votes object.
create or replace function public.cast_vote(p_topic_id uuid, p_vote text)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_votes jsonb;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Upsert the vote
  insert into topic_votes (topic_id, user_id, vote)
  values (p_topic_id, v_user_id, p_vote)
  on conflict (topic_id, user_id)
  do update set vote = p_vote, updated_at = now();

  -- Recalculate counts from topic_votes
  select jsonb_build_object(
    'true',              coalesce((select count(*) from topic_votes where topic_id = p_topic_id and vote = 'true'), 0),
    'false',             coalesce((select count(*) from topic_votes where topic_id = p_topic_id and vote = 'false'), 0),
    'disputed',          coalesce((select count(*) from topic_votes where topic_id = p_topic_id and vote = 'disputed'), 0),
    'needs_more_evidence', coalesce((select count(*) from topic_votes where topic_id = p_topic_id and vote = 'needs_more_evidence'), 0)
  ) into v_votes;

  -- Update the denormalized column
  update history_topics set votes = v_votes where id = p_topic_id;

  return v_votes;
end;
$$;

-- Auto-create profile row after user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    case when new.email = coalesce(current_setting('app.settings.admin_email', true), '') then 'admin' else 'member' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.history_topics enable row level security;
alter table public.topic_votes enable row level security;
alter table public.topic_reasons enable row level security;
alter table public.comments enable row level security;
alter table public.topic_revisions enable row level security;

-- Everyone can read categories
drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories" on public.categories for select using (true);

-- Profiles: read own/others, insert/update own
drop policy if exists "Public read profiles" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Admin update any profile" on public.profiles;
create policy "Public read profiles" on public.profiles for select using (true);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admin update any profile" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Topics: published visible to all; admin can read/edit all
drop policy if exists "Public read published topics" on public.history_topics;
drop policy if exists "Admin all topics" on public.history_topics;
drop policy if exists "Admin update topics" on public.history_topics;
create policy "Public read published topics" on public.history_topics
  for select using (is_published = true);
create policy "Admin all topics" on public.history_topics
  for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admin update topics" on public.history_topics
  for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
drop policy if exists "Admin insert topics" on public.history_topics;
create policy "Admin insert topics" on public.history_topics
  for insert with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Votes: everyone can read; users insert/update own
drop policy if exists "Public read votes" on public.topic_votes;
drop policy if exists "Users insert own votes" on public.topic_votes;
drop policy if exists "Users update own votes" on public.topic_votes;
create policy "Public read votes" on public.topic_votes for select using (true);
create policy "Users insert own votes" on public.topic_votes
  for insert with check (auth.uid() = user_id);
create policy "Users update own votes" on public.topic_votes
  for update using (auth.uid() = user_id);

-- Reasons: public can read visible/accepted; users insert own; admin all
drop policy if exists "Public read visible reasons" on public.topic_reasons;
drop policy if exists "Users insert own reasons" on public.topic_reasons;
drop policy if exists "Users update own pending reasons" on public.topic_reasons;
drop policy if exists "Admin all reasons" on public.topic_reasons;
create policy "Public read visible reasons" on public.topic_reasons
  for select using (status in ('visible','accepted'));
create policy "Users insert own reasons" on public.topic_reasons
  for insert with check (auth.uid() = user_id);
create policy "Users update own pending reasons" on public.topic_reasons
  for update using (auth.uid() = user_id and status = 'pending');
drop policy if exists "Users see own pending reasons" on public.topic_reasons;
create policy "Users see own pending reasons" on public.topic_reasons
  for select using (auth.uid() = user_id and status = 'pending');
create policy "Admin all reasons" on public.topic_reasons
  for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Comments: public can read visible; users insert own; admin all
drop policy if exists "Public read visible comments" on public.comments;
drop policy if exists "Users insert own comments" on public.comments;
drop policy if exists "Users update own comments" on public.comments;
drop policy if exists "Admin all comments" on public.comments;
create policy "Public read visible comments" on public.comments
  for select using (status = 'visible');
create policy "Users insert own comments" on public.comments
  for insert with check (auth.uid() = user_id);
create policy "Users update own comments" on public.comments
  for update using (auth.uid() = user_id);
create policy "Admin all comments" on public.comments
  for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Revisions: admin only
drop policy if exists "Admin revisions" on public.topic_revisions;
create policy "Admin revisions" on public.topic_revisions
  for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ------------------------------------------------------------
-- 4b. ADMIN ROLE SYNC (security definer — bypasses RLS)
-- ------------------------------------------------------------

create or replace function public.sync_admin_role(p_admin_email text)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if auth.email() = p_admin_email then
    insert into public.profiles (id, display_name, role)
    values (auth.uid(), split_part(auth.email(), '@', 1), 'admin')
    on conflict (id) do update set role = 'admin';
  end if;
end;
$$;

-- ------------------------------------------------------------
-- 4c. ADMIN RPCs (security definer — bypass RLS entirely)
-- ------------------------------------------------------------

create or replace function public.admin_get_evidence()
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Not authorized';
  end if;
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', tr.id, 'body', tr.body, 'position', tr.position,
      'status', tr.status, 'source_title', tr.source_title,
      'source_url', tr.source_url, 'created_at', tr.created_at,
      'topic_id', tr.topic_id, 'user_id', tr.user_id,
      'author_name', p.display_name,
      'topic_title', ht.title, 'topic_slug', ht.slug
    ) order by tr.created_at desc
  ), '[]'::jsonb) into result
  from topic_reasons tr
  left join profiles p on p.id = tr.user_id
  left join history_topics ht on ht.id = tr.topic_id;
  return result;
end;
$$;

create or replace function public.admin_get_comments()
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Not authorized';
  end if;
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', c.id, 'body', c.body, 'status', c.status,
      'created_at', c.created_at, 'topic_id', c.topic_id,
      'user_id', c.user_id, 'parent_id', c.parent_id,
      'author_name', p.display_name,
      'topic_title', ht.title, 'topic_slug', ht.slug
    ) order by c.created_at desc
  ), '[]'::jsonb) into result
  from comments c
  left join profiles p on p.id = c.user_id
  left join history_topics ht on ht.id = c.topic_id;
  return result;
end;
$$;

create or replace function public.admin_update_topic(
  p_id uuid, p_title text, p_summary text, p_content text,
  p_authenticity_status text, p_admin_note text,
  p_previous_snapshot jsonb default null, p_correction_note text default null
)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Not authorized';
  end if;
  update history_topics set
    title = p_title, summary = p_summary, content = p_content,
    authenticity_status = p_authenticity_status,
    admin_note = p_admin_note, updated_at = now()
  where id = p_id;
  if p_correction_note is not null and p_correction_note != '' and p_previous_snapshot is not null then
    insert into topic_revisions (topic_id, edited_by, previous_snapshot, new_snapshot, correction_note)
    values (p_id, auth.uid(), p_previous_snapshot,
      jsonb_build_object('title', p_title, 'summary', p_summary, 'content', p_content, 'status', p_authenticity_status),
      p_correction_note);
  end if;
end;
$$;

-- Get reasons for a topic (bypasses RLS, respects visibility rules)
create or replace function public.get_topic_reasons(p_topic_id uuid)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', tr.id, 'body', tr.body, 'position', tr.position,
      'status', tr.status, 'source_title', tr.source_title,
      'source_url', tr.source_url, 'created_at', tr.created_at,
      'topic_id', tr.topic_id, 'user_id', tr.user_id,
      'author', p.display_name
    ) order by tr.created_at desc
  ), '[]'::jsonb) into result
  from topic_reasons tr
  left join profiles p on p.id = tr.user_id
  where tr.topic_id = p_topic_id
    and (tr.status in ('visible', 'accepted')
      or tr.user_id = auth.uid()
      or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
  return result;
end;
$$;

create or replace function public.admin_update_evidence_status(p_id uuid, p_status text)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Not authorized';
  end if;
  if p_status not in ('pending', 'visible', 'hidden', 'accepted', 'rejected') then
    raise exception 'Invalid status: %', p_status;
  end if;
  update topic_reasons set status = p_status, reviewed_by = auth.uid(), reviewed_at = now()
  where id = p_id;
end;
$$;

-- ------------------------------------------------------------
-- 5. SEED DATA
-- ------------------------------------------------------------

-- Categories
insert into public.categories (name, slug, icon, sort_order) values
  ('သမိုင်းကြောင်း', 'history', 'menu_book', 1),
  ('စစ်ရေး',        'war',      'swords',    2),
  ('ယဉ်ကျေးမှု',    'culture',  'temple_buddhist', 3),
  ('သက်သေမှတ်တမ်း', 'evidence', 'history_edu', 4)
on conflict (slug) do nothing;

-- Topics (seed content about King Tabinshwehti)
insert into public.history_topics (slug, title, summary, content, cover_image_url, category_id, period_label, year_start, location, authenticity_status, votes, sources, is_published) values

('early-rule',
 'နန်းတက်ခြင်းနှင့် အစောပိုင်းကာလ',
 'တောင်ငူမင်းဆက်ကို အုတ်မြစ်ချခဲ့ပုံနှင့် ငယ်ရွယ်စဉ်ကာလကပင် ပြသခဲ့သည့် ခေါင်းဆောင်မှု အရည်အသွေးများ။',
 'တပင်ရွှေထီးမင်းသည် အင်အား၊ ဗဟုသုတနှင့် သတ္တိတို့ဖြင့် ပြည့်စုံသော ဒုတိယမြန်မာနိုင်ငံတော်ကို တည်ထောင်သူအဖြစ် မှတ်တမ်းတင်ခံရသည်။ ငယ်ရွယ်စဉ်ကာလကပင် တောင်ငူမင်းဆက်၏ အုပ်ချုပ်ရေးအခြေခံကို ခိုင်မာစေရန် ကြိုးပမ်းခဲ့ပြီး နိုင်ငံတော်ချဲ့ထွင်ရေးအတွက် ခေါင်းဆောင်မှုကို ပြသခဲ့သည်။',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuALRzxXd0M9mGMzLG52i4rEAC2VdtdWPU8XLLnbiCSAaeeKzpx_GAiebj4b-R7UnwqhkSzLKAro1Y669kLNu0Bi7O6EO0wnYve6Wv1A3McMMZK5BwG29wC2wj_HWW8zLaClonldc0JoiTGtsmI18WV5IjZPGOYtidJ3I-XrYHnJSWxsBVmqW370yKvDAKqp2oa3gfOovI6sfKaE1n-hXE5SxbfhuJZCpYgYtREL7Z4FD7208tT9mIVov6iKos1M_cNfagcZi535pAY',
 (select id from public.categories where slug = 'history'),
 'မြန်မာသက္ကရာဇ် ၈၉၀ ဝန်းကျင်', '၁၅၃၀', 'တောင်ငူ',
 'likely_true',
   '{"true": 0, "false": 0, "disputed": 0, "needs_more_evidence": 0}',
  '[]',
  true),

('hanthawaddy-conquest',
 'ဟံသာဝတီ အောင်ပွဲ',
 'ဟံသာဝတီကို သိမ်းပိုက်နိုင်ခြင်းသည် တောင်ငူအင်ပါယာအတွက် ပထမဆုံးသော ကြီးကျယ်သည့် အောင်မြင်မှုဖြစ်ခဲ့သည်။',
 'ရန်ကုန်နှင့် ပဲခူးတစ်ဝိုက်ရှိ ဟံသာဝတီကို သိမ်းပိုက်ခြင်းသည် တောင်ငူအင်ပါယာအတွက် အရေးပါသော စစ်ရေးအောင်မြင်မှုဖြစ်သည်။ ရေကြောင်းနှင့် ကုန်းကြောင်း ညှိနှိုင်းစစ်ဆင်ရေးများကို အသုံးပြုကာ အင်အားစုများကို စည်းလုံးညီညွတ်စွာ ဦးဆောင်နိုင်ခဲ့ခြင်းက အောင်မြင်မှု၏ အဓိကအကြောင်းရင်းတစ်ခုဖြစ်သည်။',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwm2RUrTdLT9SMCQAT1mcmcmUlGufU3akf83hLZdYwmA3Q8tQdExzZSvZt4i_ad0FadRx7z9p9NT_iuDz5GXsuAnSxxuquLjqR0jmMBjMiOZa0boPW-f8M9lk607CrqTB_O9M8HRlkfAhuRhT7-f5paunIsUS2LkApRdNNgieqq1igAd10mxKifgFBiBdB90gRIRgrEHt6OKLJBeGv9ewC6w9R49yraqNajyTOszUufRvyJ1HvvGg3478pOdUwpcJoVoVXT-apn-g',
 (select id from public.categories where slug = 'war'),
 'အေဒီ ၁၅၃၈', '၁၅၃၈', 'ဟံသာဝတီ / ပဲခူး',
 'verified',
 '{"true": 0, "false": 0, "disputed": 0, "needs_more_evidence": 0}',
 '[]',
  true),

('martaban-campaign',
 'မုတ္တမ အောင်ပွဲ',
 'ပင်လယ်ကမ်းရိုးတန်းမြို့ဖြစ်သော မုတ္တမကို ရဲရဲဝံ့ဝံ့ စီးနင်းသိမ်းပိုက်နိုင်ခဲ့သည့် စစ်ရေးအခန်းကဏ္ဍ။',
 'မုတ္တမအောင်ပွဲသည် ပင်လယ်ကမ်းရိုးတန်းနှင့် ကုန်သွယ်ရေးလမ်းကြောင်းအပေါ် ထိန်းချုပ်မှုကို ခိုင်မာစေခဲ့သည်ဟု သမိုင်းမှတ်တမ်းများတွင် ဖော်ပြသည်။ သို့သော် စစ်ဆင်ရေးအသေးစိတ်၊ အင်အားအရေအတွက်နှင့် ခေတ်ပြိုင်အထောက်အထားများအပေါ်တွင် နောက်ထပ်သက်သေအထောက်အထား လိုအပ်နေသည်။',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtxVx2wgZ_VFlIXRZKojL0hZ-yGbZhvO9i_Z468OuTyubNVSNq25_pHaxSbLW1vIjvJPkWasINKQH_F1cepiNSSWMRgTA7CumYFO_Cgz0rOvhP16tszOdwSczBpcc6adYIwxX4gp_CPw0wKbGZxAIMYjNFVaG5h4kQaYPpmR6YiBjwtEx6NhQGA1ERQCr-Q1XSefTvaSPUdOVJP4WsZPOncJC_SQTWzVT2nIsp9-hEazNoB3UPE5Ic3Gxxh8Q7eVG7Grs9xKZSC4o',
 (select id from public.categories where slug = 'war'),
 'အေဒီ ၁၅၄၁', '၁၅၄၁', 'မုတ္တမ',
 'disputed',
 '{"true": 0, "false": 0, "disputed": 0, "needs_more_evidence": 0}',
 '[]',
  true),

('religious-patronage',
 'သာသနာပြုလုပ်ငန်းများ',
 'ရွှေမော်ဓောစေတီတော်နှင့် သာသနာရေးဆိုင်ရာ လှူဒါန်းမှုများ၊ စာပေယဉ်ကျေးမှု မြှင့်တင်မှုများ။',
 'တပင်ရွှေထီးမင်းသည် ဟံသာဝတီကို အောင်မြင်ပြီးနောက် ရွှေမော်ဓောစေတီတော်မြတ်အား ရွှေသင်္ကန်းကပ်လှူခြင်း၊ ထီးတော်တင်လှူခြင်းတို့ဖြင့် ဗုဒ္ဓသာသနာကို ချီးမြှောက်ခဲ့သည်ဟု မှတ်တမ်းများက ဆိုသည်။ စစ်ရေးထက်မြက်ရုံသာမက သာသနာရေးနှင့် ယဉ်ကျေးမှုထိန်းသိမ်းရေးတွင်လည်း ဆောင်ရွက်မှုများရှိခဲ့သည်။',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJclSVzW1Gz2woe3Or1NkZQnkSCWqH7Dh_YoI0b3qfHJ_y4ydN15Ceu0pX4eeBdLNRn5h9rphu9baCjA7s1o8xhUamwAkasiBCla8OY6Z8iav4RC6A6ddyXVJRkPEdMGj5TWweutRv-Yz6UhQW0lg6jdjk2ORv39m9ZrZGff1ZJnNJw3QF6ccS8k01bZHb2ikrypTtfstLSLl1hzy1lhiBBka4-sqCDtXTI2CN9YbG7DDhzuvrRjHNfdsFKuP1Ba6jthnaFaAl6Gw',
 (select id from public.categories where slug = 'culture'),
 'တောင်ငူခေတ်', '၁၅၃၀-၁၅၅၀', 'ဟံသာဝတီ / တောင်ငူ',
 'likely_true',
 '{"true": 0, "false": 0, "disputed": 0, "needs_more_evidence": 0}',
 '[]',
  true),

('portuguese-records',
 'ပေါ်တူဂီမှတ်တမ်းများ',
 'အနောက်တိုင်းခရီးသွားများ၏ အမြင်တွင် တွေ့မြင်ရသော တပင်ရွှေထီးမင်းနှင့် ဟံသာဝတီစစ်ပွဲများအကြောင်း မှတ်တမ်းများ။',
 'ပေါ်တူဂီခရီးသွားနှင့် စစ်ဘက်ဆိုင်ရာ မှတ်တမ်းများတွင် တပင်ရွှေထီးမင်း၏ စစ်ဆင်ရေးများအကြောင်းကို ဖော်ပြထားသော်လည်း ရေးသားသူ၏ အတွေ့အကြုံ၊ နိုင်ငံရေးနောက်ခံနှင့် ဘာသာပြန်အခြေအနေတို့ကြောင့် အချက်အလက်တချို့ကို နှိုင်းယှဉ်စစ်ဆေးရန် လိုအပ်သည်။',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuBx9t-W61OXoIFUIYd9bnaA2R-WdoRcfRmpnSfYElj9NLmhw3HAKKGoIX6NLc2x6hXZ0uOl0XsbFyEt6mKyQsHETMv_hTczjDeSu_1haf8mBNFE-gu6ZHl_m9r5sA6KPYCDbbVk84B40IgeBZpB8-qEjypwhbqcsTO5s6pzxnTbbEkCmfNaDnLXpBF7kHPpRPJ_-xNzb4gDkLT-d4NHZQ_LgYlPNOJy0-I4adirsgBJ1h4rk8br6Rg5I5TxG4bWTGL-_QgA9GtyMl4',
 (select id from public.categories where slug = 'evidence'),
 'အေဒီ ၁၅၄၀ ဝန်းကျင်', '၁၅၄၀', 'ဟံသာဝတီ',
 'needs_review',
 '{"true": 0, "false": 0, "disputed": 0, "needs_more_evidence": 0}',
 '[{"title":"Fernão Mendes Pinto ဆိုင်ရာ မှတ်တမ်းများ","type":"Foreign record","quality":"Needs verification"}]',
  true)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- 6. BACKFILL: create profiles for any existing auth.users
-- ------------------------------------------------------------
insert into public.profiles (id, display_name, role)
select
  au.id,
  coalesce(au.raw_user_meta_data ->> 'display_name', split_part(au.email, '@', 1), 'Member'),
  'member'
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 7. GRANTS (for Supabase anon key)
-- ------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;
