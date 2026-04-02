import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/flashpoint/evaluate-response
 * 
 * Evaluates Phase 2 (text input) and Phase 3 (blindspot question) responses.
 * Uses keyword matching and semantic analysis to validate answers.
 * In production, would use LLM-based evaluation.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phase, userResponse, evaluationRubric, missingVariable, successCondition } = body;

    if (!phase || !userResponse) {
      return NextResponse.json(
        { error: "Missing phase or userResponse" },
        { status: 400 }
      );
    }

    const responseLower = userResponse.toLowerCase();

    if (phase === "phase-2") {
      return evaluatePhase2(responseLower, evaluationRubric);
    } else if (phase === "phase-3") {
      return evaluatePhase3(responseLower, missingVariable, successCondition);
    } else {
      return NextResponse.json(
        { error: "Invalid phase" },
        { status: 400 }
      );
    }
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

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Flashpoint Evaluation Endpoint",
    description: "POST with { phase, userResponse, evaluationRubric, missingVariable, successCondition }"
  });
}
