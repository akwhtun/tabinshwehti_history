# Tabinshwehti Project Specification

## 1. Project Overview

### Name
Tabinshwehti

### Product Type
Web app and mobile app.

### Backend Service
Supabase backend using Auth, Postgres, Storage, Realtime, Row Level Security, and Edge Functions where needed.

### Purpose
Tabinshwehti is a Myanmar-language historical knowledge platform focused on King Tabinshwehti and the Toungoo Empire. The current project is a static HTML historical archive with Myanmar content and a strong royal archive visual style. The expanded project should keep that content and design direction, then add registration, authenticated discussion, authenticated voting on historical truth/authenticity, add comment and share content,evidence-based reasoning, admin correction workflows, sharing, and PDF downloads.

### Current Project Baseline
The existing project contains four static HTML pages:

- `index.html`: homepage with hero, featured sections, royal imagery, and entry points into history, war, and culture.
- `history.html`: archive/document listing page with search/filter UI, history record cards, categories, and PDF download buttons.
- `war.html`: military/conquest page with hero, battle cards, timeline, and quote section.
- `culture.html`: culture/religion/art page with hero, bento content grid, artifact cards, and decorative effects.

The expanded app must reuse:

- Existing Myanmar historical content.
- Dark royal visual style.
- Gold primary color and charcoal background.
- Noto Serif Myanmar heading style.
- Manrope body font.
- Parchment, archive, royal, and Kanote-inspired design motifs.
- Material Symbols icon language unless the final frontend stack replaces it with an equivalent icon system.

## 2. Product Goals

1. Preserve and organize Myanmar-language history content about King Tabinshwehti.
2. Let anyone register and participate as a member.
3. Let authenticated members comment on each history topic.
4. Let authenticated members vote whether a history topic is true, false, disputed, or needs more evidence.
5. Let authenticated members submit reasons and evidence sources that support or challenge a history topic.
6. Give admins a clear review workflow to fix, update, or annotate history topics when community feedback shows a topic may be false.
7. Allow users to download each history topic as a PDF.
8. Support both web and mobile app experiences using the same Supabase backend.

## 3. Target Users

### Guest Visitor
Can browse public historical content, search/filter topics, read comments if public, view vote summaries, share links, and download public PDFs if allowed by product policy.

### Registered Member
Can do everything a guest can do, plus comment, vote, submit reasons/evidence, save/bookmark topics, report inappropriate content, and manage their profile.

### Admin / Historian Editor
Can create, edit, publish, unpublish, correct, and version history topics. Can moderate comments, review evidence, mark evidence quality, resolve disputed topics, and generate official PDF versions.

### Super Admin
Can manage admins, site settings, categories, source types, moderation policies, and audit logs.

## 4. Design Requirements

### Design Direction
The new app should feel like a digital royal archive, not a generic social platform. Keep the current atmosphere: historically serious, elegant, Myanmar-first, readable, and visually rich.

### Existing Style To Preserve

- Background: deep charcoal / black, similar to `#131313`.
- Primary color: royal gold, similar to `#f2ca50`.
- Secondary accents: burgundy / deep red from current pages.
- Typography:
  - Headings: `Noto Serif Myanmar`.
  - Body/UI: `Manrope` or a compatible readable sans-serif.
- Motifs:
  - Kanote dividers.
  - Parchment textures.
  - Gold borders and subtle glows.
  - Archive cards, document cards, battle timeline, cultural artifact cards.
- Layout:
  - Desktop max content width around 1200px.
  - Mobile margins around 16px.
  - Desktop margins around 64px.
  - Bento sections and timeline sections may be reused.

### Navigation
Primary navigation should include:

- Home
- History Topics
- War / Conquests
- Culture
- Sources / Evidence
- Community
- Profile
- Admin Dashboard, visible only to admins

### Responsive Requirements

- Web must support mobile, tablet, and desktop.
- Mobile app must reuse the same content structure but use native mobile navigation patterns.
- Myanmar text must be tested for line height, wrapping, and readability.
- Buttons must not overflow on small screens.
- History cards and voting controls must remain usable on phones.

## 5. Content Model

The current static pages should be converted into structured content.

### Main Content Types

1. History Topic
   Examples: early life, coronation, Hanthawaddy conquest, Prome conquest, Martaban, religious patronage, culture, artifacts.

2. Source / Evidence
   Historical records, chronicles, inscriptions, foreign accounts, books, articles, museum references, uploaded documents, external URLs.

3. Comment
   Member discussion for each topic.

4. Vote
   Member authenticity vote for each topic.

5. Reason
   Member explanation for why they believe the topic is true, false, disputed, or needs more evidence.

6. Revision
   Admin edits to history topics with before/after content and correction notes.

## 6. Core Features

### 6.1 Authentication

Anyone can register.

Required:

- Email/password registration.
- Login/logout.
- Password reset.
- Profile creation after signup.
- Optional social login later.
- Authenticated-only actions for commenting, voting, evidence submission, and bookmarks.

User profile fields:

- Display name.
- Avatar.
- Bio.
- Role.
- Preferred language.
- Created date.
- Reputation or contribution score, optional for later phases.

### 6.2 History Topic Browsing

Users can:

- Browse all topics.
- Search by title, summary, year, category, or source.
- Filter by category.
- Filter by authenticity status.
- Sort by newest, oldest, most discussed, most disputed, highest confidence.
- Open a detail page for each topic.

Topic list card should show:

- Title.
- Category.
- Year or historical period.
- Short summary.
- Thumbnail or archive icon.
- Current authenticity status.
- Vote summary.
- Comment count.
- PDF download action.

### 6.3 History Topic Detail

Each detail page should include:

- Hero or archive-style header.
- Title.
- Category.
- Timeline/year metadata.
- Main Myanmar content.
- Images, artifacts, maps, or document visuals.
- Sources/evidence section.
- Authenticity voting panel.
- Reasons/evidence submissions.
- Comment thread.
- Share action.
- Download PDF action.
- Revision/correction history if admins have changed the topic.

### 6.4 Voting For Authenticity

Only authenticated members can vote.

Vote options:

- True
- False
- Disputed
- Needs More Evidence

Voting rules:

- One active vote per user per topic.
- User can change their vote.
- Vote change should update totals.
- Vote reason is optional for simple voting, but recommended.
- If a user votes `False` or `Disputed`, the UI should encourage a reason and evidence source.

Vote summary should show:

- Total votes.
- Percentage for each option.
- Current community status.
- Admin verified status if available.
- Last updated date.

Community status logic:

- `Likely True`: true votes are clearly dominant and evidence is strong.
- `Disputed`: no clear majority or high false/disputed voting.
- `Needs Review`: false/disputed votes pass an admin-configured threshold.
- `Corrected`: admin has edited the topic based on review.
- `Verified`: admin/historian has reviewed and approved the content.

Recommended review threshold:

- If `False` + `Disputed` votes exceed 40 percent and at least 10 total votes exist, mark the topic as `Needs Review`.
- Thresholds should be configurable in admin settings.

### 6.5 Reasons And Evidence

Members can add reason content to prove or challenge whether the history topic is true.

Reason fields:

- Topic.
- Author.
- Position: supports, challenges, disputes, adds context.
- Reason text.
- Source title.
- Source URL, optional.
- Source type.
- Attachment, optional.
- Quoted excerpt, optional.
- Status: pending, visible, hidden, accepted, rejected.

Source types:

- Chronicle.
- Stone inscription.
- Foreign record.
- Academic book.
- Academic article.
- Museum/archive.
- Oral tradition.
- Website.
- Other.

Evidence quality labels:

- Primary source.
- Secondary source.
- Needs verification.
- Weak source.
- Admin accepted.

### 6.6 Comments

Authenticated members can comment on history topics.

Comment requirements:

- Create comment.
- Edit own comment within a configurable window, recommended 15 minutes.
- Delete own comment or soft-delete.
- Reply threading, at least one level.
- Admin moderation.
- Report comment.
- Sort by newest, oldest, or most useful.

Moderation:

- Admin can hide comments.
- Admin can restore hidden comments.
- Admin can lock a topic from further comments.
- All moderation actions should be logged.

### 6.7 Sharing

Users can share:

- Topic link.
- Topic title and summary.
- Authenticity status.
- Optional generated share image in later phase.

Required web share options:

- Copy link.
- Native Web Share API where supported.
- Facebook/Messenger/Viber/Telegram links can be considered for Myanmar audience.

### 6.8 PDF Download

Each history topic can be downloaded as a PDF.

PDF should include:

- Project name.
- Topic title.
- Category and timeline/year.
- Main content.
- Images where appropriate.
- Sources/evidence list.
- Authenticity summary.
- Admin verification/correction note.
- Generated date.

PDF generation options:

- MVP: browser print-to-PDF or server-generated PDF from an HTML template.
- Recommended: Supabase Edge Function or app server route that renders a controlled HTML template to PDF.
- Store generated PDFs in Supabase Storage for caching if topic content has not changed.

PDF filename format:

`tabinshwehti-{topic-slug}-{version}.pdf`

### 6.9 Admin Topic Correction Workflow

Admins need a clear process when many users say a history topic is false.

Workflow:

1. Topic receives enough false/disputed votes.
2. Topic status changes to `Needs Review`.
3. Admin dashboard shows the topic in a review queue.
4. Admin reviews comments, reasons, sources, and vote distribution.
5. Admin can choose:
   - Mark verified without content changes.
   - Edit/correct the topic.
   - Add admin note.
   - Request more evidence.
   - Hide misleading content temporarily.
6. Every edit creates a revision record.
7. Users can see that the topic was corrected, with a short correction note.

Revision history should include:

- Edited by.
- Edited at.
- Previous title/content snapshot.
- New title/content snapshot.
- Admin correction note.
- Reason for change.
- Related evidence IDs.

## 7. Recommended Information Architecture

### Public Web Routes (hash-based SPA, no router library)

- `#` or empty — Home
- `#topics` — Topics Archive (search, filter, browse)
- `#topic/{slug}` — Topic Detail (content, votes, comments, evidence)
- `#about` — About Page
- `#contact` — Contact Page
- `#privacy` — Privacy Policy
- `#terms` — Terms of Use

### Authenticated Routes

- Same as public routes plus authenticated voting, commenting, and evidence submission inline.

### Admin Routes

- `#admin` — Admin Dashboard with tabs:
  - Dashboard (metrics, review queue)
  - Topics (topic list, editor)
  - Users (user management)
  - Comments (comment moderation)
  - Evidence (reason/evidence moderation)

### Mobile App Tabs

- Home
- Topics
- Saved
- Community
- Profile

Admin tools on mobile can be limited in MVP, but admins should at least be able to view review alerts.

## 8. Supabase Data Model

> **Note:** The full schema with seed data and RPCs is in `supabase/schema.sql`. Run it in the Supabase SQL editor to bootstrap the project.

### `categories`

| Column       | Type                    | Notes                |
|-------------|-------------------------|----------------------|
| id          | `uuid PK default gen_random_uuid()` | |
| name        | `text NOT NULL`          | Myanmar name         |
| slug        | `text UNIQUE NOT NULL`   | English slug         |
| icon        | `text NOT NULL`          | Material icon name   |
| sort_order  | `int DEFAULT 0`          | Display order        |
| created_at  | `timestamptz DEFAULT now()` | |

Initial seed: history (menu_book), war (swords), culture (temple_buddhist), evidence (history_edu).

### `profiles`

Linked 1:1 to `auth.users` via foreign key. Auto-created on signup by the `handle_new_user()` trigger.

| Column             | Type                           | Notes                        |
|-------------------|--------------------------------|------------------------------|
| id                | `uuid PK references auth.users(id) ON DELETE CASCADE` | |
| display_name      | `text NOT NULL DEFAULT ''`     | From user metadata or email  |
| avatar_url        | `text`                         | Optional                     |
| bio               | `text`                         | Optional                     |
| role              | `text NOT NULL DEFAULT 'member' CHECK(role IN ('member','admin','super_admin'))` | |
| preferred_language| `text DEFAULT 'my'`            |                              |
| is_banned         | `boolean DEFAULT false`        |                              |
| created_at        | `timestamptz DEFAULT now()`    |                              |
| updated_at        | `timestamptz DEFAULT now()`    |                              |

Allowed roles: `member`, `admin`, `super_admin`.

### `history_topics`

| Column                | Type                           | Notes                              |
|----------------------|--------------------------------|------------------------------------|
| id                   | `uuid PK default gen_random_uuid()` | |
| category_id          | `uuid REFERENCES categories(id)` | |
| title                | `text NOT NULL`                 | Myanmar title                      |
| slug                 | `text UNIQUE NOT NULL`          | URL-friendly identifier            |
| summary              | `text NOT NULL DEFAULT ''`      | Short preview                      |
| content              | `text NOT NULL DEFAULT ''`      | Full Myanmar article body           |
| cover_image_url      | `text NOT NULL DEFAULT ''`      | Hero/thumbnail image                |
| period_label         | `text NOT NULL DEFAULT ''`      | e.g. "တောင်ငူခေတ်"                    |
| year_start           | `text NOT NULL DEFAULT ''`      | Text year for display              |
| location             | `text NOT NULL DEFAULT ''`      | e.g. "တောင်ငူ"                        |
| authenticity_status  | `text DEFAULT 'unverified' CHECK(...)` | See allowed values below      |
| admin_note           | `text DEFAULT ''`               | Internal admin annotation          |
| votes                | `jsonb NOT NULL DEFAULT '{"true":0,"false":0,"disputed":0,"needs_more_evidence":0}'` | Denormalized vote counts, updated by `cast_vote()` RPC |
| sources              | `jsonb NOT NULL DEFAULT '[]'`   | Array of `{title, type, quality}`  |
| is_published         | `boolean DEFAULT true`          | Visibility flag                    |
| created_by           | `uuid REFERENCES profiles(id)`  | Optional creator                   |
| updated_by           | `uuid REFERENCES profiles(id)`  | Optional last editor               |
| published_at         | `timestamptz`                   |                                   |
| created_at           | `timestamptz DEFAULT now()`     |                                   |
| updated_at           | `timestamptz DEFAULT now()`     |                                   |

Allowed `authenticity_status`: `unverified`, `likely_true`, `disputed`, `needs_review`, `corrected`, `verified`.

### `topic_votes`

One vote per user per topic (enforced by `UNIQUE(topic_id, user_id)`). The `cast_vote()` RPC handles upserts and recalculates the `votes` JSONB on `history_topics`.

| Column     | Type                          | Notes                          |
|-----------|-------------------------------|--------------------------------|
| id         | `uuid PK default gen_random_uuid()` | |
| topic_id   | `uuid REFERENCES history_topics(id) ON DELETE CASCADE` | |
| user_id    | `uuid REFERENCES profiles(id) ON DELETE CASCADE` | |
| vote       | `text NOT NULL CHECK(...)`     | `true`, `false`, `disputed`, `needs_more_evidence` |
| created_at | `timestamptz DEFAULT now()`    | |
| updated_at | `timestamptz DEFAULT now()`    | |

### `topic_reasons`

| Column       | Type                          | Notes                          |
|-------------|-------------------------------|--------------------------------|
| id           | `uuid PK default gen_random_uuid()` | |
| topic_id     | `uuid REFERENCES history_topics(id) ON DELETE CASCADE` | |
| user_id      | `uuid REFERENCES profiles(id) ON DELETE CASCADE` | |
| position     | `text NOT NULL DEFAULT 'supports'` | `supports`, `challenges`, `disputes`, `context` |
| body         | `text NOT NULL DEFAULT ''`     | Reason/evidence text            |
| source_title | `text DEFAULT ''`              | Optional                       |
| source_url   | `text DEFAULT ''`              | Optional                       |
| source_type  | `text DEFAULT ''`              | Optional                       |
| status       | `text DEFAULT 'pending' CHECK(...)` | `pending`, `visible`, `hidden`, `accepted`, `rejected` |
| reviewed_by  | `uuid REFERENCES profiles(id)` | Admin who reviewed              |
| reviewed_at  | `timestamptz`                  |                                |
| created_at   | `timestamptz DEFAULT now()`    | |
| updated_at   | `timestamptz DEFAULT now()`    | |

### `comments`

Threaded (one level of nesting via `parent_id`).

| Column     | Type                          | Notes                          |
|-----------|-------------------------------|--------------------------------|
| id         | `uuid PK default gen_random_uuid()` | |
| topic_id   | `uuid REFERENCES history_topics(id) ON DELETE CASCADE` | |
| user_id    | `uuid REFERENCES profiles(id) ON DELETE CASCADE` | |
| parent_id  | `uuid REFERENCES comments(id) ON DELETE CASCADE` | Null for top-level comments   |
| body       | `text NOT NULL`                |                                |
| status     | `text DEFAULT 'visible' CHECK(...)` | `visible`, `hidden`, `deleted`, `flagged` |
| created_at | `timestamptz DEFAULT now()`    | |
| updated_at | `timestamptz DEFAULT now()`    | |

### `topic_revisions`

Admin edit history — stores raw JSON snapshots before/after each correction.

| Column            | Type                          | Notes                          |
|------------------|-------------------------------|--------------------------------|
| id                | `uuid PK default gen_random_uuid()` | |
| topic_id          | `uuid REFERENCES history_topics(id) ON DELETE CASCADE` | |
| edited_by         | `uuid REFERENCES profiles(id)` | Admin who edited               |
| previous_snapshot | `jsonb NOT NULL`               | `{title, summary, content, status}` |
| new_snapshot      | `jsonb NOT NULL`               | `{title, summary, content, status}` |
| correction_note   | `text DEFAULT ''`              | Why the edit was made          |
| created_at        | `timestamptz DEFAULT now()`    | |

### Views

**`topic_vote_summary`** — Aggregates `topic_votes` into per-topic totals:
`topic_id, total_votes, true_votes, false_votes, disputed_votes, needs_more_evidence_votes`

### RPC Functions

**`cast_vote(p_topic_id uuid, p_vote text) RETURNS jsonb`**
- Upserts into `topic_votes`
- Recalculates all vote counts from `topic_votes`
- Updates `history_topics.votes` with the new JSONB object
- Returns the new `votes` object for immediate UI update
- Called from frontend as `supabase.rpc('cast_vote', { p_topic_id, p_vote })`

### Triggers

**`on_auth_user_created`** (AFTER INSERT ON `auth.users`)
- Calls `handle_new_user()` which inserts a row into `profiles`
- Sets `display_name` from `raw_user_meta_data` or email prefix
- Sets `role` to `admin` if email matches `app.settings.admin_email` (checked via `current_setting`)

## 9. Supabase Security Requirements

### Row Level Security

Enable RLS on all user-facing tables.

Policy summary:

- Guests can read published topics, visible comments, visible/accepted reasons, categories, and public vote summaries.
- Members can insert their own comments, votes, reasons, reports, and profile updates.
- Members can update only their own profile, comments, votes, and reasons within allowed rules.
- Admins can manage topics, comments, reasons, reports, PDFs, and revisions.
- Super admins can manage roles and settings.

### Important Security Rules

- Users cannot change their own role.
- Banned users cannot comment, vote, or submit reasons.
- Only admins can publish or unpublish topics.
- Only admins can mark evidence as accepted/rejected.
- Only admins can write revision records manually.
- Storage uploads must be limited by file type and size.

## 10. Backend Logic

### Vote Aggregation

Use a database view or materialized view for vote totals:

- Topic ID.
- Total votes.
- True count.
- False count.
- Disputed count.
- Needs more evidence count.
- Percentages.

Use a trigger or scheduled function to update `authenticity_status` when vote thresholds are crossed.

### PDF Generation

Use a server-side function or app route that:

1. Loads topic content and sources.
2. Loads vote summary and admin notes.
3. Renders a print-safe HTML template.
4. Generates PDF.
5. Saves to Supabase Storage.
6. Returns signed/public URL.

### Moderation Queue

Admin dashboard should show:

- Topics needing review.
- Pending reasons/evidence.
- Flagged comments.
- Reported users/content.
- Recent high-dispute topics.

## 11. Web App Screen Specifications

### Home

Reuse the current `index.html` layout:

- Royal hero image/seal.
- Project title.
- Short Myanmar intro.
- Featured history, conquest, and culture sections.
- Quote/legacy section.
- Footer.

New additions:

- Register/Login buttons.
- Current featured disputed topic.
- Recent verified/corrected topics.
- Call to participate in evidence review.

### Topics List

Based on the current `history.html` archive design.

Must include:

- Search input.
- Filter button.
- Category sidebar.
- Topic list cards.
- Authenticity badge.
- Vote summary mini bar.
- PDF download action.
- Pagination or infinite loading.

### Topic Detail

Must include:

- Topic content.
- Source/evidence panel.
- Voting panel.
- Reason submission form.
- Comments.
- Share and PDF actions.
- Admin correction note when available.

### Voting Panel

UI requirements:

- Four clear voting buttons.
- Current vote highlighted for logged-in user.
- Login prompt for guests.
- Vote distribution chart.
- Short text explaining current status.
- `Add reason` action.

### Comment Section

UI requirements:

- Login prompt for guests.
- Comment composer for members.
- Comment list.
- Reply action.
- Report action.
- Admin moderation state if hidden.

### Admin Dashboard

Must include:

- Metrics overview.
- Review queue.
- Pending evidence.
- Flagged comments.
- Topic editor.
- Revision history viewer.
- User management.

## 12. Mobile App Specifications

### Platform
Mobile app should use the same Supabase backend and content model. Recommended options:

- React Native / Expo for fastest cross-platform development.
- Flutter if the team prefers Dart and stronger native UI control.

### Core Mobile Features

- Browse topics.
- Search/filter topics.
- Read topic detail.
- Register/login.
- Vote.
- Submit reasons/evidence.
- Comment.
- Share.
- Download or open PDF.
- Bookmark topics.
- Profile and contribution history.

### Mobile UX

- Bottom tab navigation.
- Topic detail should prioritize reading.
- Voting should be a compact sticky section or visible action panel.
- Comments and reasons can be separate tabs inside the topic detail page.
- PDF download should open the device share/save sheet where possible.

## 13. Search Requirements

MVP:

- Search title, summary, content, category, and year fields using Postgres full-text search or `ilike`.

Later:

- Myanmar-aware search improvements.
- Tag-based browsing.
- Search suggestions.
- Highlight matched terms.

## 14. Notifications

MVP notifications:

- In-app notification when an admin accepts/rejects a user's reason.
- In-app notification when a user's comment receives a reply.
- In-app notification when a topic the user voted on is corrected.

Later:

- Email notifications.
- Push notifications for mobile.

## 15. Analytics And Admin Metrics

Track:

- Topic views.
- PDF downloads.
- Shares.
- Votes by topic.
- Disputed topics.
- Comment volume.
- Evidence submission volume.
- Admin corrections.

Admin dashboard should show:

- Most viewed topics.
- Most downloaded PDFs.
- Most disputed topics.
- Recently corrected topics.
- Active contributors.

## 16. Non-Functional Requirements

### Performance

- Topic list should load within 2 seconds on normal mobile network.
- Images should use responsive sizes and lazy loading.
- PDF generation may be asynchronous for large topics.

### Accessibility

- Keyboard navigation on web.
- Sufficient color contrast.
- Screen reader labels for icons.
- Clear focus states.
- Forms must have labels and error messages.

### Localization

- Primary language: Myanmar.
- Admin labels can initially be English or Myanmar depending on team preference.
- Content schema should support English translations later.

### Data Integrity

- Topic revisions must preserve previous content.
- Votes must be unique per user/topic.
- Comments and reasons should use soft delete/hide behavior where moderation context matters.

### Backup

- Supabase database backups enabled.
- Storage backup strategy for uploaded evidence and generated PDFs.

## 17. Suggested MVP Scope

### MVP Phase 1: Foundation

- Convert static pages into app routes.
- Migrate existing Myanmar content into structured topic records.
- Supabase Auth.
- Profiles.
- Topic list/detail.
- Admin topic creation/editing.
- Public PDF download.

### MVP Phase 2: Community

- Comments.
- Authenticated voting.
- Vote summary.
- Reason/evidence submission.
- Basic report/moderation.

### MVP Phase 3: Admin Review

- Review queue.
- Admin correction workflow.
- Topic revisions.
- Evidence accept/reject.
- Automatic `Needs Review` status based on vote thresholds.

### MVP Phase 4: Mobile App

- Shared Supabase backend.
- Mobile topic browsing.
- Login/register.
- Voting.
- Comments.
- PDF open/share.

## 18. Acceptance Criteria

### Registration

- A guest can create an account.
- A registered user profile is created automatically.
- A logged-in member can comment, vote, and submit reasons.

### Voting

- A member can vote once per topic.
- A member can change their vote.
- Guests can see vote summaries but cannot vote.
- Topics with many false/disputed votes appear in admin review queue.

### Reasons/Evidence

- A member can submit a reason with optional source details.
- Admin can accept, reject, or hide evidence.
- Accepted evidence appears on the topic detail page.

### Admin Correction

- Admin can edit a topic.
- Each edit creates a revision record.
- Corrected topics show an admin note and correction status.

### PDF

- A user can download a PDF for a topic.
- PDF includes title, content, sources, vote summary, admin note, and generated date.

### Design

- New screens keep the same dark royal archive style.
- Myanmar text renders correctly.
- Layout works on mobile and desktop.

## 19. Open Questions

1. Should guests be allowed to download PDFs, or should PDF download require login?
2. Should member-submitted reasons appear immediately, or only after admin approval?
3. Do you want comments to be public for guests, or visible only to registered members?
4. Should the mobile app be built with React Native/Expo, Flutter, or another framework?
5. Do you want admin tools fully available on mobile, or web-only for the first version?
6. Do you already have trusted historical sources/books to seed the evidence database?
7. Should the app support English translations later, or remain Myanmar-only?
8. Should voting be anonymous publicly, or should other users see who voted?
9. Should false/disputed vote thresholds be automatic, admin-controlled, or both?
10. Should PDFs be plain official documents, or designed with the same royal archive visual style?

## 20. Current Implementation Status

### Frontend Architecture
- **Stack:** React + Vite (no router library — hash-based SPA)
- **Styling:** Single `src/styles/app.css` with CSS custom properties (dark theme)
- **i18n:** Custom `LangProvider` + `useLang` hook (`src/i18n/`)
- **Supabase client:** `src/lib/supabase.js` — returns `null` if env vars missing

### Data Flow (all Supabase, no localStorage fallback)
1. **Topics:** Fetched on mount from `history_topics` with `categories` join
2. **Votes:** Submitted via `rpc('cast_vote', ...)` — returns updated `votes` JSONB
3. **Comments:** Fetched per-topic with `profiles` join on topic change; inserted directly
4. **Reasons/Evidence:** Fetched per-topic with `profiles` join on topic change; inserted directly
5. **Admin auth:** Gated by `VITE_ADMIN_EMAIL` env var (case-insensitive)

### Seed Data
- Categories and topics are seeded via `supabase/schema.sql` (run in Supabase SQL editor)
- No hardcoded JS seed data — `src/data/constants.js` exports only static UI mappings (`statusMeta`, `voteOptions`, `categories` icons)
- The old `src/data/topics.js` has been removed

### Admin Dashboard (`#admin`)
- Tabs: Dashboard, Topics, Users, Comments, Evidence, Editor
- Each tab fetches real data from Supabase (profiles, comments, topic_reasons)
- Topic editor creates revision records in `topic_revisions`

### Auth
- Email/password via Supabase Auth
- `profiles` row auto-created by `handle_new_user()` trigger
- Admin role set at signup if email matches VITE_ADMIN_EMAIL

## 21. Recommended Next Step

Build the mobile app using the same Supabase backend and schema. The first implementation task should be running `supabase/schema.sql` in the Supabase SQL editor to bootstrap the database, then setting `.env.local` with the Supabase URL, anon key, and admin email.
