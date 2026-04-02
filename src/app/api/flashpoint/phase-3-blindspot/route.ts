import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/flashpoint/phase-3-blindspot
 * 
 * Phase 3: Deep Mastery (Days 30 & 90)
 * Goal: The Blindspot. User must recognize missing critical variable.
 * 
 * Presents a crisis where user must realize they lack crucial data.
 * They must ask exactly ONE question to get the missing variable.
 * This tests judgment under pressure and mastery of the concept.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conceptId, corePrinciple, targetConcept } = body;

    if (!corePrinciple || !targetConcept) {
      return NextResponse.json(
        { error: "Missing corePrinciple or targetConcept" },
        { status: 400 }
      );
    }

    // Mock blindspot scenarios
    const scenarios: Record<string, any> = {
      "inflation-management": {
        crisis_text: "Inflation is surging at 9% year-over-year. The standard playbook is to authorize the central bank to aggressively hike interest rates today to crush the inflation spiral. However, making this move blindly right now might trigger an immediate, devastating economic depression. You are missing a critical macroeconomic variable to make this decision safely.",
        ui_prompt: "You are missing a critical macroeconomic variable. Ask exactly ONE question to your advisors to get the data you need to act safely:",
        missing_variable: "unemployment_rate",
        evaluation_rubric: "The user must ask about unemployment rate or employment/jobs/labor market. The concept is stagflation: high inflation with high unemployment. If unemployment is already high, rate hikes will destroy more jobs.",
        success_condition: "User asks about unemployment, employment, jobs, or labor market conditions.",
        system_answer: "Unemployment is currently at 3%. GDP growth is stable at 2.1%. With low unemployment and stable growth, the economy can withstand rate hikes. You can proceed with monetary tightening."
      },
      "system-stability": {
        crisis_text: "Your distributed system is experiencing cascading latency across multiple nodes. One node has already failed. The standard response is to immediately trigger failover protocols and redistribute all traffic to remaining nodes. However, this blanket approach might cause total system collapse if executed without critical information.",
        ui_prompt: "You are missing a critical infrastructure variable. Ask exactly ONE question to get the data you need before implementing failover:",
        missing_variable: "remaining_capacity",
        evaluation_rubric: "The user must ask about remaining capacity, load balancing capacity, or whether other nodes can handle the redistributed traffic. The trap: if you don't know remaining capacity, failover could overload other nodes.",
        success_condition: "User asks about capacity, load limits, or node health across remaining infrastructure.",
        system_answer: "Remaining nodes have 40% combined capacity headroom. However, one additional node is trending toward failure. Recommend: fail over slowly with priority load-shedding. Full aggressive failover would exceed capacity and cause cascade."
      }
    };

    const scenario = scenarios[conceptId] || scenarios["inflation-management"];

    return NextResponse.json({
      success: true,
      phase: "phase-3",
      difficulty: "blindspot",
      concept_id: conceptId,
      target_concept: targetConcept,
      core_principle: corePrinciple,
      crisis_alert: scenario.crisis_text,
      ui_prompt: scenario.ui_prompt,
      // These are only sent to backend for evaluation
      _metadata: {
        missing_variable: scenario.missing_variable,
        evaluation_rubric: scenario.evaluation_rubric,
        success_condition: scenario.success_condition,
        system_answer: scenario.system_answer
      }
    });
  } catch (error) {
    console.error("Error generating Phase 3 blindspot:", error);
    return NextResponse.json(
      { error: "Failed to generate blindspot scenario" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Phase 3 Blindspot Endpoint",
    description: "POST with { conceptId, corePrinciple, targetConcept }"
  });
}
