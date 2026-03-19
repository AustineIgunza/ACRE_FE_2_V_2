# 🧪 TEST MODE - Feature Testing Guide

## What is Test Mode?

**Test Mode** is a rapid feature testing system that allows you to:
- ✅ Skip defense text requirement (type anything or nothing)
- ✅ Auto-pass all scenarios (every answer is marked correct)
- ✅ Quickly cycle through all features without writing long responses
- ✅ Test thermal animations, mastery cards, and results dashboard

---

## How to Enable Test Mode

### Step 1: Open the App
Go to **http://localhost:3001** in your browser

### Step 2: Click the Test Mode Toggle
Look at the **top-right corner** of the page:
- **Button Label**: `🧪 TEST OFF` (gray) or `🧪 TEST ON` (yellow)
- **Click it to toggle** between test mode on/off

When **TEST ON** is active:
- Button becomes **yellow**
- Defense textarea becomes optional
- All answers will auto-pass with 🟢 IGNITION

---

## Test Mode Behavior

### In Test Mode (🧪 TEST ON)

**Defense Textarea:**
- Placeholder changes to: `"TEST MODE: Type anything or leave blank (will auto-pass)..."`
- You can type anything or **leave it completely empty**
- Character counter shows `"optional"` instead of `"20"`

**Submit Button:**
- Becomes enabled **immediately** (no 20-char requirement)
- Label changes to `"Submit (TEST MODE)"`
- You can click it anytime

**Evaluation:**
- ✅ **Always returns IGNITION** (🟢 green, correct answer)
- Feedback shows: `"🔥 TEST MODE: This answer is marked correct for testing!"`
- Heat: +25, Integrity: +15
- **Mastery card is always unlocked**

**Defense is recorded as:**
- `"[TEST MODE - NO DEFENSE]"` if you leave it blank
- Your text if you type something
- In Results page, it shows the character count

---

## Normal Mode (🧪 TEST OFF)

Everything works as designed:
- Defense must be **20+ characters**
- Evaluation is based on button choice
- 🔴 Frost / 🟠 Warning / 🟢 Ignition depend on answer
- Mastery cards only generate on correct answers

---

## Test Workflow

### Fastest Testing Path (< 2 minutes)

1. **Turn on Test Mode** at top-right
2. **Paste study material** into textarea (100+ chars)
3. **Click "Start" button**
4. **For each of 5 scenarios**:
   - Click any action button (A, B, or C)
   - Leave defense empty or type 1 word
   - Click "Submit (TEST MODE)"
   - Watch thermal animation (3.5 seconds)
5. **See Results Page**:
   - 5/5 scenarios passed (100% heat, integrity)
   - 5 mastery cards unlocked
   - Elastic grid with all nodes unlocked
   - Share buttons working
6. **Start new session** or test again

**Total time: ~30-40 seconds per run**

---

## Test Scenarios Available

All 5 cell biology scenarios work in test mode:

| Scenario | Description | Button Options |
|----------|---|---|
| 1 | Cell Structure - Mitochondria | A, B, C |
| 2 | Metabolism - ATP Dependency | A, B, C |
| 3 | Communication - Receptors | A, B, C |
| 4 | Growth - Cell Cycle | A, B, C |
| 5 | Adaptation - Osmosis | A, B, C |

All buttons pass in test mode (any choice = 🟢 IGNITION).

---

## Features You Can Test

### Thermal Feedback Animations
- ✅ **Green flash** (0.8s) - All scenarios in test mode
- ✅ Keywords display (blue badges)
- ✅ Formal definitions (italic text)
- ✅ Auto-advance after 3.5s

### Results Dashboard
- ✅ **Final Heat**: Always 100% (5 × +25)
- ✅ **Integrity**: Always 75% (5 × +15, capped)
- ✅ **Responses**: Always 5
- ✅ **Mastery Cards**: Always 5 unlocked

### Mastery Cards Section
- ✅ Grid layout (responsive 1-2 columns)
- ✅ Card hover effects (scale, shadow)
- ✅ Keywords with # prefix
- ✅ Formal definitions displayed

### Response Journey
- ✅ All 5 responses listed
- ✅ Thermal state badges (🟢 Ignition for all)
- ✅ Character count for each
- ✅ Color-coded background (green for ignition)

### Elastic Grid (MasteryCanvas)
- ✅ Dynamic CSS Grid layout
- ✅ All 5 nodes unlocked (glowing borders)
- ✅ Thermal color indicators
- ✅ Cluster headers with descriptions
- ✅ Responsive on mobile/tablet/desktop

### Share Buttons
- ✅ WhatsApp share (opens in new tab)
- ✅ Twitter share (opens in new tab)
- ✅ Pre-filled messages with stats

### Start New Session
- ✅ Button to restart game
- ✅ Resets to input phase
- ✅ Test mode state persists (still ON)

---

## Debug Tips

### If Test Mode Isn't Working

**Check:**
1. Is the button visible? (Top-right corner, yellow when ON)
2. Is localStorage enabled in your browser?
3. Try clicking the toggle multiple times
4. Check browser console for errors: `Ctrl+Shift+J`

### If Defense Still Requires 20 Characters

- Make sure **🧪 TEST ON** is visible and **yellow**
- Test mode might not have been stored - refresh the page
- Toggle it off and on again

### To View Test Mode State in Console

Open browser console (`Ctrl+Shift+J`) and type:
```javascript
// View current game state
import { useArceStore } from '@/store/arceStore';
const store = useArceStore();
console.log('Test Mode:', store.testMode);
console.log('Current Phase:', store.currentPhase);
```

---

## Test Mode Scenarios

### Scenario A: Visual Testing
1. Turn ON test mode
2. Go through all 5 scenarios quickly
3. Verify animations, colors, layouts
4. Check responsive design on different screen sizes

### Scenario B: Mastery Card Testing
1. Turn ON test mode
2. Complete one scenario
3. Look at mastery card generated
4. Verify keywords and definitions display
5. Check card styling (gradient, border, hover effect)

### Scenario C: Results Page Testing
1. Turn ON test mode
2. Complete all 5 scenarios
3. Go to results page
4. Verify:
   - Stats grid shows 100%, 75%, 5, 5
   - All 5 mastery cards display
   - Response journey shows 5 entries
   - Key insights calculate correctly
   - Share buttons work
   - Heatmap displays all nodes unlocked

### Scenario D: Rapid Feature Iteration
1. Make a code change
2. Refresh the page
3. Turn ON test mode
4. Run through all 5 scenarios
5. Check if your change works
6. Repeat with new changes

---

## Performance Notes

**Test Mode Performance:**
- Input phase: Immediate (no API delay)
- Each scenario: ~1.5s (evaluation delay)
- Thermal feedback: ~3.5s display time
- Total for 5 scenarios: ~15-20 seconds

**Breakdown per scenario:**
- Select button: instant
- Empty defense: instant
- Submit: 1.5s delay (simulated evaluation)
- Feedback display: 3.5s auto-advance
- Next scenario: instant

---

## Toggling Test Mode On/Off

### How to Toggle

**While in Input Phase:**
- Click toggle to turn ON/OFF
- Changes persist through game session
- Toggle visible during all phases

**While Playing (Crisis Modal):**
- Click toggle at any time
- Effect takes place on next submission
- Useful for switching between modes mid-game

**While in Results:**
- Click toggle before starting new session
- New game will use the selected mode

### Test Mode State Persistence

- Test mode is stored in **Zustand store**
- State persists across page refreshes
- **localStorage** not used for test mode
- Resets when browser tab closes

---

## Common Test Patterns

### Pattern 1: Quick Visual Check (2 min)
```
Turn ON → Paste content → Run 5 scenarios (empty defense) → Check results
```

### Pattern 2: Feature Verification (5 min)
```
Turn ON → Run 1 scenario → Check specific feature → Make code change → Refresh → Run again
```

### Pattern 3: Design Testing (10 min)
```
Turn ON → Resize browser → Run 5 scenarios → Check responsiveness → Test on mobile
```

### Pattern 4: Mastery Card Deep Dive (3 min)
```
Turn ON → Run 1 scenario → Inspect mastery card styling → Check keywords → Check definition
```

---

## Expected Results in Test Mode

### After 5 Scenarios Completed

| Metric | Expected |
|--------|----------|
| Final Heat | 100% |
| Integrity | 75% |
| Responses | 5 |
| Mastery Cards | 5 |
| Thermal State | 🟢🟢🟢🟢🟢 |
| Response Journey | 5 green entries |
| Nodes Unlocked | 5/5 |

### Mastery Cards Generated
1. Cell Structure & Organization
2. Metabolic Processes
3. Cell Communication
4. Growth & Reproduction
5. Environmental Adaptation

Each card includes:
- Formal academic definition
- Keywords (3-4 per card)
- Thermal state indicator (green in test mode)

---

## Next Steps After Testing

1. **Found an issue?** Fix the code
2. **Feature works?** Turn OFF test mode and test normally
3. **Ready to deploy?** Make sure test mode works as designed
4. **Production?** Can leave test mode in (it's just a feature toggle)

---

## Summary

- 🧪 **Test Mode ON** = Skip defenses, auto-pass scenarios
- 🧪 **Test Mode OFF** = Normal gameplay with evaluations
- ⏱️ **Quick testing** = 30-40 seconds per complete run
- ✅ **All features testable** = Animations, cards, results, heatmap
- 🔄 **Toggle anytime** = Switch between modes during game

**Current Status**: ✅ Ready for feature testing!

