# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm test             # Run Jest tests
npm run test:watch   # Jest in watch mode
```

Run a single test file:
```bash
npx jest src/__tests__/demo.test.tsx
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # Server-only, used in API routes
NEXT_PUBLIC_API_URL=         # Base URL for API calls (e.g. http://localhost:3000/api)
```

`NEXT_PUBLIC_API_URL` is used both by the store for external API calls and by routes. The `authClient` in `src/lib/authClient.ts` strips `/api` from this URL for the `better-auth` base URL.

## Architecture

### Tech Stack
- **Next.js 16** (App Router) with TypeScript
- **Zustand** for global state
- **Supabase** for auth and persistence (`supabaseClient.ts` for client-side, `supabaseServer.ts` with service role key for API routes)
- **better-auth** for session management (used alongside Supabase Auth)
- **Framer Motion** for animations
- **KaTeX / react-katex** for formula rendering
- **Tailwind CSS v4**

### Core Domain: The ARCÉ Iteration Engine

This is an **adaptive spaced-repetition learning platform**. The primary learning flow is a 7-phase state machine driven by `useArceStore` (Zustand):

```
input → extracting → challenge → transition → sanctuary → evaluation → synchronization → debrief
```

Each phase renders a different component in `src/app/learn/page.tsx` via `AnimatePresence`.

**Phase 0 (Extraction):** `POST /api/generate-scenarios` — takes user text/file/URL, extracts Logic Nodes (concepts) with crisis scenarios, domino questions, and multiple-choice questions. Node count scales dynamically with content length (3–15 nodes).

**Phase 1 (Challenge Zone):** `src/components/learn/ChallengeZone.tsx` — Free-text domino prediction question. Evaluated via `POST /api/evaluate` or `POST /api/flashpoint/evaluate-response`.

**Phases 2–6:** Breakthrough Transition → Intel Card Sanctuary → Evaluation Split-Screen → Synchronization → Mission Debrief.

### Flashpoint Review Engine (Spaced Repetition)

Separate from the main learning flow. Lives under `/dashboard` and `/flashpoint/review/[conceptId]`.

- Uses **SM-2 algorithm** (`src/utils/sm2Algorithm.ts`, `src/utils/spacedRepetition.ts`)
- Three review phases: Phase 1 (days 1–3, multiple-choice), Phase 2 (days 7–14, text input), Phase 3 (days 30–90, blindspot)
- Triage endpoint: `GET /api/flashpoint/triage?userId=...`
- Review content generators: `/api/flashpoint/phase-1-foundation`, `/api/flashpoint/phase-2-application`
- Evaluation: `POST /api/flashpoint/evaluate-response` (handles all 3 phases, updates SM-2 intervals in Supabase)

### State Management

Two main stores:
- **`useArceStore`** (`src/store/arceStore.ts`) — primary store; manages auth (Supabase session), learning session, phase transitions, progress persistence. Auth is initialized with `initAuth()` called in page `useEffect`. All authenticated pages redirect to `/signin` if `!user`.
- **`useFlashpointStore`** (`src/store/flashpointStore.ts`) — manages the flashpoint triage queue and review sessions.

### API Routes Structure

```
src/app/api/
  generate-scenarios/     # Phase 0: Logic extraction (no AI — rule-based)
  evaluate/               # Phase 1: Domino prediction evaluation
  generate-variation/     # Black Swan / Parallel Variation generation
  generate-battle-scenarios/
  nodes/                  # Node data
  dashboard/get-summary/  # Dashboard analytics summary
  analytics/ai-insights/  # AI-driven analytics
  flashpoint/
    triage/               # Due reviews list
    evaluate-response/    # SM-2 evaluation (phases 1/2/3)
    phase-1-foundation/   # Phase 1 question generation
    phase-2-application/  # Phase 2 question generation
    due-reviews/          # Due items
    get-review/           # Fetch a single review
    submit-review/        # Submit a review result
  auth/[...all]/          # better-auth catch-all
```

### Key Types (`src/types/arce.ts`)

- `LearnPhase` — the 7-phase enum for the learn state machine
- `ConceptNode` — core learning unit with `heatScore` (0–100), `thermalState` (`frost|warning|ignition|neutral`)
- `CrisisScenario` — question presented during challenge phase
- `FlashpointReviewSession` — a spaced-repetition review session
- `ThermalState` — `frost | warning | ignition | neutral` — used throughout for color-coded mastery feedback

### Supabase Tables Referenced in Code

- `user_progress` — `(user_id, node_id)` unique; tracks `heat_score`, `thermal_state`, `is_ignited`, spaced-rep fields
- `user_units` — `(id, user_id)` unique
- `user_topics` — `(user_id, unit_id)`

### Pages

- `/` — Landing page
- `/learn` — Main learning flow (requires auth)
- `/dashboard` — Flashpoint triage + analytics (requires auth)
- `/heatmap` — Thermal heatmap visualization
- `/flashpoint/review/[conceptId]` — Individual spaced-repetition review
- `/signin`, `/signup` — Auth pages (Supabase Auth UI)
- `/battle` — Legacy battle mode
