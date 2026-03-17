# ACRE Backend Team: Combat System Specification

**Date:** March 16, 2026  
**Version:** 1.0 (MVP Sprint - Day 1)  
**Audience:** Backend Developers (NestJS/Express)

---

## 🎯 Mission: Build the "Dungeon Master" AI Service

Your job is to turn study notes into high-stakes boss fights using Gemini 1.5 Flash.

### Core Constraint
**2-Second Rule:** Users must see the first scenario within 2 seconds of pasting notes. Use Gemini 1.5 Flash, NOT Pro.

---

## 📋 API Endpoints (3 Total for MVP)

### 1. POST /api/battle/start

**Purpose:** User pastes notes → Backend generates boss fight scenario

**Request Body:**
```json
{
  "source_content": "string (full text, min 100 chars)",
  "source_title": "string (optional, e.g., 'Volume Negates Luck')"
}
```

**Response (Success):**
```json
{
  "success": true,
  "battle_state": {
    "boss": {
      "boss_name": "The Passive Consumer",
      "intro_narrative": "Story about why this concept matters",
      "encounters": [
        {
          "id": 1,
          "scenario": "You have two choices: Spend 4 weeks perfecting one version...",
          "options": {
            "A": "Because luck favors the bold.",
            "B": "Because you get more chances to be lucky.",
            "C": "Because by the 10th attempt, you're a completely different builder...",
            "D": "Because 10 is greater than 1."
          },
          "correct_option": "C",
          "win_feedback": "🔥 CRITICAL HIT! You understand...",
          "loss_feedback": "The boss laughs. You're still thinking luck matters..."
        }
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
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Content too short. Minimum 100 characters required."
}
```

---

### 2. POST /api/battle/answer

**Purpose:** User submits an answer → Backend evaluates and returns feedback

**Request Body:**
```json
{
  "battle_session_id": "battle-1710604800000",
  "encounter_id": 1,
  "player_choice": "C"
}
```

**Response (Success):**
```json
{
  "success": true,
  "was_correct": true,
  "damage_dealt": 25,
  "damage_taken": 0,
  "feedback": "🔥 DEVASTATING BLOW! You've transcended the complexity trap.",
  "new_battle_state": {
    "boss": { /* same */ },
    "current_encounter_index": 1,
    "player_hp": 100,
    "boss_hp": 75,
    "max_player_hp": 100,
    "max_boss_hp": 100,
    "battle_log": [
      {
        "timestamp": 1710604861234,
        "encounter_id": 1,
        "player_choice": "C",
        "was_correct": true,
        "damage_dealt": 25,
        "damage_taken": 0,
        "feedback": "🔥 DEVASTATING BLOW!..."
      }
    ],
    "is_victory": false,
    "is_defeat": false
  }
}
```

---

## 🧠 The "Dungeon Master" System Prompt

This is the prompt you send to Gemini. Adjust after Day 2 testing.

```
You are the Learning Dungeon Master (LDM) for ACRE.

INPUT: Study notes or a transcript from a student.

YOUR TASK:
1. Extract 4-5 core concepts from the input
2. Create a "Boss Fight" where each concept is a scenario-based challenge
3. NO definitions. NO multiple choice tests. ONLY crisis scenarios.

SCENARIO FORMAT:
- Start with a real-world crisis or decision the concept applies to
- Force the user to demonstrate understanding by solving the crisis
- The user has 4 options (A, B, C, D). Only ONE shows deep understanding
- The other 3 options are:
  - One that's temptingly close but surface-level
  - One that's common misconception
  - One that's absurd but tests if they're reading

EXAMPLE INPUT:
"Volume Negates Luck. If you do something 10 times instead of perfecting once, 
you learn 10x faster. By the 10th attempt, you're a completely different person."

EXAMPLE ENCOUNTER:
{
  "id": 1,
  "scenario": "You're building a software feature. You have two choices: 
    Spend 4 weeks perfecting one version, or build 10 'ugly' versions in 4 weeks 
    and test them all. According to the 'Volume' principle, why is Choice 2 
    mathematically more likely to result in higher quality?",
  "options": {
    "A": "Because luck favors the bold.",
    "B": "Because you get more chances to be lucky.",
    "C": "Because by the 10th attempt, you're a completely different builder. 
         The volume makes the quality.",
    "D": "Because 10 is greater than 1."
  },
  "correct_option": "C",
  "win_feedback": "🔥 CRITICAL HIT! You understand that quality is a byproduct 
    of high-volume reps, not a starting point.",
  "loss_feedback": "The boss laughs. You're still thinking luck matters. 
    The truth: repetition is the forge."
}

OUTPUT: 
Return ONLY a valid JSON object. No markdown. No explanation. 
The JSON must have this structure:
{
  "boss_name": "string",
  "intro_narrative": "string",
  "encounters": [/* array of encounter objects */]
}
```

---

## 🔌 Implementation Checklist (Day 1)

### Setup
- [ ] Node.js + NestJS or Express.js initialized
- [ ] `.env` file with `GEMINI_API_KEY`
- [ ] Gemini SDK installed (`@google/generative-ai`)
- [ ] CORS enabled for frontend domain

### Endpoint 1: /api/battle/start
- [ ] Validate input (min 100 chars, non-empty)
- [ ] Call Gemini with system prompt + user notes
- [ ] Parse JSON response from AI
- [ ] Handle JSON parse errors (AI might return invalid JSON)
- [ ] Store battle state in session/memory (not DB yet)
- [ ] Return formatted response

### Endpoint 2: /api/battle/answer
- [ ] Validate session exists
- [ ] Load current battle state
- [ ] Retrieve the correct answer from encounters
- [ ] Calculate damage (25 if correct, 0 if wrong)
- [ ] Calculate damage to player (0 if correct, 15 if wrong)
- [ ] Update battle state (HP, current index, battle log)
- [ ] Check win condition (all encounters done OR boss HP = 0)
- [ ] Check lose condition (player HP = 0)
- [ ] Return updated state

### Error Handling
- [ ] Empty input → "Content too short"
- [ ] Invalid JSON from AI → Retry or fallback
- [ ] Timeout (>2 seconds) → Show error
- [ ] Session expired → "Battle ended"

---

## 📊 Game Rules (Damage Calculation)

| Scenario | Damage to Boss | Damage to Player | HP Change |
|----------|---|---|---|
| Correct answer | 25 | 0 | Player stays; Boss loses 25 |
| Wrong answer | 0 | 15 | Player loses 15; Boss stays |

**Win Condition:**
- Boss HP reaches 0, OR
- All 5 encounters completed (boss auto-dies)

**Lose Condition:**
- Player HP reaches 0

---

## 🧪 Testing (Day 1)

### Manual Test
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Test start battle
curl -X POST http://localhost:3000/api/battle/start \
  -H "Content-Type: application/json" \
  -d '{
    "source_content": "Volume negates luck. If you do something 10 times instead of perfecting once, you learn 10x faster. By the 10th attempt, you are a completely different person than on attempt 1. The person who does it 10 times is not the same builder as attempt 1.",
    "source_title": "Volume Negates Luck"
  }'

# Expect: battle_state with boss_name, encounters array, current_encounter_index = 0
```

### Load Test
- Paste a 5000+ character transcript
- Measure time to first response
- Target: < 2 seconds (Gemini Flash is fast enough)

### Edge Cases
- Empty input → Error
- Special characters / Unicode → Should work
- Very long input (>10KB) → Test handling
- Rapid requests (stress test) → Should queue/handle

---

## 🎯 Success Criteria (End of Day 1)

- ✅ /api/battle/start returns valid encounter data < 2 seconds
- ✅ /api/battle/answer correctly evaluates multiple choice answers
- ✅ HP math is correct (boss loses 25 on correct, player loses 15 on wrong)
- ✅ Win/lose conditions work
- ✅ Error handling for all edge cases
- ✅ Frontend can call endpoints and display results

---

## 📌 Day 2 & Beyond

- Persist battles to database (not localStorage)
- Add user authentication
- Track user statistics (wins, accuracy, etc.)
- Refine system prompt based on test data
- Add difficulty levels (Easy / Medium / Hard)

---

**Questions?** Tag this in your team chat. We sync at 9am tomorrow!
