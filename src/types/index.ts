/**
 * ACRE: Iteration Engine - Type Definitions
 * Shared data structures across the application
 */

// Heat level: 0-100, Cold (0) to Red-Hot (100)
export type HeatLevel = number;

// Node states in the heatmap
export enum NodeState {
  COLD = "cold", // Grey, untouched
  WARMING = "warming", // Blue, first attempt
  HOT = "hot", // Orange, good progress
  IGNITED = "ignited", // Red-hot, mastery confirmed
}

// Single logic node in the heatmap
export interface ConceptNode {
  id: string;
  label: string;
  description: string;
  state: NodeState;
  heat: HeatLevel;
  iterations: Iteration[];
}

// User's attempt at a scenario
export interface Iteration {
  id: string;
  attemptNumber: number;
  userAnswer: string;
  engineFeedback: string;
  heat: HeatLevel;
  timestamp: number;
  passedMastery: boolean;
}

// AI-generated scenario for a node
export interface Scenario {
  nodeId: string;
  prompt: string;
  systemContext: string;
  expectedLearningOutcome: string;
}

// Session state: represents one "Boss Battle"
export interface HeatmapSession {
  id: string;
  sourceContent: string; // Pasted notes/transcript
  sourceTitle?: string;
  nodes: ConceptNode[];
  totalHeat: number;
  createdAt: number;
  updatedAt: number;
  completed: boolean;
  completedAt?: number;
  sharedUrl?: string;
}

// API request to backend (Day 2+)
export interface GenerateScenarioRequest {
  sourceContent: string;
  conceptNode: ConceptNode;
  previousIterations: Iteration[];
}

// API response from backend (Day 2+)
export interface GenerateScenarioResponse {
  scenario: Scenario;
  difficulty: "easy" | "medium" | "hard";
}

// Evaluation response from AI
export interface EvaluationResponse {
  feedback: string;
  heatGained: number;
  passedMastery: boolean;
  nextPrompt?: string; // For iterative challenges
}

// Mock data structure for UI testing (Day 1)
export interface MockHeatmapData {
  nodes: ConceptNode[];
  currentNodeIndex: number;
  sessionState: "input" | "loading" | "challenge" | "evaluating" | "complete";
}
