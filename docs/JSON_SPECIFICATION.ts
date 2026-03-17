/**
 * ACRE: JSON STRUCTURE SPECIFICATION
 * Frontend ↔ Backend Contract
 * Document Version: 1.0
 * Created: March 16, 2026
 * 
 * IMPORTANT: Share this with your backend team for alignment!
 * This defines the exact shape of data flowing between frontend and backend.
 */

// ============================================
// 1. REQUEST: Generate Scenario
// ============================================
// Endpoint: POST /api/generate-scenario
// When: User starts a challenge on a cold/warming node
// Body:

interface GenerateScenarioRequest {
  sourceContent: string; // Full text the user pasted
  conceptNode: {
    id: string;
    label: string;
    description: string;
  };
  iterationCount: number; // How many times user tried this node
  previousFeedback?: string[]; // Last 2-3 feedback strings to avoid repetition
}

// Expected Response:
interface GenerateScenarioResponse {
  success: boolean;
  scenario: {
    prompt: string; // The actual question to show the user
    systemContext: string; // Hidden system prompt sent to Gemini (for your team's reference)
    difficultyLevel: "beginner" | "intermediate" | "advanced";
  };
  estimatedHeatGain: number; // How much heat correct answer gains (5-25 range)
}

// Example Request:
const exampleRequest = {
  sourceContent: "Volume negates luck. If you do something 10 times instead of perfecting once, you learn 10x faster. By the 10th attempt, you're a completely different person than on attempt 1.",
  conceptNode: {
    id: "node-2",
    label: "Volume Negates Luck",
    description: "Quantity over quality leads to mastery",
  },
  iterationCount: 1,
  previousFeedback: [],
};

// Example Response:
const exampleResponse = {
  success: true,
  scenario: {
    prompt:
      "You're building a software feature. You have two choices: Spend 4 weeks perfecting one version, or build 10 'ugly' versions in 4 weeks and test them all. According to the 'Volume' principle, why is Choice 2 mathematically more likely to result in higher quality?",
    systemContext:
      "You are evaluating whether the user understands that quality is a BYPRODUCT of high-volume reps, not a starting condition. Passive answers like 'more chances' are incomplete. Look for evidence they understand the learning curve effect.",
    difficultyLevel: "intermediate",
  },
  estimatedHeatGain: 15,
};

// ============================================
// 2. REQUEST: Evaluate User Answer
// ============================================
// Endpoint: POST /api/evaluate-answer
// When: User submits their response to a scenario
// Body:

interface EvaluateAnswerRequest {
  nodeId: string;
  scenarioPrompt: string; // Echo back the prompt for context
  userAnswer: string; // What the user typed
  attemptNumber: number;
}

// Expected Response:
interface EvaluateAnswerResponse {
  success: boolean;
  feedback: string; // What to show the user
  heatGained: number; // 0-25 range. 0 = needs more depth, 5-10 = good start, 15+ = mastery
  passedMastery: boolean; // true if heat >= threshold (usually 20+)
  nextPrompt?: string; // Optional: If not mastery, a follow-up hint
  explanationIfWrong?: string; // Optional: Deep explanation if they failed
}

// Example Request:
const exampleEvalRequest = {
  nodeId: "node-2",
  scenarioPrompt:
    "You're building a software feature. You have two choices: Spend 4 weeks perfecting one version, or build 10 'ugly' versions in 4 weeks and test them all. According to the 'Volume' principle, why is Choice 2 mathematically more likely to result in higher quality?",
  userAnswer:
    "Because doing it 10 times gives you 10x the skill reps. By the 10th one, you're a better builder than attempt 1. The volume creates the quality.",
  attemptNumber: 2,
};

// Example Response:
const exampleEvalResponse = {
  success: true,
  feedback:
    "🔥 Deep Red Heat! You understand that quality is a BYPRODUCT of high-volume reps, not a starting point. Mastery confirmed.",
  heatGained: 22,
  passedMastery: true,
  nextPrompt: undefined,
};

// ============================================
// 3. LOCAL STORAGE: Session State
// ============================================
// Key: `acre-session-${sessionId}`
// Stored immediately after node generation
// Updated after each iteration

interface HeatmapSession {
  id: string; // `session-${timestamp}`
  sourceContent: string; // Full pasted content
  sourceTitle: string; // User's optional title
  nodes: ConceptNode[];
  totalHeat: number; // Sum of all node heats
  createdAt: number; // Timestamp
  updatedAt: number; // Last modified
  completed: boolean;
  completedAt?: number;
  sharedUrl?: string; // Generated after mastery
}

interface ConceptNode {
  id: string; // `node-${index}`
  label: string; // "Volume Negates Luck"
  description: string; // "Quantity over quality..."
  state: "cold" | "warming" | "hot" | "ignited";
  heat: number; // 0-100 scale
  iterations: Iteration[]; // All attempts on this node
}

interface Iteration {
  id: string;
  attemptNumber: number;
  userAnswer: string;
  engineFeedback: string; // From backend
  heat: number; // Points gained
  timestamp: number;
  passedMastery: boolean;
}

// ============================================
// 4. MASTER PROMPT TEMPLATE
// ============================================
// What your backend team will send to Gemini 1.5 Flash
// This is the "secret sauce" - update during Week 2 testing

const MASTER_SYSTEM_PROMPT = `
You are the Dungeon Master for the "Iteration Engine" - an AI that stress-tests whether people truly understand concepts, not just memorize them.

CORE RULE: Never ask for definitions. Every question MUST be a scenario.

BAD: "What is a Linked List?"
GOOD: "You're building a train system. You need to add a new car in the middle without stopping the whole train. How do you re-link the pointers?"

When a user submits an answer:
1. Check if they understand the PRINCIPLE, not just surface-level knowledge
2. Passive answers get Faint Blue Glow ("needs more depth")
3. Deep understanding gets Red-Hot Mastery ("confirmed")

Grade on a scale:
- 0-5: Passive, surface-level, wrong application
- 6-15: Good start, but missing the core mechanism
- 16-25: Deep understanding, can apply independently

Always be harsh but fair. Users are trying to prove their logic is real, not just absorbed.
`;

// ============================================
// 5. HEAT STATE MACHINE
// ============================================
// Frontend uses these transitions:

const HEAT_TRANSITIONS = {
  COLD: {
    range: [0, 0],
    label: "❄️",
    description: "Never attempted",
    nextState: "warming",
  },
  WARMING: {
    range: [1, 24],
    label: "🌡️",
    description: "Building heat",
    nextState: "hot",
  },
  HOT: {
    range: [25, 74],
    label: "🔥",
    description: "Getting close",
    nextState: "ignited",
  },
  IGNITED: {
    range: [75, 100],
    label: "🔴",
    description: "Mastery confirmed",
    nextState: null, // Terminal state
  },
};

// ============================================
// 6. CALENDAR & DEADLINES
// ============================================
// Day 1 (TODAY):
//   ✅ Frontend: Build static UI (DONE)
//   ✅ Backend: Finalize JSON structure (this doc)
//   TODO Backend: Server setup + basic Gemini connection test
//
// Day 2:
//   Frontend: Wire up state management + loading screens
//   Backend: Test prompt variations, stress test edge cases
//
// Day 3:
//   Frontend: Connect to live API
//   Backend: Hand over final master prompt
//   LAUNCH: MVP ready for testing

export {};
