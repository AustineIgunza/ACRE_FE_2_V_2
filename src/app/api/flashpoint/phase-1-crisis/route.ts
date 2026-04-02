import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/flashpoint/phase-1-crisis
 * 
 * Phase 1: Foundation (Days 1 & 3)
 * Goal: Rapid recognition. Multiple choice crisis scenarios.
 * 
 * Generates a high-pressure multiple choice scenario based on a concept.
 * The user must instantly identify the correct first-principles action.
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

    // In production, this would call an LLM to generate scenarios
    // For now, we'll return mock scenarios based on the concept
    const scenarios: Record<string, any> = {
      "inflation-management": {
        crisis_text: "Monthly inflation just crossed 12%. The national fiat currency is rapidly losing purchasing power, and citizens are panic-buying tangible goods. A wage-price spiral is imminent. Immediate Action Required.",
        options: [
          {
            id: "A",
            text: "Slash the benchmark interest rate to 0% to encourage business investment.",
            is_correct: false,
            reasoning: "Lowering rates increases money supply, worsening inflation."
          },
          {
            id: "B",
            text: "Aggressively hike the benchmark interest rate to restrict the money supply.",
            is_correct: true,
            reasoning: "Higher rates reduce money supply and cool demand, directly addressing inflation."
          },
          {
            id: "C",
            text: "Initiate quantitative easing and distribute emergency stimulus to citizens.",
            is_correct: false,
            reasoning: "Stimulus increases money supply and demand, accelerating inflation."
          }
        ]
      },
      "system-stability": {
        crisis_text: "A critical infrastructure system is showing signs of cascading failure. Multiple redundancy systems have already failed. The backup power grid is at 15% capacity. What action must you take immediately?",
        options: [
          {
            id: "A",
            text: "Gradually scale down non-essential services over 48 hours to conserve power.",
            is_correct: false,
            reasoning: "Gradual approach allows cascade to worsen. Need immediate action."
          },
          {
            id: "B",
            text: "Immediately isolate failing components and shed non-critical loads to prevent total collapse.",
            is_correct: true,
            reasoning: "Isolating failures and load-shedding prevents systemic cascade."
          },
          {
            id: "C",
            text: "Route all remaining power to the main grid hub to centralize control.",
            is_correct: false,
            reasoning: "Centralization creates single point of failure for remaining capacity."
          }
        ]
      }
    };

    const scenario = scenarios[conceptId] || scenarios["inflation-management"];

    // Randomize option order but track which is correct
    const shuffled = [...scenario.options].sort(() => Math.random() - 0.5);

    return NextResponse.json({
      success: true,
      phase: "phase-1",
      difficulty: "multiple-choice",
      concept_id: conceptId,
      target_concept: targetConcept,
      core_principle: corePrinciple,
      crisis_alert: scenario.crisis_text,
      options: shuffled.map((opt: any) => ({
        id: opt.id,
        text: opt.text,
        // Don't send is_correct to frontend
      })),
      // Store correct answer and reasoning server-side for validation
      _metadata: {
        correct_id: shuffled.find((o: any) => o.is_correct)?.id,
        options_reasoning: shuffled
      }
    });
  } catch (error) {
    console.error("Error generating Phase 1 crisis:", error);
    return NextResponse.json(
      { error: "Failed to generate crisis scenario" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: "Phase 1 Crisis Endpoint",
    description: "POST with { conceptId, corePrinciple, targetConcept }"
  });
}
