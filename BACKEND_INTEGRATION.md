# 📞 ACRE Backend Integration Guide

**From:** Frontend Team  
**To:** Backend Team  
**Date:** March 16, 2026  
**Status:** Frontend Ready for Integration

---

## What We Need From You

Your backend team needs to build **2 endpoints**. Here are the exact specs:

### Endpoint 1: Generate Scenario

**Route:** `POST /api/generate-scenario`

**Purpose:** AI generates a scenario question based on the user's content and node

**Request Body:**
```json
{
  "sourceContent": "string (full pasted text by user)",
  "conceptNode": {
    "id": "string (e.g., 'node-0')",
    "label": "string (e.g., 'Volume Negates Luck')",
    "description": "string (e.g., 'Quantity over quality leads to mastery')"
  },
  "iterationCount": "number (how many times user tried this node)",
  "previousFeedback": [
    "string (optional: last feedback to avoid repetition)"
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "scenario": {
    "prompt": "string (the question to show user)",
    "systemContext": "string (hidden system prompt for Gemini - for your reference)",
    "difficultyLevel": "beginner|intermediate|advanced"
  },
  "estimatedHeatGain": "number (5-25 range for correct answer)"
}
```

**Real Example:**
```json
{
  "sourceContent": "Volume negates luck. If you do something 10 times instead of perfecting once, you learn 10x faster...",
  "conceptNode": {
    "id": "node-1",
    "label": "Volume Negates Luck",
    "description": "Quantity over quality leads to mastery"
  },
  "iterationCount": 1,
  "previousFeedback": []
}
```

**Response:**
```json
{
  "success": true,
  "scenario": {
    "prompt": "You're building a software feature. You have two choices: Spend 4 weeks perfecting one version, or build 10 'ugly' versions in 4 weeks and test them all. According to the 'Volume' principle, why is Choice 2 mathematically more likely to result in higher quality?",
    "systemContext": "Evaluate if user understands that quality is a BYPRODUCT of high-volume reps, not a starting condition...",
    "difficultyLevel": "intermediate"
  },
  "estimatedHeatGain": 15
}
```

---

### Endpoint 2: Evaluate Answer

**Route:** `POST /api/evaluate-answer`

**Purpose:** AI grades the user's response and provides feedback

**Request Body:**
```json
{
  "nodeId": "string (e.g., 'node-1')",
  "scenarioPrompt": "string (echo back the prompt for context)",
  "userAnswer": "string (what the user typed)",
  "attemptNumber": "number (1st attempt, 2nd attempt, etc.)"
}
```

**Expected Response:**
```json
{
  "success": true,
  "feedback": "string (what to show user, include emoji like 🔥 or ❄️)",
  "heatGained": "number (0-25 scale)",
  "passedMastery": "boolean (true if heat >= 20)",
  "nextPrompt": "string (optional: follow-up hint if not mastery)",
  "explanationIfWrong": "string (optional: deep explanation if failed)"
}
```

**Real Example:**

**Request:**
```json
{
  "nodeId": "node-1",
  "scenarioPrompt": "You're building a software feature. You have two choices: Spend 4 weeks perfecting one version, or build 10 'ugly' versions in 4 weeks and test them all. According to the 'Volume' principle, why is Choice 2 mathematically more likely to result in higher quality?",
  "userAnswer": "Because doing it 10 times gives you 10x the skill reps. By the 10th one, you're a better builder than attempt 1. The volume creates the quality.",
  "attemptNumber": 2
}
```

**Response:**
```json
{
  "success": true,
  "feedback": "🔥 Deep Red Heat! You understand that quality is a BYPRODUCT of high-volume reps, not a starting point. Mastery confirmed.",
  "heatGained": 22,
  "passedMastery": true
}
```

---

## The Master Prompt (For Gemini)

This is the system prompt you'll send to **Gemini 1.5 Flash** in both endpoints:

```
You are the Dungeon Master for the "Iteration Engine" - an AI that stress-tests whether people truly understand concepts, not just memorize them.

CORE RULE: Never ask for definitions. Every question MUST be a scenario that requires application.

BAD: "What is a Linked List?"
GOOD: "You're building a train system. You need to add a new car in the middle without stopping the whole train. How do you re-link the pointers?"

EVALUATION RULES:
1. Check if they understand the PRINCIPLE, not surface-level knowledge
2. Passive answers get Faint Blue Glow ("needs more depth")
3. Deep understanding gets Red-Hot Mastery ("confirmed")

HEAT GRADING SCALE:
- 0-5: Passive, surface-level, wrong application
- 6-15: Good start, but missing the core mechanism  
- 16-25: Deep understanding, can apply independently

TONE: Be harsh but fair. Users are trying to prove their logic is real, not just absorbed. Challenge them to go deeper.
```

**Note:** Test variations of this prompt during Week 2. This is the "secret sauce" that makes ACRE work.

---

## Heat State Machine (Reference)

The frontend uses these state transitions:

```
COLD (0°)
  ↓
WARMING (1-24°)  
  ↓
HOT (25-74°)
  ↓
IGNITED (75-100°) ← MASTERY CONFIRMED
```

- Each correct attempt should gain 5-25 heat points
- Passive/surface answers gain 0-10 heat
- Deep answers gain 15-25 heat
- At 75+ heat, mark as "passedMastery: true"

---

## Testing Checklist for Backend

Before connecting to frontend, test:

- [ ] Both endpoints return correct JSON structure
- [ ] `/api/generate-scenario` works with edge cases:
  - [ ] Very long text (10,000+ characters)
  - [ ] Unicode characters (emoji, non-English)
  - [ ] Special characters and formatting
  - [ ] Minimal text (< 10 words)
  
- [ ] `/api/evaluate-answer` handles:
  - [ ] Passive answers (return low heat)
  - [ ] Deep answers (return high heat)
  - [ ] Wrong answers (return 0-5 heat)
  - [ ] Edge case: single word responses
  - [ ] Edge case: very long responses (2000+ words)

- [ ] Gemini API integration:
  - [ ] Connection stable under load
  - [ ] Timeout handling (max 10s response time)
  - [ ] Error handling for API failures
  - [ ] Cost tracking (you're on Gemini 1.5 Flash - $0.075/M input tokens)

- [ ] Response times:
  - [ ] Generate scenario: < 3 seconds
  - [ ] Evaluate answer: < 5 seconds

---

## Frontend Integration Timeline

**Day 2 Morning (Frontend will do this):**
1. Wire "Start Challenge" button → calls `/api/generate-scenario`
2. Display scenario in a modal
3. Wire answer submission → calls `/api/evaluate-answer`
4. Update node heat based on response
5. Show feedback to user
6. Transition node state (cold → warming → hot → ignited)

**Estimated time:** 4-6 hours

**What we need from you:**
- Both endpoints deployed and accessible
- CORS configured to accept `http://localhost:3000` (dev) + your Vercel domain (production)
- Responses match the exact JSON formats above

---

## Environment Setup

**For Local Testing:**
- Frontend: http://localhost:3000
- Backend: Will call your endpoints (coordinate with your team on URL)
- Gemini API: Make sure API key is configured

**For Production (Vercel):**
- Frontend: Will be deployed to Vercel
- Backend: Needs CORS headers allowing Vercel domain
- Both need to share base URL or specify exact endpoint URLs

---

## Questions?

Reference files:
- **Full spec:** `/docs/JSON_SPECIFICATION.ts` in the frontend repo
- **TypeScript types:** `/src/types/index.ts` (exact interfaces)
- **Helper functions:** `/src/utils/helpers.ts` (heat calculations)

---

## Success Criteria for Day 3

By end of Day 3, the full loop works:

1. ✅ User pastes notes → Input phase saves
2. ✅ Frontend calls `/api/generate-scenario` → Gets scenario
3. ✅ User types answer → Submits it
4. ✅ Frontend calls `/api/evaluate-answer` → Gets feedback
5. ✅ Node heat updates (0-100°)
6. ✅ Node state changes (cold → ignited)
7. ✅ All 4 nodes can be completed
8. ✅ "Boss Defeated" modal appears
9. ✅ Ready to test with real users (Week 2)

---

**Estimated effort:** 2-3 days for backend team  
**Testing buffer:** 1 day before launch  
**MVP target:** End of Week 1

Let's go! 🔥

---

*Frontend Ready: ✅ March 16, 2026*
