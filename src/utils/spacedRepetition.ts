/**
 * Spaced Repetition Algorithm (SM-2 variant with custom ease)
 * 
 * Intervals: 1 day → 3 days → 7 days → 14 days → 30 days → 90 days
 * Ease multiplier adjusts based on success/failure
 */

export interface ReviewTracking {
  conceptId: string;
  lastReviewedAt: Date;
  currentInterval: number; // days
  easeMultiplier: number; // starts at 2.5
  nextDueAt: Date;
  reviewCount: number;
  successCount: number;
  failureCount: number;
}

export interface ReviewResult {
  success: boolean;
  score: number; // 0-100
  phase: "phase-1" | "phase-2" | "phase-3";
}

/**
 * Initialize tracking for a new concept after first learning
 */
export function initializeTracking(conceptId: string): ReviewTracking {
  const now = new Date();
  const nextDue = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day

  return {
    conceptId,
    lastReviewedAt: now,
    currentInterval: 1,
    easeMultiplier: 2.5,
    nextDueAt: nextDue,
    reviewCount: 0,
    successCount: 0,
    failureCount: 0,
  };
}

/**
 * Update tracking based on review result
 * Returns updated tracking object with new interval and ease
 */
export function updateTracking(
  current: ReviewTracking,
  result: ReviewResult
): ReviewTracking {
  const updated = { ...current };
  updated.lastReviewedAt = new Date();
  updated.reviewCount += 1;

  // Score-based success determination (60+ is pass, under 60 is fail)
  const isSuccess = result.success || result.score >= 60;

  if (isSuccess) {
    updated.successCount += 1;
    
    // Increase ease multiplier slightly on success (max 2.5)
    updated.easeMultiplier = Math.min(2.5, updated.easeMultiplier + 0.15);
    
    // Calculate next interval based on phase and current interval
    const nextIntervals: Record<string, number> = {
      1: 3,    // 1 day → 3 days (Phase 1)
      3: 7,    // 3 days → 7 days (Phase 2 early)
      7: 14,   // 7 days → 14 days (Phase 2)
      14: 30,  // 14 days → 30 days (Phase 3)
      30: 90,  // 30 days → 90 days (Phase 3)
      90: 180, // 90 days → 6 months (mastery maintenance)
    };
    
    const nextInterval = nextIntervals[updated.currentInterval] || 
      Math.round(updated.currentInterval * updated.easeMultiplier);
    
    updated.currentInterval = nextInterval;
  } else {
    // On failure: reduce ease multiplier, reset interval back
    updated.failureCount += 1;
    
    // Decrease ease multiplier on failure (min 1.3)
    updated.easeMultiplier = Math.max(1.3, updated.easeMultiplier - 0.15);
    
    // Reset to earlier interval for retry
    const resetIntervals: Record<number, number> = {
      3: 1,    // Failed at 3 days, retry at 1 day
      7: 3,    // Failed at 7 days, retry at 3 days
      14: 7,   // Failed at 14 days, retry at 7 days
      30: 14,  // Failed at 30 days, retry at 14 days
      90: 30,  // Failed at 90 days, retry at 30 days
      180: 90, // Failed at 6 months, retry at 90 days
    };
    
    updated.currentInterval = resetIntervals[updated.currentInterval] || 1;
  }

  // Calculate next due timestamp
  const nextDueMs = updated.lastReviewedAt.getTime() + 
    (updated.currentInterval * 24 * 60 * 60 * 1000);
  updated.nextDueAt = new Date(nextDueMs);

  return updated;
}

/**
 * Get all concepts due for review today
 */
export function getConceptsDueToday(
  trackedConcepts: ReviewTracking[]
): ReviewTracking[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return trackedConcepts.filter(concept => {
    const dueDate = new Date(concept.nextDueAt);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() <= today.getTime();
  });
}

/**
 * Calculate days until next review
 */
export function daysUntilNextReview(tracking: ReviewTracking): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const due = new Date(tracking.nextDueAt);
  due.setHours(0, 0, 0, 0);
  
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

/**
 * Get review statistics
 */
export function getReviewStats(tracking: ReviewTracking) {
  const successRate = tracking.reviewCount > 0 
    ? Math.round((tracking.successCount / tracking.reviewCount) * 100)
    : 0;
    
  const daysUntil = daysUntilNextReview(tracking);
  const isOverdue = daysUntil < 0;

  return {
    successRate,
    totalReviews: tracking.reviewCount,
    daysUntil: Math.abs(daysUntil),
    isOverdue,
    currentPhase: getPhaseFromInterval(tracking.currentInterval),
    easeMultiplier: Math.round(tracking.easeMultiplier * 100) / 100,
  };
}

/**
 * Map interval to review phase
 */
export function getPhaseFromInterval(interval: number): "phase-1" | "phase-2" | "phase-3" {
  if (interval <= 3) return "phase-1"; // 1, 3 days
  if (interval <= 14) return "phase-2"; // 7, 14 days
  return "phase-3"; // 30, 90, 180+ days
}

/**
 * Get difficulty for review phase
 */
export function getDifficultyFromPhase(phase: "phase-1" | "phase-2" | "phase-3"): "multiple-choice" | "text-input" | "blindspot" {
  switch (phase) {
    case "phase-1":
      return "multiple-choice";
    case "phase-2":
      return "text-input";
    case "phase-3":
      return "blindspot";
  }
}
