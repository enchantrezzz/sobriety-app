# Sobriety App — Project Document

## Overview

A Progressive Web App (PWA) that works on both mobile and desktop, designed to help users track sobriety, log triggers, vent to an AI, and gain insights into their patterns over time. Built with empathy at the core — relapses are treated as data points for growth, not failures.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Routing | React Router DOM |
| Backend / Auth / DB | Supabase |
| AI Venting Feature | Claude API (Anthropic) |
| Deployment | Vercel or Netlify (PWA) |

---

## Project Structure

```
sobriety-app/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons for PWA install
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── CounterCard.jsx
│   │   ├── MilestoneAlert.jsx
│   │   ├── PledgeCard.jsx
│   │   └── MotivationalMessage.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Timers.jsx
│   │   ├── TriggerLog.jsx
│   │   ├── AIChat.jsx
│   │   ├── Insights.jsx
│   │   └── Settings.jsx
│   ├── context/
│   │   ├── AuthContext.jsx    # Auth state across app
│   │   └── AppContext.jsx     # Global app state
│   ├── hooks/
│   │   ├── useTimer.js        # Timer logic
│   │   ├── usePledge.js       # Daily pledge logic
│   │   └── useTriggers.js     # Trigger log logic
│   ├── supabaseClient.js      # Supabase init
│   ├── App.jsx                # Routes
│   └── main.jsx               # Entry point
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Supabase Database Schema

### Table: `profiles`
Stores user profile and preferences.

```sql
create table profiles (
  id uuid references auth.users on delete cascade,
  username text,
  motivational_tone text default 'gentle', -- 'gentle' | 'tough'
  created_at timestamp default now(),
  primary key (id)
);
```

### Table: `timers`
One row per addiction the user is tracking.

```sql
create table timers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  addiction_name text not null,
  started_at timestamp not null,
  is_active boolean default true,
  created_at timestamp default now()
);
```

### Table: `relapses`
Logged when a user resets a timer — stores the post-mortem.

```sql
create table relapses (
  id uuid default gen_random_uuid() primary key,
  timer_id uuid references timers(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  days_clean_before int,
  trigger_category text,     -- 'stress' | 'boredom' | 'social' | 'physical' | 'other'
  what_happened text,
  emotional_state text,
  need_being_met text,
  next_time_plan text,
  created_at timestamp default now()
);
```

### Table: `trigger_logs`
Logs urges and close calls — not just relapses.

```sql
create table trigger_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  trigger_category text,
  description text,
  emotional_state text,
  resisted boolean default true,      -- true = close call, false = relapse
  what_helped text,                   -- if resisted, what worked
  created_at timestamp default now()
);
```

### Table: `pledges`
Daily pledge entries.

```sql
create table pledges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  pledge_text text,
  pledge_date date default current_date,
  created_at timestamp default now()
);
```

### Table: `chat_sessions`
AI venting chat history.

```sql
create table chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  messages jsonb default '[]',        -- array of {role, content} objects
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

---

## Core Features

### 1. Sobriety Counter & Multiple Timers
- Real-time counter showing days, hours, minutes, seconds
- Each addiction tracked independently
- Milestone celebrations: 1 day, 3 days, 1 week, 2 weeks, 1 month, 3 months, 6 months, 1 year
- Optional: money saved calculator (user inputs daily cost)

### 2. Forgiving Relapse / Post-Mortem Flow
When a user resets a timer, instead of a cold reset:
- Show how long they were clean: *"You were clean for 47 days. That still matters."*
- Prompt gentle post-mortem questions:
  - What was happening right before?
  - What were you feeling emotionally?
  - What need were you trying to meet?
  - What could you try differently next time?
- Save to `relapses` table
- Previous clean time preserved in history — not erased

### 3. Trigger Log
- Log urges and close calls independently of relapses
- Track: trigger category, emotional state, whether resisted, what helped
- Over time builds a **personal toolkit** of what works
- Shows pattern insights: *"Stress is your most common trigger, usually in the evening"*

### 4. Daily Pledge
- Morning ritual — user types or taps a daily commitment
- Optional: *"Why are you staying clean today?"*
- Pledge streak tracked separately from sobriety streak
- Gentle reminder notification if not pledged by a set time

### 5. Motivational Messages
- Shown on dashboard each day
- User can choose tone in Settings: Gentle / Tough Love
- Pulled from recovery-focused quote library
- User can save favorites
- User can write their own personal affirmations

### 6. AI Venting (Claude API)
- Judgment-free chat space
- Responds with empathy, asks gentle check-in questions
- Crisis mode: detects signs of imminent relapse, responds differently
- Suggests grounding exercises when appropriate
- Emergency button: *"I need help right now"* — shows grounding exercises + crisis hotline
- Chat history saved per session in Supabase

### 7. Insights Page
- Visual breakdown of trigger patterns over time
- Most common trigger categories (chart)
- Time-of-day / day-of-week patterns
- Longest clean streaks per addiction
- Close calls vs relapses ratio
- Personal toolkit: things that have helped most

### 8. Settings
- Manage tracked addictions (add / archive)
- Motivational tone preference
- Notification preferences
- Money saved calculator setup
- Account management

---

## Build Order (Recommended)

### Phase 1 — Foundation
- [ ] Vite + React + Tailwind setup
- [ ] Supabase project + database tables
- [ ] Authentication (login, signup, protected routes)
- [ ] AuthContext and routing skeleton

### Phase 2 — Core Tracking
- [ ] Dashboard page with sobriety counter
- [ ] Multiple addiction timers (Timers page)
- [ ] Milestone detection and celebration UI
- [ ] Relapse post-mortem flow

### Phase 3 — Logging
- [ ] Trigger log page (urges + close calls)
- [ ] Daily pledge feature
- [ ] "What Worked" personal toolkit view

### Phase 4 — AI & Insights
- [ ] AI venting chat (Claude API integration)
- [ ] Emergency button + grounding exercises
- [ ] Insights page with pattern charts

### Phase 5 — Polish & PWA
- [ ] Motivational messages system
- [ ] Responsive design refinement (mobile vs desktop)
- [ ] PWA manifest + service worker (offline support)
- [ ] Push notifications
- [ ] Settings page

---

## Environment Variables

Create a `.env` file in the root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ANTHROPIC_API_KEY=your_claude_api_key
```

> ⚠️ Never commit `.env` to git. Add it to `.gitignore`.

---

## Supabase Client Setup

`src/supabaseClient.js`

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## PWA Setup (vite.config.js)

Install the PWA plugin:

```bash
npm install -D vite-plugin-pwa
```

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sobriety App',
        short_name: 'Sobriety',
        description: 'Your personal sobriety companion',
        theme_color: '#1e293b',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
})
```

---

## Notes for Claude Code

- Start with **Phase 1** — get auth and routing working before any features
- Use `react-router-dom` v6 for routing
- Keep Supabase calls inside **hooks** (not directly in components)
- All Supabase tables should have **Row Level Security (RLS)** enabled so users only see their own data
- Use Tailwind's responsive prefixes (`md:`, `lg:`) for desktop vs mobile layout
- The AI chat should call the Claude API from a **backend function or edge function** — never expose the API key on the frontend

---

## Addiction Categories (starter list)

Alcohol, Cannabis, Nicotine / Vaping, Cocaine, Opioids, Methamphetamine, Gambling, Social Media, Pornography, Shopping, Gaming, Food / Binge Eating, Caffeine, Prescription Drugs, Other (custom)

---

## Emotional States (for trigger log picker)

Stressed, Anxious, Bored, Lonely, Angry, Sad, Tired, Overwhelmed, Excited, Happy, Numb, Other

---

## Trigger Categories

Stress, Boredom, Social Pressure, Physical Pain, Emotional Pain, Relationship Issues, Work / School, Financial Pressure, Celebration, Environmental Cue, Other
