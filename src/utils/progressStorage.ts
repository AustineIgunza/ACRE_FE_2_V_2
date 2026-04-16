/**
 * progressStorage.ts
 * Primary persistence layer for node progress and SRS scheduling.
 * Uses localStorage so data survives page refresh/session exit.
 */

export interface NodeProgressData {
  nodeId: string;
  title: string;
  heatScore: number;
  thermalState: string; // "ignition" | "warning" | "frost" | "neutral"
  isIgnited: boolean;
  lastAttempt: string; // ISO string
  // Hierarchy
  unitId?: string;
  unitName?: string;
  topicId?: string;
  topicName?: string;
  // SRS fields
  lastReviewedTimestamp: number; // ms
  currentInterval: number; // days: 1, 3, 7, 14, 30, 90
  nextDueTimestamp: number; // ms timestamp
  totalReviews: number;
  successCount: number;
  // Cached content for flashpoint reviews
  crisisText?: string;
  formalMechanism?: string;
  latexFormula?: string;
  soWhat?: string;
  stressTest?: string;
  dominoQuestion?: string;
  multiple_choice_question?: string;
  multiple_choice_options?: Array<{ id: string; text: string; is_correct?: boolean }>;
}

export const SRS_INTERVALS = [1, 3, 7, 14, 30, 90];
const STORAGE_KEY = "arce_node_progress";

/**
 * Maps a heat score (0-100) to its baseline review interval in days.
 * High heat → longer interval (confident → review less often)
 * Low heat → short interval (shaky → review soon)
 */
export function heatToInterval(heatScore: number): number {
  if (heatScore >= 90) return 14; // Near-perfect mastery → 2 weeks
  if (heatScore >= 70) return 7;  // Ignition → 1 week
  if (heatScore >= 45) return 3;  // Warning → 3 days
  return 1;                        // Frost → review tomorrow
}

export function loadAllProgress(): Record<string, NodeProgressData> {
  try {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveNodeProgress(
  nodeId: string,
  data: Partial<NodeProgressData> & { nodeId: string }
): NodeProgressData {
  const all = loadAllProgress();
  const existing = all[nodeId] || ({} as Partial<NodeProgressData>);
  const updated = { ...existing, ...data } as NodeProgressData;
  all[nodeId] = updated;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
  return updated;
}

/**
 * Called when a node is completed in a learn session.
 * Sets the initial review interval based on the heat score earned —
 * high-heat nodes don't need immediate review; frost nodes do.
 * Re-runs (overwrites) if the node is revisited to update the schedule.
 */
export function initNodeSRS(nodeId: string, heatScore?: number): void {
  const all = loadAllProgress();
  const node = all[nodeId];
  const effectiveHeat = heatScore ?? node?.heatScore ?? 0;
  const interval = heatToInterval(effectiveHeat);
  const now = Date.now();

  all[nodeId] = {
    ...(node || {}),
    nodeId,
    lastReviewedTimestamp: now,
    currentInterval: interval,
    nextDueTimestamp: now + interval * 24 * 60 * 60 * 1000,
    totalReviews: node?.totalReviews ?? 0,
    successCount: node?.successCount ?? 0,
  } as NodeProgressData;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

/**
 * Advance or reset SRS after a flashpoint review.
 * - Updates heat score (correct → +10, wrong → −15, clamped 0-100)
 * - Next interval is heat-driven: the new heat score determines the baseline,
 *   success allows advancing along SRS_INTERVALS beyond that baseline,
 *   failure falls back to the heat-based floor (not always day 1)
 */
export function advanceSRS(nodeId: string, isSuccess: boolean): NodeProgressData {
  const all = loadAllProgress();
  const node = all[nodeId];
  if (!node) return {} as NodeProgressData;

  const now = Date.now();

  // Update heat score based on review outcome
  const currentHeat = node.heatScore ?? 0;
  const newHeat = isSuccess
    ? Math.min(100, currentHeat + 10)
    : Math.max(0, currentHeat - 15);

  // Derive new thermal state from updated heat
  const newThermal = newHeat >= 70 ? "ignition" : newHeat >= 45 ? "warning" : "frost";

  // Heat-based floor: a strong node should never fall below its natural interval
  const heatFloor = heatToInterval(newHeat);

  let nextInterval: number;
  if (isSuccess) {
    // Advance one step in SRS_INTERVALS, but never below the heat floor
    const currentIndex = SRS_INTERVALS.indexOf(node.currentInterval);
    const advanced =
      currentIndex === -1 || currentIndex >= SRS_INTERVALS.length - 1
        ? SRS_INTERVALS[SRS_INTERVALS.length - 1]
        : SRS_INTERVALS[currentIndex + 1];
    nextInterval = Math.max(advanced, heatFloor);
  } else {
    // On failure, reset to heat-based floor — not always day 1
    // A warning-level node resets to 3 days, ignition to 7, frost to 1
    nextInterval = heatFloor;
  }

  const updated: NodeProgressData = {
    ...node,
    heatScore: newHeat,
    thermalState: newThermal,
    isIgnited: newHeat >= 70,
    lastReviewedTimestamp: now,
    currentInterval: nextInterval,
    nextDueTimestamp: now + nextInterval * 24 * 60 * 60 * 1000,
    totalReviews: (node.totalReviews || 0) + 1,
    successCount: (node.successCount || 0) + (isSuccess ? 1 : 0),
  };

  all[nodeId] = updated;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
  return updated;
}

/** Nodes where nextDueTimestamp <= now (due for review today). */
export function getDueNodes(): NodeProgressData[] {
  const all = loadAllProgress();
  const now = Date.now();
  return Object.values(all)
    .filter((n) => n.nextDueTimestamp && n.nextDueTimestamp <= now)
    .sort((a, b) => a.nextDueTimestamp - b.nextDueTimestamp);
}

/** Nodes due in the next N days (not yet due). */
export function getUpcomingNodes(daysAhead = 14): NodeProgressData[] {
  const all = loadAllProgress();
  const now = Date.now();
  const cutoff = now + daysAhead * 24 * 60 * 60 * 1000;
  return Object.values(all)
    .filter((n) => n.nextDueTimestamp && n.nextDueTimestamp > now && n.nextDueTimestamp <= cutoff)
    .sort((a, b) => a.nextDueTimestamp - b.nextDueTimestamp);
}

/** All nodes sorted by most recently studied. */
export function getRecentNodes(limit = 10): NodeProgressData[] {
  const all = loadAllProgress();
  return Object.values(all)
    .sort((a, b) => new Date(b.lastAttempt || 0).getTime() - new Date(a.lastAttempt || 0).getTime())
    .slice(0, limit);
}

/** Maps SRS interval to flashpoint phase (1 | 2 | 3). */
export function getFlashpointPhase(interval: number): 1 | 2 | 3 {
  if (interval <= 3) return 1;
  if (interval <= 14) return 2;
  return 3;
}

/** Human-readable "due in X days" or "X days overdue". */
export function getDueLabel(nextDueTimestamp: number): { label: string; overdue: boolean; days: number } {
  const now = Date.now();
  const diff = nextDueTimestamp - now;
  const days = Math.round(Math.abs(diff) / (24 * 60 * 60 * 1000));
  if (diff < 0) return { label: `${days}d overdue`, overdue: true, days };
  if (days === 0) return { label: "Due today", overdue: false, days: 0 };
  return { label: `in ${days}d`, overdue: false, days };
}

/** Format timestamp to readable date. */
export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
