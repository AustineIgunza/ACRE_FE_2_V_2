/**
 * ARCÉ: The Iteration Engine - Type Definitions (v3.0)
 * 5-Phase Learning Flow: Extraction → Challenge → Sanctuary → Evaluation → Synchronization
 * Flashpoint Review Engine: SM-2 Spaced Repetition with Phase-based Difficulty Scaling
 */

// ── PHASE STATE MACHINE ──
export type LearnPhase =
  | "input"          // User enters source material
  | "extracting"     // Phase 0: background atomic extraction
  | "challenge"      // Phase 1: Dark Mode Challenge Zone
  | "transition"     // Phase 2: Breakthrough Transition animation
  | "sanctuary"      // Phase 3: Intel Card Sanctuary (Gallery Mode)
  | "evaluation"     // Phase 4: Split-Screen Stress Test
  | "synchronization" // Phase 5: Card plugs into dashboard
  | "debrief";       // Phase 6: Session Summary / After Action Report

// ── FLASHPOINT REVIEW ENGINE ──
export type ReviewPhase = "phase-1" | "phase-2" | "phase-3"; // Days 1-3, 7-14, 30-90
export type ReviewDifficulty = "multiple-choice" | "text-input" | "blindspot";

export interface ConceptReviewTracking {
  conceptId: string;
  userId: string;
  last_reviewed_timestamp: number;
  current_interval: number; // Days until next review
  ease_multiplier: number; // Starts at 2.5, adjusts based on performance
  next_due_timestamp: number; // Unix timestamp when review is due
  review_phase: ReviewPhase;
  quality_of_response: number; // 0-5: Quality rating for SM-2 algorithm
  total_reviews: number;
}

export interface FlashpointDashboardItem {
  conceptId: string;
  title: string;
  current_interval: number;
  next_due_timestamp: number;
  review_phase: ReviewPhase;
  daysUntilReview: number;
  urgency: "critical" | "high" | "medium" | "low";
}

export interface FlashpointReviewSession {
  id: string;
  userId: string;
  conceptId: string;
  reviewPhase: ReviewPhase;
  difficulty: ReviewDifficulty;
  content: {
    crisis_scenario: string; // The scenario text
    options?: { id: string; label: string }[]; // Phase 1 only
    guidance_text?: string; // Phase 2 proposal to correct
    missing_variable?: string; // Phase 3 missing data hint
  };
  userResponse: string;
  isCorrect: boolean;
  timestamp: number;
}

// ── THERMAL STATES ──
export type ThermalState = "frost" | "warning" | "ignition" | "neutral";

// ── LOGIC NODE (Atomic Extraction Output) ──
export interface LogicNode {
  id: string;
  title: string;
  core_logic: string;
  latex_formula: string;
  so_what: string;
  crisis_context: string;
  domino_question: string;
  dashboard_indicator: string;
}

// ── EXTRACTED DOCUMENT ──
export interface ExtractedDocument {
  total_nodes: number;
  topic_title: string;
  nodes: LogicNode[];
}

// ── INTEL CARD (Phase 3 Output) ──
export interface IntelCard {
  nodeId: string;
  title: string;
  formalMechanism: string;
  latexFormula: string;
  soWhat: string;
  keywords: string[];
  accuracy: ThermalState;
  chainAnalysis: string;
  heatDelta: number;
}

// ── STRESS TEST (Phase 4 Output) ──
export interface StressTest {
  counterVariable: string;
  updatedDashboardIndicator: string;
  stressQuestion: string;
  hint: string;
}

// ── USER RESPONSE ──
export interface UserResponse {
  id: string;
  nodeId: string;
  userDominoChain: string;
  timestamp: number;
  accuracy: ThermalState;
  intelCard: IntelCard | null;
}

// ── SESSION ──
export interface LearnSession {
  id: string;
  sourceContent: string;
  sourceTitle: string;
  document: ExtractedDocument | null;
  currentNodeIndex: number;
  completedNodeIds: string[];
  responses: UserResponse[];
  globalHeat: number;
  createdAt: number;
  updatedAt: number;
}

// ═══════════════════════════════════════════
// LEGACY TYPES (Backward compatibility)
// Used by battle, heatmap, and other pages
// ═══════════════════════════════════════════

export type QuestionType = "multiple-choice" | "explanatory";

export interface CausalAnchor {
  id: string;
  title: string;
  description: string;
  thermalState: ThermalState;
  heat: number;
  integrity: number;
  formalDefinition?: string;
  keywords?: string[];
  userDefense?: string;
}

export interface Cluster {
  id: string;
  clusterIndex: number;
  title: string;
  description: string;
  nodes: CausalAnchor[];
  status: "locked" | "unlocked";
  completedAt?: number;
}

export interface CrisisScenario {
  id: string;
  nodeId: string;
  crisisText: string;
  questionType: QuestionType;
  
  // Phase 1: Challenge Zone (free-text domino question)
  dominoQuestion?: string;
  
  // Phase 3: Intel Card Sanctuary (formal mechanism & formula)
  formalMechanism?: string;
  latexFormula?: string;
  soWhat?: string;
  
  // Multiple-choice (used in some phases, not Phase 1)
  actionButtons?: {
    id: string;
    label: string;
    order: number;
  }[];
  
  expectedDefense?: string;
  difficulty: "level-1" | "level-2" | "level-3";
}

export interface MasteryCard {
  id: string;
  nodeId: string;
  formalDefinition: string;
  keywords: string[];
  createdAt: number;
  shareUrl?: string;
}

export interface GameSession {
  id: string;
  sourceContent: string;
  sourceTitle?: string;
  clusters: Cluster[];
  currentClusterIndex: number;
  currentNodeIndex: number;
  globalHeat: number;
  globalIntegrity: number;
  responses: LegacyUserResponse[];
  masteryCards: MasteryCard[];
  createdAt: number;
  updatedAt: number;
  completed: boolean;
}

export interface LegacyUserResponse {
  id: string;
  scenarioId: string;
  actionChoice?: string;
  defense: string;
  timestamp: number;
  thermalResult: ThermalState;
  feedback: string;
}
