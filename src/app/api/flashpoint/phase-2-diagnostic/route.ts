import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/flashpoint/phase-2-diagnostic
 * 
 * Phase 2: Application (Days 7 & 14)
 * Goal: Diagnostic troubleshooting. User must articulate the "why" behind mechanics.
 * 
 * Presents a flawed proposal that contradicts the core principle.
 * User must identify the flaw and provide correct direction via text input.
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

    // Mock diagnostic scenarios
    const scenarios: Record<string, any> = {
      "inflation-management": {
        crisis_text: "Monthly inflation has reached 12%.",
        flawed_proposal: {
          speaker: "Minister of Finance",
          quote: "Citizens are struggling to afford groceries. We need to immediately distribute a round of nationwide stimulus checks so families can maintain their purchasing power."
        },
        ui_prompt: "Override the Minister. State the economic flaw in their logic and provide the correct policy direction:",
        evaluation_rubric: "The user must explain that stimulus checks increase money supply and demand, which accelerates inflation. The correct action is to hike interest rates to cool the economy.",
        success_feedback: "Correct! Stimulus increases demand, worsening inflation. We need monetary tightening (rate hikes), not expansion."
      },
      "system-stability": {
        crisis_text: "Our primary data center is experiencing thermal issues with cooling systems at 80% capacity.",
        flawed_proposal: {
          speaker: "Operations Lead",
          quote: "Let's immediately spin up all backup servers to increase redundancy and distribute the load evenly. This will improve resilience."
        },
        ui_prompt: "Override the Operations Lead. Identify the flaw in their approach:",
        evaluation_rubric: "User must recognize that spinning up more servers increases thermal load on already-compromised cooling, making cascading failure more likely. Must propose: identify and isolate failing components, shed non-critical loads, and fix cooling.",
        success_feedback: "Correct! More servers = more heat. We need to reduce load and fix the root cause (cooling), not add more load."
      }
    };

    const scenario = scenarios[conceptId] || scenarios["inflation-management"];

    return NextResponse.json({
      success: true,
      phase: "phase-2",
      difficulty: "text-input",
      concept_id: conceptId,
      target_concept: targetConcept,
      core_principle: corePrinciple,
      crisis_alert: scenario.crisis_text,
      flawed_proposal: scenario.flawed_proposal,
      ui_prompt: scenario.ui_prompt,
      // Evaluation rubric sent to backend evaluator, not frontend
      _metadata: {
        evaluation_rubric: scenario.evaluation_rubric,
        success_feedback: scenario.success_feedback
      }
    });
  } catch (error) {
    console.error("Error generating Phase 2 diagnostic:", error);
    return NextResponse.json(
      { error: "Failed to generate diagnostic scenario" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Phase 2 Diagnostic Endpoint",
    description: "POST with { conceptId, corePrinciple, targetConcept }"
  });
}
