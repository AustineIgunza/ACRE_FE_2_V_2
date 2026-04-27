import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * POST /api/flashpoint/evaluate-response
 * 
 * Evaluates Phase 1 (multiple choice), Phase 2 (text input), and Phase 3 (blindspot question) responses.
 * Updates user_progress with spaced repetition intervals using SM-2 algorithm.
 * 
 * Request body:
 * {
 *   userId: string (required for updating progress),
 *   conceptId: string (required for updating progress),
 *   phase: 1 | 2 | 3,
 *   userResponse: string,
 *   isCorrect?: boolean (for phase 1),
 *   evaluationRubric?: string (for phase 2),
 *   missingVariable?: string (for phase 3),
 *   successCondition?: string (for phase 3),
 *   currentInterval?: number,
 *   currentEase?: number
 * }
 */


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId,
      conceptId,
      phase, 
      userResponse, 
      isCorrect,
      evaluationRubric, 
      missingVariable, 
      successCondition,
      currentInterval = 1,
      currentEase = 2.5
    } = body;

    if (!phase || !userResponse) {
      return NextResponse.json(
        { error: "Missing phase or userResponse" },
        { status: 400 }
      );
    }

    const responseLower = userResponse.toLowerCase();
    let evaluationResult: any = {};
    let success = false;

    if (phase === 1) {
      evaluationResult = evaluatePhase1(isCorrect);
      success = isCorrect === true;
    } else if (phase === 2) {
      evaluationResult = evaluatePhase2(responseLower, evaluationRubric);
      success = evaluationResult.success;
    } else if (phase === 3) {
      evaluationResult = evaluatePhase3(responseLower, missingVariable, successCondition);
      success = evaluationResult.success;
    } else {
      return NextResponse.json(
        { error: "Invalid phase" },
        { status: 400 }
      );
    }

    // Update spaced repetition if userId and conceptId provided
    if (userId && conceptId) {
      const { nextInterval, nextEase } = calculateNextReview(
        success,
        currentInterval,
        currentEase
      );

      await updateUserProgress(userId, conceptId, {
        success,
        nextInterval,
        nextEase,
        phase,
        userResponse
      });

      evaluationResult.spaced_repetition = {
        nextInterval,
        nextEase,
        nextDueDate: new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000).toISOString()
      };
    }

    return NextResponse.json({
      phase,
      success,
      ...evaluationResult
    });
  } catch (error) {
    console.error("Error evaluating response:", error);
    return NextResponse.json(
      { error: "Failed to evaluate response" },
      { status: 500 }
    );
  }
}

function evaluatePhase2(responseLower: string, evaluationRubric: string): NextResponse {
  // Phase 2 evaluation: Check if user identified the flaw and proposed correct direction
  
  // Define evaluation keywords for different scenarios
  const evaluationPatterns = {
    "inflation-stimulus": {
      correctKeywords: ["stimulus", "money supply", "increase", "accelerate", "inflation", "interest rate", "hike", "rate"],
      correctPhrase: ["stimulus increases", "money supply", "worsens", "rate hike", "hike rate"],
      antiKeywords: ["lower rate", "decrease rate", "ease"]
    },
    "system-stability": {
      correctKeywords: ["load", "heat", "thermal", "cool", "shed", "reduce", "fail", "cascade"],
      correctPhrase: ["reduce load", "more servers", "more heat", "cool", "fix cooling"],
      antiKeywords: ["increase server", "add capacity", "spin up"]
    }
  };

  // Simple keyword matching for now
  let foundCorrectConcepts = 0;
  let score = 0;

  // Check for inflation-stimulus scenario
  if (responseLower.includes("stimulus") && responseLower.includes("money supply")) {
    foundCorrectConcepts += 2;
  }
  if (responseLower.includes("interest rate") || responseLower.includes("rate hike")) {
    foundCorrectConcepts += 1;
  }
  if (responseLower.includes("wors") || responseLower.includes("accelerat")) {
    foundCorrectConcepts += 1;
  }

  // Check for system scenario
  if (responseLower.includes("reduce") && responseLower.includes("load")) {
    foundCorrectConcepts += 2;
  }
  if (responseLower.includes("heat") && responseLower.includes("thermal")) {
    foundCorrectConcepts += 1;
  }
  if (responseLower.includes("cool")) {
    foundCorrectConcepts += 1;
  }

  // Anti-patterns (wrong answer)
  let antiPatternScore = 0;
  if (responseLower.includes("lower rate") || responseLower.includes("decrease rate")) {
    antiPatternScore += 3;
  }
  if (responseLower.includes("increase server") || responseLower.includes("add server")) {
    antiPatternScore += 3;
  }

  score = Math.max(0, (foundCorrectConcepts * 20) - (antiPatternScore * 10));
  score = Math.min(100, score);

  const success = score >= 60;

  return NextResponse.json({
    phase: "phase-2",
    success,
    score: Math.round(score),
    feedback: success
      ? "Excellent! You identified the core flaw and proposed the correct counter-measure. Your diagnostic thinking is strong."
      : "Not quite. Review the core principle and identify what the flawed proposal gets wrong. The correct action must directly address the root cause.",
    concept_identified: foundCorrectConcepts > 0,
    response_length: responseLower.length,
  });
}

function evaluatePhase3(responseLower: string, missingVariable: string, successCondition: string): NextResponse {
  // Phase 3 evaluation: Check if user asked the right question
  
  let success = false;
  let score = 0;
  let feedback = "";

  if (missingVariable === "unemployment_rate") {
    // Check if user asked about employment/unemployment
    const employmentKeywords = ["unemployment", "employ", "jobs", "job market", "labor", "working", "worker"];
    const foundKeyword = employmentKeywords.some(kw => responseLower.includes(kw));
    
    if (foundKeyword) {
      success = true;
      score = 100;
      feedback = "CRITICAL DATA RECEIVED: Unemployment is currently at 3%. GDP growth is stable at 2.1%. With low unemployment and stable growth, the economy can withstand rate hikes. You can proceed with aggressive monetary tightening.";
    } else {
      score = 20;
      feedback = "That's not the critical variable you need. Think about what happens to people and jobs when you dramatically raise interest rates while inflation is high. What data would tell you whether the economy can handle this shock?";
    }
  } else if (missingVariable === "remaining_capacity") {
    // Check if user asked about capacity/load
    const capacityKeywords = ["capacity", "load", "limit", "headroom", "handle", "node health", "remaining"];
    const foundKeyword = capacityKeywords.some(kw => responseLower.includes(kw));
    
    if (foundKeyword) {
      success = true;
      score = 100;
      feedback = "CRITICAL DATA RECEIVED: Remaining nodes have 40% combined capacity headroom. However, one additional node is trending toward failure. Recommendation: fail over slowly with priority load-shedding. Full aggressive failover would exceed capacity and cause cascade.";
    } else {
      score = 20;
      feedback = "That's not the critical variable. Think about what happens to the remaining infrastructure when you suddenly redirect all traffic. What would happen if you don't know whether they can handle it?";
    }
  }

  return NextResponse.json({
    phase: "phase-3",
    success,
    score: Math.round(score),
    feedback,
    missing_variable_identified: success,
    question_length: responseLower.length,
  });
}

function evaluatePhase1(isCorrect: boolean): any {
  return {
    phase: 1,
    feedback: isCorrect
      ? "Correct! You applied the core principle under pressure. Excellent rapid recognition."
      : "Incorrect. Review the core principle and think through each option more carefully.",
    score: isCorrect ? 100 : 0
  };
}

/**
 * SM-2 Algorithm for calculating next review interval
 * Based on the Leitner system and SuperMemo-2
 *
 * If correct:
 *   - Multiply interval by ease_multiplier
 *   - Increase ease_multiplier by 0.1
 *
 * If incorrect:
 *   - Reset interval to 1
 *   - Decrease ease_multiplier by 0.2
 *   - Minimum ease is 1.3
 */
function calculateNextReview(
  isCorrect: boolean,
  currentInterval: number,
  currentEase: number
): { nextInterval: number; nextEase: number } {
  const intervals = [1, 3, 7, 14, 30, 90];

  if (isCorrect) {
    // Find next interval based on multiplier
    const nextIntervalValue = Math.ceil(currentInterval * currentEase);

    // Find closest interval in our progression, or use calculated value if larger
    const nextInterval =
      nextIntervalValue > 90
        ? nextIntervalValue
        : intervals.find((i) => i >= nextIntervalValue) || 90;

    // Increase ease multiplier (but cap at reasonable maximum)
    const nextEase = Math.min(currentEase + 0.1, 2.5);

    return {
      nextInterval,
      nextEase,
    };
  } else {
    // Reset to beginning and reduce ease
    const nextEase = Math.max(1.3, currentEase - 0.2);

    return {
      nextInterval: 1, // Back to day 1 on failure
      nextEase,
    };
  }
}

/**
 * Update user_progress in Supabase with spaced repetition data
 */
async function updateUserProgress(
  userId: string,
  conceptId: string,
  data: {
    success: boolean;
    nextInterval: number;
    nextEase: number;
    phase: number;
    userResponse: string;
  }
): Promise<void> {
  const supabase = createServerSupabaseClient();
  const now = new Date();
  const nextDueDate = new Date(now.getTime() + data.nextInterval * 24 * 60 * 60 * 1000);

  // Get current progress record
  const { data: existingProgress, error: fetchError } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("concept_id", conceptId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 = row not found, which is fine — all other errors are real
    console.error("Error fetching progress:", fetchError);
  }

  const updatePayload = {
    last_reviewed_timestamp: now.toISOString(),
    current_interval: data.nextInterval,
    ease_multiplier: data.nextEase,
    next_due_timestamp: nextDueDate.toISOString(),
    attempt_count: (existingProgress?.attempt_count || 0) + 1,
    success_count: (existingProgress?.success_count || 0) + (data.success ? 1 : 0),
    last_phase: data.phase,
    last_response: data.userResponse,
    updated_at: now.toISOString(),
  };

  if (existingProgress) {
    const { error: updateError } = await supabase
      .from("user_progress")
      .update(updatePayload)
      .eq("user_id", userId)
      .eq("concept_id", conceptId);
    if (updateError) console.error("Error updating progress:", updateError);
  } else {
    const { error: insertError } = await supabase.from("user_progress").insert([
      {
        user_id: userId,
        concept_id: conceptId,
        ...updatePayload,
      },
    ]);
    if (insertError) console.error("Error inserting progress:", insertError);
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Flashpoint Evaluation Endpoint",
    description: "POST with { phase, userResponse, evaluationRubric, missingVariable, successCondition }"
  });
}
