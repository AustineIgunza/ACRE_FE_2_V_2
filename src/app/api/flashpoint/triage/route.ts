import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

// Spaced Repetition Intervals (in days)
const INTERVALS = [1, 3, 7, 14, 30, 90];
const DEFAULT_EASE = 2.5;

interface ConceptProgress {
  node_id: string;
  user_id: string;
  last_reviewed_timestamp: string | null;
  current_interval: number;
  ease_multiplier: number;
  next_due_timestamp: string;
  phase: number; // 1, 2, or 3 based on interval
  attempt_count: number;
  success_count: number;
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get all user progress records
    const { data: allProgress, error: progressError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId);

    if (progressError) {
      console.error("Error fetching progress:", progressError);
      return NextResponse.json(
        { error: "Failed to fetch progress" },
        { status: 500 }
      );
    }

    // Get current timestamp
    const now = new Date();

    // Filter for concepts that are DUE today (next_due_timestamp <= now)
    const dueToday = (allProgress || [])
      .filter((p: any) => {
        if (!p.next_due_timestamp) return false;
        const dueDate = new Date(p.next_due_timestamp);
        return dueDate <= now;
      })
      .sort((a: any, b: any) => {
        // Sort by urgency (most overdue first)
        const dateA = new Date(a.next_due_timestamp);
        const dateB = new Date(b.next_due_timestamp);
        return dateA.getTime() - dateB.getTime();
      });

    // Determine phase for each concept based on current_interval
    const conceptsWithPhase = dueToday.map((concept: any) => {
      let phase = 1;
      if (concept.current_interval >= 7 && concept.current_interval < 30) {
        phase = 2;
      } else if (concept.current_interval >= 30) {
        phase = 3;
      }

      return {
        nodeId: concept.node_id,
        conceptTitle: concept.node_id.replace(/^(node|concept)[-_]?/i, ''),
        phase: `phase-${phase}` as "phase-1" | "phase-2" | "phase-3",
        difficulty: phase === 1 ? "multiple-choice" : phase === 2 ? "text-input" : "blindspot",
        daysOverdue: Math.floor((now.getTime() - new Date(concept.next_due_timestamp).getTime()) / (1000 * 60 * 60 * 24)),
        daysUntilDue: 0, // Already due
        successRate: concept.success_count > 0 ? Math.round((concept.success_count / concept.attempt_count) * 100) : 0,
        totalAttempts: concept.attempt_count,
        lastReviewedAt: concept.last_reviewed_timestamp,
      };
    });

    // Statistics
    const stats = {
      totalDue: conceptsWithPhase.length,
      phase1Count: conceptsWithPhase.filter((c: any) => c.phase === "phase-1").length,
      phase2Count: conceptsWithPhase.filter((c: any) => c.phase === "phase-2").length,
      phase3Count: conceptsWithPhase.filter((c: any) => c.phase === "phase-3").length,
      mostOverdueCount: conceptsWithPhase.length > 0 ? conceptsWithPhase[0].daysOverdue : 0,
    };

    return NextResponse.json({
      due_reviews: conceptsWithPhase,
      stats,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Flashpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to calculate next due date
export function calculateNextDueDate(
  currentInterval: number,
  easeMultiplier: number
): { nextInterval: number; nextDueTimestamp: string } {
  // Find current position in INTERVALS array
  const currentIndex = INTERVALS.indexOf(currentInterval);
  
  // Calculate next interval
  let nextInterval = currentInterval;
  if (currentIndex < INTERVALS.length - 1) {
    nextInterval = INTERVALS[currentIndex + 1];
  }

  // Calculate next due timestamp
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + nextInterval);

  return {
    nextInterval,
    nextDueTimestamp: nextDueDate.toISOString(),
  };
}
