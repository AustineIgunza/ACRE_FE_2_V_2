/**
 * ACRE: Utility Functions for the Iteration Engine
 * Day 1: Helper functions for state management
 * Day 2+: Will integrate with backend API
 */

import { HeatmapSession, ConceptNode, Iteration, NodeState } from "@/types";

/**
 * Calculate total heat across all nodes
 */
export const calculateTotalHeat = (nodes: ConceptNode[]): number => {
  return nodes.reduce((sum, node) => sum + node.heat, 0);
};

/**
 * Update a node's heat and state
 */
export const updateNodeHeat = (
  node: ConceptNode,
  heatGain: number
): ConceptNode => {
  const newHeat = Math.min(100, node.heat + heatGain);

  let newState = node.state;
  if (newHeat === 0) newState = NodeState.COLD;
  else if (newHeat < 25) newState = NodeState.WARMING;
  else if (newHeat < 75) newState = NodeState.HOT;
  else newState = NodeState.IGNITED;

  return { ...node, heat: newHeat, state: newState };
};

/**
 * Add iteration to a node
 */
export const addIterationToNode = (
  node: ConceptNode,
  iteration: Iteration
): ConceptNode => {
  const updatedNode = {
    ...node,
    iterations: [...node.iterations, iteration],
  };
  return updateNodeHeat(updatedNode, iteration.heat);
};

/**
 * Save session to localStorage
 */
export const saveSessionToLocalStorage = (session: HeatmapSession): void => {
  const key = `acre-session-${session.id}`;
  localStorage.setItem(key, JSON.stringify(session));
};

/**
 * Load session from localStorage
 */
export const loadSessionFromLocalStorage = (
  sessionId: string
): HeatmapSession | null => {
  const key = `acre-session-${sessionId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Get all saved sessions
 */
export const getAllSessions = (): HeatmapSession[] => {
  const sessions: HeatmapSession[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("acre-session-")) {
      const data = localStorage.getItem(key);
      if (data) sessions.push(JSON.parse(data));
    }
  }
  return sessions.sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Generate mock scenarios for Day 1 UI testing
 * Day 2+: Replace with actual backend API call
 */
export const generateMockScenario = (nodeLabel: string): string => {
  const mockScenarios: Record<string, string> = {
    "Logic Node 1": "You are building a train system. You need to add a new car in the middle without stopping the whole train. How do you re-link the pointers?",
    "Logic Node 2": "You have two choices: Spend 4 weeks perfecting one version, or build 10 'ugly' versions in 4 weeks and test them all. According to the principle of volume negating luck, why is the second option mathematically more likely to result in higher quality?",
    "Logic Node 3": "A student wants to learn faster. They ask if they should spend more time on harder problems or easier problems first. What would a deep thinker say?",
    "Logic Node 4": "You're designing a system where users need to know the order of operations. Does it matter? Explain your reasoning.",
  };

  return (
    mockScenarios[nodeLabel] ||
    "Explain the core principle behind this concept and how it applies to real-world scenarios."
  );
};
