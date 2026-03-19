/**
 * ARCÉ: The Iteration Engine - Type Definitions (v2.1)
 * Shared data structures for the Dynamic Canvas MVP
 */

// Thermal state: Cold (Frost) → Warm (Warning) → Hot (Ignition)
export type ThermalState = "frost" | "warning" | "ignition" | "neutral";

// Question types: Multiple choice or explanatory defense
export type QuestionType = "multiple-choice" | "explanatory";

// Causal Anchor: A single logical framework to master
export interface CausalAnchor {
  id: string;
  title: string;
  description: string;
  thermalState: ThermalState;
  heat: number; // 0-100
  integrity: number; // 0-100
}

// Cluster: Group of 3-4 nodes for cognitive load management
export interface Cluster {
  id: string;
  clusterIndex: number;
  title: string;
  description: string;
  nodes: CausalAnchor[];
  status: "locked" | "unlocked"; // Locked until previous cluster completed
  completedAt?: number;
}

// Crisis Scenario: A Level 2 tactical challenge
export interface CrisisScenario {
  id: string;
  nodeId: string;
  crisisText: string;
  questionType: QuestionType;
  actionButtons?: {
    // For multiple-choice questions
    id: string;
    label: string;
    order: number;
  }[];
  expectedDefense?: string; // For explanatory questions
  difficulty: "level-1" | "level-2" | "level-3";
}

// User Response: Action (button click) + Defense (text explanation)
export interface UserResponse {
  id: string;
  scenarioId: string;
  actionChoice?: string; // For multiple-choice (button ID)
  defense: string; // The typed explanation
  timestamp: number;
  thermalResult: ThermalState;
  feedback: string;
}

// Mastery Card: Proof of concept ownership (Ignition state)
export interface MasteryCard {
  id: string;
  nodeId: string;
  formalDefinition: string;
  keywords: string[];
  createdAt: number;
  shareUrl?: string;
}

// Game Session: Represents one learning session
export interface GameSession {
  id: string;
  sourceContent: string;
  sourceTitle?: string;
  clusters: Cluster[];
  currentClusterIndex: number;
  currentNodeIndex: number;
  globalHeat: number; // 0-100 (represents mastery progress)
  globalIntegrity: number; // 0-100 (represents logical depth)
  responses: UserResponse[];
  masteryCards: MasteryCard[];
  createdAt: number;
  updatedAt: number;
  completed: boolean;
}

// API Request: Extract & Generate Clusters
export interface ExtractLogicRequest {
  sourceContent: string;
  sourceTitle?: string;
}

// API Response: Clusters with scenarios
export interface ExtractLogicResponse {
  clusters: Cluster[];
  globalHeat: number;
  nextScenario: CrisisScenario;
}

// API Request: Submit a response and get feedback
export interface SubmitDefenseRequest {
  nodeId: string;
  scenarioId: string;
  actionChoice?: string;
  defense: string;
}

// API Response: Thermal feedback + next scenario
export interface SubmitDefenseResponse {
  thermalState: ThermalState;
  feedback: string;
  heatGained: number;
  integrityGained: number;
  masteryCard?: MasteryCard; // If ignition achieved
  nextScenario?: CrisisScenario;
  nodeCompleted: boolean;
}

// Mock data for UI testing (Day 1)
export const EXAMPLE_CLUSTER: Cluster = {
  id: "cluster-1",
  clusterIndex: 0,
  title: "Systems Thinking Fundamentals",
  description: "Learn how causal chains build resilient systems",
  nodes: [
    {
      id: "node-1",
      title: "Feedback Loops",
      description: "Understand positive and negative feedback mechanisms",
      thermalState: "neutral",
      heat: 0,
      integrity: 0,
    },
    {
      id: "node-2",
      title: "Bottleneck Detection",
      description: "Identify the single point of failure in a system",
      thermalState: "neutral",
      heat: 0,
      integrity: 0,
    },
    {
      id: "node-3",
      title: "Leverage Points",
      description: "Find where small changes have disproportionate effects",
      thermalState: "neutral",
      heat: 0,
      integrity: 0,
    },
  ],
  status: "unlocked",
};

export const EXAMPLE_CRISIS_SCENARIO: CrisisScenario = {
  id: "scenario-1",
  nodeId: "node-1",
  crisisText:
    "You are the CEO of a supply chain logistics company. A factory in your region was just shut down by regulatory action. Your production depends 100% on that factory. What is your immediate move?",
  questionType: "multiple-choice",
  actionButtons: [
    { id: "btn-a", label: "Find an alternative supplier immediately", order: 1 },
    {
      id: "btn-b",
      label: "Negotiate with regulators to reopen the factory",
      order: 2,
    },
    { id: "btn-c", label: "Pivot to a different product line", order: 3 },
  ],
  difficulty: "level-2",
};
