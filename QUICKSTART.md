# 🚀 ACRE Quick Start Guide

**New to the project? Start here.**

---

## ⚡ TL;DR (60 Seconds)

ACRE is a learning app that turns boring study notes into "boss fights" using AI. Users paste notes → AI generates 5 scenarios → User answers → HP updates → Victory or defeat.

**Frontend is ready.** Backend needs to implement 2 API endpoints.

---

## 🎮 See It Live (Right Now)

```bash
cd c:\Users\mmatt\acre-frontend
npm run dev
```

Then open: http://localhost:3000

**Try it:**
1. Paste any text (min 100 chars) in the input box
2. Click "Enter the Arena"
3. You'll see 2 mock encounters
4. Pick A/B/C/D
5. See victory screen with stats

**No backend required.** Mock data works.

---

## 📚 Read These Docs (In Order)

### For Everyone (10 minutes)
- [ ] **QUICK_REFERENCE.md** - Overview of the system
- [ ] **FINAL_SUMMARY.md** - What was built today

### For Backend Team (30 minutes)
- [ ] **docs/BACKEND_SPEC.md** - API specification
- [ ] **src/types/combat.ts** - TypeScript types

### For Frontend Team (20 minutes)
- [ ] **ACRE_DAY1_README.md** - Frontend details
- [ ] **src/store/combatStore.ts** - State management
- [ ] **src/components/BattleArena.tsx** - Main UI

### For Full Context (45 minutes)
- [ ] **DAY1_HANDOFF.md** - Team status report
- [ ] **FILE_STRUCTURE.md** - Code organization

---

## 🏗️ Architecture (30 Seconds)

```
User pastes notes
        ↓
Frontend validates (min 100 chars)
        ↓
POST /api/battle/start
        ↓
Backend calls Gemini
        ↓
AI returns JSON with 5 scenarios
        ↓
Frontend displays first scenario
        ↓
User picks A/B/C/D
        ↓
POST /api/battle/answer
        ↓
Backend evaluates + calculates damage
        ↓
Frontend updates HP bars
        ↓
Next scenario (repeat)
        ↓
Victory/Defeat
```

---

## 🔑 Key Files

| File | What It Does | Who Cares |
|------|---|---|
| `src/store/combatStore.ts` | All game logic in one store | Frontend devs |
| `src/types/combat.ts` | Request/response types | Both teams |
| `docs/BACKEND_SPEC.md` | API specification | Backend devs |
| `src/components/BattleArena.tsx` | Main UI component | Frontend devs |
| `src/app/page.tsx` | Main entry point | Everyone |

---

## 🎯 Backend Team: What's Your Job?

Implement these 2 endpoints by end of Day 2:

### 1. POST /api/battle/start
```javascript
// Input
{
  "source_content": "study notes here",
  "source_title": "optional title"
}

// Output
{
  "success": true,
  "battle_state": {
    "boss": {
      "boss_name": "The Passive Consumer",
      "intro_narrative": "...",
      "encounters": [
        {
          "id": 1,
          "scenario": "...",
          "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
          "correct_option": "C",
          "win_feedback": "...",
          "loss_feedback": "..."
        },
        // ... 4-5 more encounters
      ]
    },
    "current_encounter_index": 0,
    "player_hp": 100,
    "boss_hp": 100,
    "max_player_hp": 100,
    "max_boss_hp": 100,
    "battle_log": [],
    "is_victory": false,
    "is_defeat": false
  }
}

// Response time: < 2 seconds (CRITICAL!)
```

### 2. POST /api/battle/answer
```javascript
// Input
{
  "battle_session_id": "...",
  "encounter_id": 1,
  "player_choice": "C"
}

// Output
{
  "success": true,
  "was_correct": true,
  "damage_dealt": 25,        // Always 25 if correct, 0 if wrong
  "damage_taken": 0,         // Always 0 if correct, 15 if wrong
  "feedback": "🔥 CRITICAL HIT!",
  "new_battle_state": { /* updated state */ }
}

// Response time: < 1 second
```

**Full details:** See `docs/BACKEND_SPEC.md`

---

## 💾 State Management

Everything goes through Zustand store:

```typescript
// Frontend code example
import { useCombatStore } from "@/store/combatStore";

export function MyComponent() {
  const { battle_state, startBattle, submitAnswer } = useCombatStore();

  // Start a battle
  await startBattle("study notes here", "title");

  // Submit an answer
  await submitAnswer(1, "C");

  // Access state
  console.log(battle_state.player_hp);
  console.log(battle_state.boss_hp);
}
```

---

## 🧪 Testing

### Test Frontend (No Backend)
```bash
npm run dev
# Paste text → Enter Arena → See mock battle
```

### Test Backend (Manual)
```bash
curl -X POST http://localhost:3000/api/battle/start \
  -H "Content-Type: application/json" \
  -d '{
    "source_content": "Volume negates luck. Blah blah blah.",
    "source_title": "Test"
  }'
```

### Full Integration Test (Day 2)
- [ ] Frontend calls real API
- [ ] Backend returns correct JSON
- [ ] HP updates correctly
- [ ] Victory screen appears

---

## 🎨 Frontend Structure

```
Components:
  ├── BattleInput    → Input form
  ├── BattleArena    → Combat UI
  ├── BattleResult   → Results screen
  └── UI/
      ├── HealthBar      → HP bars
      └── EncounterCard  → Scenario + choices

State:
  └── combatStore.ts → All game logic

Types:
  └── combat.ts → All TypeScript contracts
```

---

## 🚀 Deployment

### Local Development
```bash
npm run dev
# http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel deploy
```

---

## 📞 Support

**Questions?**
- Slack: #acre-frontend, #acre-backend, #acre-general
- Daily sync: 9 AM (all teams)
- Docs: This folder

---

## 🎯 Timeline

| Day | Focus | Status |
|-----|-------|--------|
| **Day 1** | Frontend UI complete | ✅ DONE |
| **Day 2** | Backend API + integration | ⏳ IN PROGRESS |
| **Day 3** | User testing | ⏳ PENDING |

---

## ✨ Next 5 Minutes

Choose your path:

**If you're backend team:**
```
1. Read QUICK_REFERENCE.md
2. Read docs/BACKEND_SPEC.md
3. Start building endpoints
```

**If you're frontend team:**
```
1. Run `npm run dev`
2. Read ACRE_DAY1_README.md
3. Review src/store/combatStore.ts
```

**If you're product:**
```
1. Run `npm run dev`
2. Paste text and see the battle
3. Share feedback in Slack
```

---

## 🏁 Ready?

All the code is written. All the docs are detailed. Backend team, you're up.

⚔️ Let's ship this.

---

**Questions before you start?** Ask in #acre-general. Someone will answer in 30 seconds.
