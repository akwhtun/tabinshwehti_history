# Tabinshwehti Historical Archive

A Myanmar-language historical knowledge platform about King Tabinshwehti and the Toungoo Empire. Built with React + Vite and Supabase.

## Features

- Browse history topics with search and category filtering
- Read detailed topic articles with images and metadata
- Vote on historical authenticity (True / False / Disputed / Needs More Evidence)
- Submit evidence and reasoning sources
- Comment on topics with threaded replies
- Admin dashboard for topic editing, moderation, and evidence review
- PDF download for each topic (browser-rendered with Noto Serif Myanmar)
- Dual-language UI (Burmese / English)
- Dark royal archive visual theme

## Tech Stack

- **Frontend:** React 19, Vite 6
- **Backend:** Supabase (Auth, Postgres, RLS, RPC)
- **Styling:** Custom CSS (dark theme)
- **i18n:** Custom LangProvider + useLang hook
- **PDF:** html2canvas + jsPDF (browser-native Myanmar text rendering)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

### Environment Variables

Create `.env.local`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_ADMIN_EMAIL=admin@example.com
```

### Database

Run `supabase/schema.sql` in your Supabase SQL editor to create tables, RLS policies, RPC functions, and seed data.

## Project Structure

```
src/
  components/    # Reusable UI components (Header, AuthModal, Comments, etc.)
  pages/         # Page components (Home, TopicDetail, AdminDashboard, etc.)
  i18n/          # Language files (my.js, en.js) and provider
  data/          # Static UI mappings (constants.js)
  lib/           # Supabase client
  styles/        # app.css
supabase/
  schema.sql     # Full schema + seed data
```

## Routes

- `#` — Home
- `#topics` — Topics Archive
- `#topic/{slug}` — Topic Detail
- `#admin` — Admin Dashboard
- `#about`, `#contact`, `#privacy`, `#terms` — Static pages
