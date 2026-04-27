import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

function parseJson(raw: string) {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

// Phase 2: Proposal Override - Identify & Correct Flawed Logic
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { concept, corePrinciple } = body;

    if (!concept || !corePrinciple) {
      return NextResponse.json(
        { error: "Missing concept or corePrinciple" },
        { status: 400 }
      );
    }

    const prompt = `You are the scenario generator for an advanced crisis training simulator. Generate a flawed proposal scenario where the user must identify the flaw and provide the correct direction.

CONSTRAINTS:
- Tone must be urgent and realistic; the proposer is a senior figure attempting to resolve a crisis.
- NO fantasy elements, magic, or supernatural tropes. Keep it grounded in real-world professional, technical, or tactical reality.
- The flaw should be subtle but critical — violating the Core Principle in a way that sounds plausible.

INPUT:
- Target Concept: ${concept}
- Core Principle: ${corePrinciple}

TASK:
1. Generate a "CRISIS ALERT" (2-3 sentences) establishing an urgent context.
2. Generate a flawed proposal (2-3 sentences) from a senior stakeholder that subtly violates the Core Principle. It should sound reasonable but is wrong.
3. Specify the speaker's role (e.g. "Chief Operations Officer").
4. Provide an evaluation rubric explaining the flaw, correct direction, and why it matters.

Return ONLY valid JSON:
{
  "crisis_text": "string",
  "flawed_proposal": {
    "speaker": "string",
    "quote": "string"
  },
  "ui_prompt": "string (instruction for user on what to provide)",
  "evaluation_rubric": {
    "flaw_explanation": "string",
    "correct_direction": "string",
    "why_it_matters": "string"
  }
}`;

    try {
      const raw = await callGemini(prompt, { temperature: 0.6, maxOutputTokens: 800, jsonMode: true });
      const scenarioData = parseJson(raw);

      return NextResponse.json({
        phase: 2,
        crisis_text: scenarioData.crisis_text,
        flawed_proposal: scenarioData.flawed_proposal,
        ui_prompt: scenarioData.ui_prompt || "Identify the flaw in this proposal and explain the correct direction",
        evaluation_rubric: scenarioData.evaluation_rubric,
        _metadata: { concept, corePrinciple },
      });
    } catch {
      return generateFallbackPhase2(concept, corePrinciple);
    }
  } catch (error) {
    console.error("Phase 2 generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate phase 2 scenario" },
      { status: 500 }
    );
  }
}

function generateFallbackPhase2(concept: string, corePrinciple: string) {
  return NextResponse.json({
    phase: 2,
    crisis_text: `CRISIS ALERT: A critical situation requires immediate strategic decision-making. A senior stakeholder has proposed an action plan. Your task is to evaluate and correct it based on ${concept}.`,
    flawed_proposal: {
      speaker: "Operations Director",
      quote: `I recommend we proceed by bypassing the standard protocol. It's faster and more efficient. While it doesn't strictly follow ${corePrinciple}, I believe the speed advantage justifies this approach.`,
    },
    ui_prompt: "Identify the critical flaw in this proposal and explain what the correct direction should be",
    evaluation_rubric: {
      flaw_explanation: `The proposal violates ${corePrinciple} by prioritising speed over core principles, which could lead to systemic failure.`,
      correct_direction: `Apply ${corePrinciple} fully, even if it takes longer. This ensures long-term stability and prevents cascading failures.`,
      why_it_matters: `Violations of core principles create technical debt and future risk. Adhering to ${corePrinciple} ensures the solution is robust.`,
    },
    _metadata: { concept, corePrinciple },
  });
}
