# ARCÉ: The Iteration Engine - Frontend

> A modern learning platform that transforms crisis scenarios into mastery through interactive thermal feedback.

## Current Test Content: Cell Biology

Study Material:
"The cell is the basic unit of life, capable of carrying out essential functions such as metabolism, growth, and reproduction. It contains specialized structures like the nucleus, mitochondria, and membrane, which coordinate activities. Cells communicate, adapt to their environment, and work together to form tissues, organs, and complex living organisms."

3 Crisis Scenarios covering:
1. Cell Structure and Organization - Identify mitochondria as the energy powerhouse
2. Metabolic Processes - Understand ATP dependency for cell survival
3. Cell Communication - Learn chemical signaling through receptors

Thermal Feedback System:
- FROST (Red): Wrong answer - Button B
- WARNING (Orange): Partial answer - unused in test mode
- IGNITION (Green): Correct answer - Buttons A and C with different heat levels

---

## Quick Links

| Link | Purpose |
|------|---------|
| Main App | http://localhost:3000 |
| Component Demo | http://localhost:3000/demo |
| GitHub Repo | https://github.com/AustineIgunza/acre_frontend |

---

## Project Overview

ARCÉ is a learning system that:
- Presents complex crisis scenarios to learners
- Evaluates responses through thermal feedback (Frost/Warning/Ignition)
- Builds mastery through iterative learning
- Tracks progress through heat and integrity metrics
- Displays mastery canvas heatmap with color-coded performance

### Technology Stack

- Framework: Next.js 16.1.6 with App Router
- UI: React 19.2.3 with TypeScript 5.x
- Styling: Tailwind CSS v4 + Custom CSS system
- State Management: Zustand
- Build: Turbopack (2.7s compile time)
- Architecture: Component-based with store pattern

---

## Architecture

The codebase follows a component-based architecture with Zustand state management.

### Components Layer (src/components/)

- ArceInputPhase.tsx: Entry screen with logo and input form
- CrisisModal.tsx: Crisis scenario display with 3 action buttons and defense input
- ResultsPhase.tsx: Session statistics, response log, and sharing buttons
- MasteryCanvas.tsx: Elastic grid of learning nodes with heat indicators
- FeedbackModal.tsx: Popup modal for thermal feedback display
- LoadingScreen.tsx: Full-screen loader during initialization
- MiniLoadingOverlay.tsx: Compact loader during evaluation

### State Management (src/store/)

- arceStore.ts: Zustand store managing game session, current phase, scenarios, and test mode

### Utilities (src/utils/)

- mockTestData.ts: Test scenarios, evaluation logic, and mastery card generation

---

## Design System

### Color Palette

Primary Colors:
- Light Blue: #0066cc (interactive elements)
- Light Blue BG: #e6f0ff (backgrounds)
- White: #ffffff (primary background)
- Dark Grey: #1a1a1a (text)

Thermal States:
- Frost: #ef4444 (red, shake animation)
- Warning: #f97316 (orange, pulse animation)
- Ignition: #10b981 (green, flash animation)

Heat Bar Colors:
- Blue: 0-35% heat (good performance)
- Orange: 36-65% heat (moderate)
- Red: 66-100% heat (bad performance)

### Responsive Design

- Mobile (less than 640px): Single column layout
- Tablet (640-1024px): 2-column grid
- Desktop (greater than 1024px): Multi-column grid

---

## Data Flow

User Input
    ↓
Submit Answer
    ↓
Evaluate Response
    ↓
Display Feedback Modal (3.5s auto-close)
    ↓
Advance to Next Scenario
    ↓
After 3 Scenarios: Results Page with Heatmap

### State Management (Zustand)

Core state:
- gameSession: GameSession
- currentPhase: "input" or "playing" or "results"
- currentScenario: CrisisScenario
- testMode: boolean
- isLoading: boolean

Actions:
- startGame(content, title)
- selectAction(actionId)
- submitDefense(defense)
- nextNode()
- endGame()
- toggleTestMode()
- resetGame()

---

## Testing

### Quick Test Flow

1. Open http://localhost:3001
2. Turn on Test Mode (top-right toggle button)
3. Paste study material (100+ characters)
4. Click Start
5. For each of 3 scenarios:
   - Click Button A (correct, low heat/blue) or Button C (correct, high heat/red)
   - Click Button B (wrong answer, frost)
   - Leave defense empty or type anything
   - Click Submit
   - Watch feedback modal (appears centered, auto-closes in 3.5s)
6. After 3 scenarios, see Results page
7. Scroll down to see Mastery Canvas heatmap with color-coded heat bars

### Component Demo

Visit http://localhost:3001/demo to see component showcase

### Visual Testing Checklist

- Light blue and grey color scheme visible
- Hover effects smooth and responsive
- Buttons lift on hover
- Cards have subtle shadows
- Mobile layout is readable
- No console errors
- Animations are fluid
- Text contrast is accessible
- Heat bars show blue, orange, and red colors
- Feedback modal centers properly and doesn't block text

---

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

cd c:\Users\mmatt\acre-frontend
npm install
npm run dev

The app will start on http://localhost:3001

### Build for Production

npm run build
npm run start

### Build Output

- Compile time: 2.7 seconds
- TypeScript check: 4.4 seconds
- Zero errors
- 5 static pages pre-rendered

---

## Project Structure

acre-frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx          (Main entry point)
│   │   ├── globals.css       (Design system)
│   │   ├── layout.tsx        (Root layout)
│   │   └── demo/
│   │       └── page.tsx      (Component showcase)
│   ├── components/
│   │   ├── ArceInputPhase.tsx
│   │   ├── CrisisModal.tsx
│   │   ├── FeedbackModal.tsx
│   │   ├── ResultsPhase.tsx
│   │   ├── MasteryCanvas.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── MiniLoadingOverlay.tsx
│   ├── store/
│   │   └── arceStore.ts        (Zustand state management)
│   ├── types/
│   │   └── arce.ts             (TypeScript interfaces)
│   └── utils/
│       └── mockTestData.ts     (Test scenarios and evaluation)
├── public/                      (Static assets)
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── README.md

---

## Key Features

- Modern Component Architecture
- Professional Design System
- Smooth Animations
- Hover Effects on All Interactive Elements
- Full TypeScript with Strict Types
- Responsive Design (Mobile, Tablet, Desktop)
- Zustand State Management
- Loading States (Full-screen and Mini Overlays)
- Thermal Feedback System (Frost/Warning/Ignition)
- Social Sharing (WhatsApp and Twitter)
- Compact Feedback Modal (Centered, Auto-closing)
- Heat Bar Visualization (Blue, Orange, Red)
- Mastery Canvas Heatmap

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Build Time | 2.7s |
| TypeScript Check | 4.4s |
| Compile Errors | 0 |
| Warnings | 0 |
| Static Pages | 5 |
| Test Scenarios | 3 |

---

## Development Commands

npm run dev                (Start dev server)
npm run build              (Production build)
npm run start              (Run production server)
npm run lint               (Run ESLint)

---

## Security

- Next.js built-in CSRF protection
- Input validation
- Type-safe data flow
- No sensitive data in localStorage
- Secure API routes ready

---

## Latest Changes

Version 1.0.0 - March 19, 2026

Recent Updates:
1. Added FeedbackModal component - Centered popup modal with auto-close timer
2. Reduced test scenarios from 5 to 3 for focused testing
3. Updated evaluation logic: Button B is wrong (FROST), Buttons A and C are correct with different heat levels
4. Added heat bar visualization to MasteryCanvas - Color coded by performance (blue/orange/red)
5. Optimized modal typography and spacing for better text fitting
6. Fixed modal close button positioning to avoid text overlap
7. Improved responsive design across all screen sizes
8. Removed all emojis from code and documentation

---

## Test Mode Features

When Test Mode is enabled:
- Button A: Always correct (IGNITION) with low heat (Blue bar ~20%)
- Button B: Always wrong (FROST)
- Button C: Always correct (IGNITION) with high heat (Red bar ~75%)
- Defense text is optional
- Feedback appears as centered popup modal
- Modal auto-closes after 3.5 seconds
- Auto-advances to next scenario
- Heatmap shows different colored heat bars for each node
- Complete 3 scenarios in about 15-20 seconds

---

## Usage

1. Start the development server: npm run dev
2. Open http://localhost:3001
3. Toggle Test Mode on (top-right button turns yellow)
4. Paste study material and click Start
5. Answer 3 questions - feedback appears as centered modal
6. See results page with heatmap showing performance
7. Scroll down to see Mastery Canvas with colored heat indicators

---

**Last Updated**: March 19, 2026
**Version**: 1.0.0
**Status**: Production Ready
**Build**: Successful (2.7s compile, 0 errors)
