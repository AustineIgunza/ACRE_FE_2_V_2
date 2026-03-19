# ARCÉ: The Iteration Engine - Frontend

> A modern learning platform that transforms crisis scenarios into mastery through interactive thermal feedback.

## 🚀 Quick Links

| Link | Purpose |
|------|---------|
| **Main App** | http://localhost:3001 |
| **Component Demo** | http://localhost:3001/demo |
| **GitHub Repo** | https://github.com/AustineIgunza/acre_frontend |

---

## 📚 Project Overview

ARCÉ is a sophisticated learning system that:
- Presents complex crisis scenarios to learners
- Evaluates responses through a thermal feedback system (Frost/Warning/Ignition)
- Builds mastery through iterative learning
- Tracks progress through heat and integrity metrics

### Technology Stack

- **Framework**: Next.js 16.1.6 with App Router
- **UI**: React 19.2.3 with TypeScript 5.x
- **Styling**: Tailwind CSS v4 + Custom CSS system
- **State Management**: Zustand
- **Build**: Turbopack (2.3s compile time)
- **Architecture**: MVC pattern (Models, Controllers, Views)

---

## 🏗️ Architecture: MVC Pattern

The codebase follows a clean MVC architecture for separation of concerns:

### Models Layer (`src/models/`)
**Business Logic & Data Processing**

- **GameModel.ts**
  - `calculateThermalState()`: Determines response quality (Frost/Warning/Ignition)
  - `calculateScores()`: Computes heat and integrity metrics
  - `validateInput()`: Form validation
  - `calculateMetrics()`: Session statistics
  - `generateMasteryCard()`: Creates learning nodes

### Controllers Layer (`src/controllers/`)
**User Interaction Handlers**

- **GameController.ts**
  - `initializeGame()`: Start new session
  - `selectAction()`: Handle action button clicks
  - `showDefenseBox()`: Show defense textbox
  - `submitDefense()`: Process and evaluate defense
  - `nextCrisis()`: Advance to next scenario
  - `resetGame()`: Clear session
  - `shareToWhatsApp()`, `shareToTwitter()`: Social sharing

### Views Layer (`src/components/`)
**React UI Components**

- **ArceInputPhase.tsx** (113 lines)
  - Entry screen with logo and input form
  - Character counter
  - Form validation feedback

- **CrisisModal.tsx** (160 lines)
  - Crisis scenario display
  - 3 action buttons (A, B, C)
  - Defense textbox with slide-up animation
  - Thermal feedback display

- **ResultsPhase.tsx** (189 lines)
  - Session statistics display
  - Response log table
  - Social sharing buttons
  - Key insights panel

- **MasteryCanvas.tsx** (110 lines)
  - Elastic grid of learning nodes
  - Locked/unlocked states
  - Thermal state indicators

- **LoadingScreen.tsx** (101 lines)
  - Full-screen loader during initialization
  - Animated progress bar
  - Educational tips display

- **MiniLoadingOverlay.tsx** (45 lines)
  - Compact loader during evaluation
  - Spinner animation

---

## 🎨 Design System

### Color Palette
```
Primary Colors:
  - Light Blue: #0066cc (interactive elements)
  - Light Blue BG: #e6f0ff (backgrounds)
  - White: #ffffff (primary background)
  - Dark Grey: #1a1a1a (text)
  - Grey: #4a5568, #718096 (secondary text)

Thermal States:
  - Frost: #ef4444 (red, shake animation)
  - Warning: #f97316 (orange, pulse animation)
  - Ignition: #10b981 (green, flash animation)
```

### Hover Effects
- **Buttons**: Smooth lift (Y: -2px) + blue glow
- **Cards**: Elevation + border color shift to blue
- **Action Buttons**: Translate right (X: 8px) + gradient overlay
- **Links**: Underline animation

### Animations
- Smooth transitions: 0.3s cubic-bezier
- Slide-up: Defense textbox
- Fade-in: Results display
- Shake: Frost state feedback
- Pulse: Warning state feedback
- Flash: Ignition state feedback

### Responsive Design
- **Mobile** (< 640px): Single column layout
- **Tablet** (640-1024px): 2-column grid
- **Desktop** (> 1024px): Multi-column grid

---

## 🔄 Data Flow

```
User Input
    ↓
[Controller] selectAction()
    ↓
[Model] calculateThermalState()
    ↓
[Store] submitDefense()
    ↓
[View] Display thermal feedback
    ↓
Repeat or Results
```

### State Management (Zustand)

```typescript
// Core state
gameSession: GameSession
currentPhase: "input" | "playing" | "results"
currentScenario: CrisisScenario
isLoading: boolean

// Actions
startGame(content, title)
selectAction(actionId)
submitDefense(defense)
nextNode()
resetGame()
```

---

## 🧪 Testing

### Quick Test Flow
1. Open http://localhost:3001
2. Paste test content (100+ characters)
3. Click "Begin Crisis Scenario"
4. Wait for LoadingScreen (1.2s)
5. Select action button
6. Type defense (20+ characters)
7. Click "Submit Defense"
8. See thermal feedback
9. Complete 2 scenarios to see results

### Component Demo
Visit http://localhost:3001/demo to see:
- Color palette showcase
- Button states (primary, secondary, outline, disabled)
- Action buttons with hover effects
- Card components with gradients
- Statistics display grid
- Form elements with focus states
- Thermal state feedback
- Animation demonstrations

### Visual Testing Checklist
- [ ] Light blue and grey color scheme visible
- [ ] Hover effects smooth and responsive
- [ ] Buttons lift on hover (no lag)
- [ ] Cards have subtle shadows
- [ ] Mobile layout is readable
- [ ] No console errors (F12)
- [ ] Animations are fluid (> 60 FPS)
- [ ] Text contrast is accessible

---

## 💻 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
cd c:\Users\mmatt\acre-frontend

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

The app will start on `http://localhost:3001` (or next available port)

### Build for Production
```bash
npm run build

# Test production build locally
npm run start
```

### Build Output
- Compile time: ~2.3 seconds
- TypeScript check: ~3.5 seconds
- Zero errors
- 5 static pages pre-rendered

---

## 📁 Project Structure

```
acre-frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main orchestrator
│   │   ├── globals.css       # Design system (modern palette)
│   │   ├── layout.tsx        # Root layout
│   │   └── demo/
│   │       └── page.tsx      # Component showcase
│   ├── components/
│   │   ├── ArceInputPhase.tsx
│   │   ├── CrisisModal.tsx
│   │   ├── ResultsPhase.tsx
│   │   ├── MasteryCanvas.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── MiniLoadingOverlay.tsx
│   ├── controllers/
│   │   └── GameController.ts   # User interaction handlers
│   ├── models/
│   │   └── GameModel.ts        # Business logic
│   ├── store/
│   │   └── arceStore.ts        # Zustand state management
│   ├── types/
│   │   └── arce.ts             # TypeScript interfaces
│   └── utils/
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── README.md                   # This file
├── TESTING_MVC.md              # Complete testing guide
└── eslint.config.mjs
```

---

## 🎯 Key Features

✅ **Modern MVC Architecture** - Clean separation of concerns  
✅ **Professional Design** - Light blue, grey, black & white palette  
✅ **Smooth Animations** - 0.3s transitions, no jank  
✅ **Hover Effects** - Every interactive element has feedback  
✅ **Type Safe** - Full TypeScript with strict types  
✅ **Responsive Design** - Mobile, tablet, desktop optimized  
✅ **State Management** - Centralized Zustand store  
✅ **Loading States** - Full-screen + mini overlays  
✅ **Thermal Feedback** - Visual state animations (Frost/Warning/Ignition)  
✅ **Social Sharing** - WhatsApp & Twitter integration  

---

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Build Time | 2.3s |
| TypeScript Check | 3.5s |
| Compile Errors | 0 |
| Warnings | 0 |
| Static Pages | 5 |
| Bundle Size | ~450KB |

---

## 🛠️ Development Commands

```bash
# Development
npm run dev                # Start dev server

# Building
npm run build              # Production build
npm run start              # Run production server

# Code Quality
npm run lint               # Run ESLint
npm run type-check         # TypeScript check

# Format
npm run format             # Format code with Prettier
```

---

## 🔐 Security

- Next.js built-in CSRF protection
- Input validation in GameModel
- Type-safe data flow
- No sensitive data in localStorage
- Secure API routes ready

---

## 📝 Contributing

This project follows MVC architecture. When adding features:

1. **Models** (`src/models/`) - Add business logic
2. **Controllers** (`src/controllers/`) - Add interaction handlers
3. **Views** (`src/components/`) - Add UI components
4. **Styling** - Update `src/app/globals.css` with design system colors
5. **Types** (`src/types/`) - Define TypeScript interfaces
6. **Tests** - Add to TESTING_MVC.md

---

## 🤝 Support

- **Issues**: Check console (F12)
- **Testing**: See TESTING_MVC.md
- **Design System**: See globals.css or /demo
- **Architecture**: See models/, controllers/, components/

---

## 📄 License

MIT

---

## 🎓 Learning Outcomes

By studying this codebase, you'll learn:
- MVC architecture patterns
- Next.js with App Router
- React component composition
- TypeScript best practices
- Zustand state management
- Responsive CSS design
- Animation techniques
- Form handling & validation

---

**Last Updated**: March 19, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Build**: Successful (2.3s compile, 0 errors)
