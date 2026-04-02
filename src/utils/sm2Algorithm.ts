/**
 * SM-2 Spaced Repetition Algorithm
 * Implements the SuperMemo 2 algorithm for optimal review intervals
 * 
 * Quality ratings (0-5):
 * 0-2: Fail - concept needs immediate re-review
 * 3: Pass - minimum acceptable
 * 4: Good - confident recall
 * 5: Perfect - instant recall
 */

export interface SM2Result {
  newInterval: number;
  newEaseFactor: number;
  nextPhase: "phase-1" | "phase-2" | "phase-3";
}

export function calculateSM2(
  previousInterval: number,
  currentEaseFactor: number,
  quality: number
): SM2Result {
  // Clamp quality to 0-5
  const q = Math.max(0, Math.min(5, quality));

  // Calculate new ease factor
  let newEaseFactor = currentEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor); // Minimum ease factor

  // Calculate new interval
  let newInterval: number;

  if (q < 3) {
    // Failed - restart from day 1
    newInterval = 1;
  } else if (previousInterval === 0) {
    newInterval = 1;
  } else if (previousInterval === 1) {
    newInterval = 3;
  } else {
    newInterval = Math.round(previousInterval * newEaseFactor);
  }

  // Determine phase based on interval
  let nextPhase: "phase-1" | "phase-2" | "phase-3" = "phase-1";
  if (newInterval >= 7 && newInterval <= 14) {
    nextPhase = "phase-2";
  } else if (newInterval > 14) {
    nextPhase = "phase-3";
  }

  return {
    newInterval,
    newEaseFactor: Math.round(newEaseFactor * 100) / 100,
    nextPhase,
  };
}

/**
 * Calculate urgency score for dashboard triage
 * Returns: "critical" | "high" | "medium" | "low"
 */
export function calculateUrgency(
  daysUntilReview: number
): "critical" | "high" | "medium" | "low" {
  if (daysUntilReview <= 0) return "critical";
  if (daysUntilReview <= 2) return "high";
  if (daysUntilReview <= 7) return "medium";
  return "low";
}

/**
 * Format days until review for display
 */
export function formatDaysUntilReview(daysUntilReview: number): string {
  if (daysUntilReview === 0) return "Due NOW";
  if (daysUntilReview === 1) return "Due tomorrow";
  return `Due in ${daysUntilReview} days`;
}

/**
 * Get phase description
 */
export function getPhaseDescription(phase: "phase-1" | "phase-2" | "phase-3"): string {
  const descriptions: Record<string, string> = {
    "phase-1": "Days 1-3: Rapid Recognition",
    "phase-2": "Days 7-14: Application & Diagnosis",
    "phase-3": "Days 30-90: Blindspot Mastery",
  };
  return descriptions[phase] || phase;
}
