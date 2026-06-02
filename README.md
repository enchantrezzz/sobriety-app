# Sobriety App

A React + Supabase sobriety companion app with:

- authentication (email/password + Google)
- multiple sobriety timers
- relapse post-mortem flow
- trigger logging + insights
- daily pledges
- AI vent chat via Supabase Edge Function
- PWA support

## Tech Stack

- React 19 + Vite
- React Router
- Tailwind CSS
- Supabase (Auth + Postgres + RLS + Edge Functions)
- Vitest (unit tests)

## Quick Start

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy `.env.example` to `.env` and fill in values:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_claude_api_key
```

Notes:
- `VITE_*` vars are frontend variables.
- `ANTHROPIC_API_KEY` is for the edge function runtime and should never be exposed in frontend code.

### 3) Set up Supabase database

Run:

1. `supabase/schema.sql`
2. `supabase/migrations/add_timer_id_to_pledges.sql`

in your Supabase SQL editor (or apply with Supabase CLI).

### 4) Run the app

```bash
npm run dev
```

App runs on Vite's local dev server (usually `http://localhost:5173`).

## Available Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run preview` - preview built app
- `npm run lint` - run ESLint
- `npm test` - run unit tests (Vitest)

## AI Chat Edge Function

The app calls a Supabase Edge Function at:

- `supabase/functions/ai-chat/index.ts`

The function:
- verifies user auth from bearer token
- loads messages from the request
- sends prompt + messages to Anthropic
- stores chat history in `chat_sessions`

You need to deploy this function to your Supabase project for AI chat to work in production.

## Core Database Tables

- `profiles`
- `timers`
- `relapses`
- `trigger_logs`
- `pledges` (with optional `timer_id` after migration)
- `chat_sessions`

All user data tables use Row Level Security (RLS).

## PWA

PWA is configured via `vite-plugin-pwa` in `vite.config.js` and uses `public/icons.svg` for the manifest icon.

## Current Test Coverage

Minimal unit coverage exists for milestone behavior:

- `src/utils/milestones.test.js`

It verifies:
- milestone threshold crossing logic
- duplicate-alert key behavior
- reset regression via changed `started_at` key

## Deployment Notes

- `vercel.json` contains SPA route rewrites.
- Ensure Supabase env vars are configured in your deployment environment.
- Ensure the `ai-chat` edge function is deployed and `ANTHROPIC_API_KEY` is set in function secrets.
