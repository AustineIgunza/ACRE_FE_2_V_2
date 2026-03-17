# ACRE: The Iteration Engine - Combat Edition (Frontend)

## 🎯 Day 1 Status: COMBAT SYSTEM BUILT ✅

**Frontend Setup: COMPLETE**

### What's Built (Combat Version)
- ✅ Type definitions for combat system (`src/types/combat.ts`)
- ✅ Zustand state management (`src/store/combatStore.ts`)
- ✅ BattleInput component (notes paste box)
- ✅ BattleArena component (main combat UI)
- ✅ BattleResult component (victory/defeat screen)
- ✅ HealthBar UI component (player/boss HP)
- ✅ EncounterCard component (scenario + 4 choices)
- ✅ Backend API specification for backend team
- ✅ Mock data generation for UI testing

---

## � The Flow (What Users See)

1. **Landing Page** → User pastes study notes
2. **Boss Intro** → AI-generated boss fight scenario appears
3. **Encounter 1** → User reads scenario, picks A/B/C/D
4. **Feedback** → 2-second delay, shows if correct/wrong
5. **Encounter 2-5** → Battle continues
6. **Victory/Defeat** → Stats screen with share option

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser to http://localhost:3000
```

---

## 📁 Project Structure (Combat Version)

```
src/
├── app/
│   └── page.tsx                  # Main entry point
├── components/
│   ├── BattleInput.tsx           # Notes input form
│   ├── BattleArena.tsx           # Main combat UI
│   ├── BattleResult.tsx          # Victory/defeat screen
│   └── UI/
│       ├── HealthBar.tsx         # HP bars (player/boss)
│       └── EncounterCard.tsx     # Scenario + 4 choices
├── store/
│   └── combatStore.ts            # Zustand state (combat logic)
├── types/
│   ├── index.ts                  # Old heatmap types (can remove)
│   └── combat.ts                 # NEW: Combat types (REQUEST/RESPONSE)
└── utils/
    └── helpers.ts                # Utility functions

docs/
├── JSON_SPECIFICATION.ts         # Old heatmap spec (archive)
└── BACKEND_SPEC.md               # NEW: Backend API contract
```

---

## 💾 State Management (Zustand)

The `useCombatStore` handles everything:

```typescript
// Start a battle
const { startBattle } = useCombatStore();
await startBattle(sourceContent, sourceTitle);

// Submit an answer
const { submitAnswer } = useCombatStore();
await submitAnswer(encounterId, choice);

// Access state
const { battle_state, is_battle_active, player_hp_percent, boss_hp_percent } = useCombatStore();

// Reset
const { resetBattle } = useCombatStore();
resetBattle();
```

---

## 🎨 Component Breakdown

### BattleInput
- Textarea for pasting notes
- Validates min 100 characters
- Shows loading state ("Summoning the Boss...")
- Calls `startBattle` from store

### BattleArena
- Displays boss name + intro narrative (first encounter only)
- Shows Player HP bar + Boss HP bar
- Renders EncounterCard with current scenario
- Shows battle log below

### EncounterCard
- Displays scenario text
- 4 clickable option buttons (A, B, C, D)
- Shows 2-second feedback (red/green)
- Calls `submitAnswer` after feedback

### BattleResult
- Shows Victory 🏆 or Defeat 💀
- Stats: Encounters, Accuracy %, Final HP
- Battle summary table (all turns with results)
- Share and New Battle buttons

---

## � Day 2: Backend Integration

### What Changes
1. Replace mock `startBattle` with real API call:
```typescript
POST /api/battle/start
{
  "source_content": "...",
  "source_title": "..."
}
```

2. Replace mock `submitAnswer` with real API call:
```typescript
POST /api/battle/answer
{
  "battle_session_id": "...",
  "encounter_id": 1,
  "player_choice": "C"
}
```

### Frontend Expects from Backend
See `docs/BACKEND_SPEC.md` for exact JSON format.

**Key Rules:**
- Correct answer: 25 damage to boss, 0 to player
- Wrong answer: 0 damage to boss, 15 to player
- Boss dies when HP = 0 OR all encounters done
- Player dies when HP = 0

---

## 🎯 How It Works (The Secret Sauce)

### Input Phase
User pastes notes → Frontend validates (min 100 chars)

### Generation Phase
Backend receives notes → Calls Gemini with system prompt:
```
"You are the Learning Dungeon Master. 
Extract 4-5 core concepts.
Create scenarios (not definitions).
Return JSON with 5 encounters."
```

### Battle Phase
Each encounter is a scenario:
- **Bad Q:** "What is Volume Negates Luck?"
- **Good Q:** "You have two choices: perfect 1 vs. build 10 ugly versions. Why is option 2 mathematically superior?"

User picks A/B/C/D → Gets instant feedback → HP updates → Next encounter

### Victory Condition
All 5 scenarios answered correctly → Boss defeated → Shareable victory card

---

## 📊 Example Battle Flow

```
Input: "Volume negates luck. When you do something 10 times..."

Boss Generated: "The Passive Consumer"
Intro: "A manifestation of shallow learning stands before you..."

Encounter 1:
Q: "You have two choices..."
A: "Because luck favors the bold." ❌ (-15 player HP)
B: "Because more chances to be lucky." ❌ (-15 player HP)
C: "Because by 10th attempt, you're different..." ✅ (+25 boss damage)
D: "Because 10 > 1." ❌ (-15 player HP)

Player: 85 HP | Boss: 75 HP

[Continue to Encounter 2...]

Victory: All encounters answered!
```

---

## 🧪 Testing the UI

### No Backend Needed
1. Run `npm run dev`
2. Paste any text (min 100 chars)
3. Click "Enter the Arena"
4. See 2 mock encounters with feedback
5. See victory screen with stats

**Mock Data:** `src/types/combat.ts` includes `EXAMPLE_COMBAT_BOSS`

---

## ⚡ Performance Targets (Day 2)

- Time to first encounter: < 2 seconds (Gemini Flash)
- Time to answer feedback: < 1 second
- Smooth animations (HP bars, transitions)

---

## � Day 1 Deliverables ✅

- [x] Full combat UI (input → arena → result)
- [x] Zustand store with mock data
- [x] Type system aligned with backend
- [x] Backend API specification (for backend team)
- [x] Error handling UI
- [x] Mobile responsive
- [x] No console errors on startup
- [x] localStorage persistence (battle state saves)

---

## � For Backend Team

⚠️ **Read `docs/BACKEND_SPEC.md` immediately**

Key deliverables:
- [ ] POST /api/battle/start endpoint (< 2 seconds)
- [ ] POST /api/battle/answer endpoint
- [ ] System prompt for Gemini tuned and tested
- [ ] Error handling for edge cases

Timeline: By end of Day 2, these must be live so Day 3 we integrate.

---

## 🎯 Next Steps (Day 2 Morning)

- [ ] Backend deploys API endpoints
- [ ] Frontend integrates real API calls
- [ ] Test full cycle: input → Gemini → encounter → feedback
- [ ] Stress test: long texts, rapid submissions, edge cases
- [ ] Refine system prompt based on encounter quality

---

**Last Updated:** March 16, 2026 | **Project:** ACRE (The Iteration Engine)  
**Status:** MVP Phase 1 Complete - Combat System Ready ⚔️

