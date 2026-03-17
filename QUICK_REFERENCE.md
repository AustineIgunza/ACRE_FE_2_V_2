# ⚡ ACRE Quick Reference Card

**Date:** March 16, 2026 | **Project:** The Iteration Engine  
**Status:** Day 1 ✅ | **Next:** Day 2 Integration

---

## 🎮 The Product (In 30 Seconds)

Users paste study notes → AI creates a "Boss Fight" → User answers 5 scenarios → Wins or loses based on understanding → Shareable victory card.

**Why?** Because passive learning (watching, reading) doesn't work. ACRE forces active application.

---

## 🏗️ Architecture

```
Frontend (Next.js)
    ↓ (HTTP)
Backend (NestJS/Express) ← API Endpoints
    ↓ (Prompt)
Gemini 1.5 Flash
    ↑ (JSON response)
    ↓ (Parse JSON)
Frontend (Show Scenario)
    ↓ (User picks A/B/C/D)
Backend (Evaluate)
    ↓ (Update HP)
Frontend (Update UI)
```

---

## 📋 API Endpoints

| Endpoint | Method | Purpose | Response Time |
|----------|--------|---------|---|
| `/api/battle/start` | POST | Generate boss fight | < 2 sec |
| `/api/battle/answer` | POST | Evaluate answer | < 1 sec |

---

## 🎯 Game Rules (HP System)

- **Player:** 100 HP (starts full)
- **Boss:** 100 HP (starts full)
- **Correct answer:** Boss -25 HP
- **Wrong answer:** Player -15 HP
- **Win:** Boss HP = 0 (or all encounters done)
- **Lose:** Player HP = 0

---

## 📁 Code Structure

**Frontend** (Next.js 16 + Zustand):
```
src/
  app/page.tsx → Main entry point
  components/
    BattleInput → Input form
    BattleArena → Combat UI
    BattleResult → End screen
    UI/ → HealthBar, EncounterCard
  store/combatStore.ts → State management
  types/combat.ts → TypeScript contracts
```

**Backend** (Your responsibility):
```
src/
  modules/
    battle/
      battle.controller.ts
      battle.service.ts (calls Gemini)
  config/
    gemini.config.ts
  main.ts
```

---

## 🧠 System Prompt (For Backend)

```
You are the Learning Dungeon Master (LDM).
Extract 4-5 concepts from study notes.
For each concept, create a crisis scenario.
NO definitions. Only scenarios that force deep understanding.
Return JSON with 5 encounters (id, scenario, options A-D, correct_option, win/loss feedback).
```

See `BACKEND_SPEC.md` for full prompt.

---

## 🔑 Key Files

| File | Owner | Purpose |
|------|-------|---------|
| `ACRE_DAY1_README.md` | Frontend | Overview + setup |
| `DAY1_HANDOFF.md` | Both | Status report |
| `docs/BACKEND_SPEC.md` | Backend | API contract |
| `src/types/combat.ts` | Both | TypeScript types |
| `src/store/combatStore.ts` | Frontend | State logic |

---

## ✅ Checklist (Day 2 Morning)

**Backend Team:**
- [ ] POST /api/battle/start implemented
- [ ] POST /api/battle/answer implemented
- [ ] Gemini system prompt finalized
- [ ] Response time < 2 seconds verified
- [ ] Error handling for all edge cases
- [ ] CORS enabled for frontend

**Frontend Team:**
- [ ] Replace mock API calls with real ones
- [ ] Add loading states
- [ ] Test with backend
- [ ] Stress test edge cases

---

## 🚨 Critical Constraints

1. **< 2 Second Rule** - First scenario must appear in < 2 seconds (Gemini Flash requirement)
2. **No Definitions** - Every question must be a real-world scenario
3. **JSON Only** - Backend must return valid JSON, no markdown
4. **Error Handling** - Frontend must handle API failures gracefully

---

## 📊 Success Metrics (Day 1)

| Metric | Status |
|--------|--------|
| Frontend UI complete | ✅ |
| State management working | ✅ |
| Type system aligned | ✅ |
| Backend spec written | ✅ |
| Mock data working | ✅ |
| No console errors | ✅ |

---

## 🔌 Testing (No Backend? No Problem)

```bash
# Start dev server
npm run dev

# Paste any text → Enter the Arena → See mock battle
# Victory screen shows stats
```

---

## 💬 Questions?

**Frontend:** "#acre-frontend Slack"  
**Backend:** "#acre-backend Slack"  
**General:** "#acre-general Slack"

**Daily sync:** 9 AM (all teams)

---

## 🎯 Timeline

| Day | Focus | Deliverable |
|-----|-------|---|
| **Day 1** ✅ | UI + Spec | Combat UI + Backend spec |
| **Day 2** | Integration | Working API endpoints |
| **Day 3** | Stress test | MVP ready for users |

---

## 🏆 Win State

**Day 3 EOD:** ACRE MVP is live with Gemini integration, handling 100+ concurrent battles, ready to send to early users.

---

## ⚔️ Let's Ship It

**Frontend is ready. Backend, your move.** 🚀
