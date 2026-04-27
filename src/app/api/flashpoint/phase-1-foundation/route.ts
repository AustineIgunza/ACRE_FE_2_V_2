import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

function parseJson(raw: string) {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

// Phase 1: Multiple Choice - Rapid Recognition
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

    const prompt = `You are the scenario generator for a high-stakes training simulator. Generate a rapid-fire crisis scenario based on a specific educational concept.

CONSTRAINTS:
- Tone must be urgent, realistic, and highly pressurized.
- NO fantasy elements, magic, or supernatural tropes. Keep it grounded in real-world professional, technical, or tactical reality.
- Randomize which option (A, B, or C) is correct.

INPUT:
- Target Concept: ${concept}
- Core Principle: ${corePrinciple}

TASK:
1. Generate a 2-sentence "CRISIS ALERT" where the user must apply the Target Concept immediately.
2. Generate 3 action choices:
   - One: The exact correct action based on the Core Principle (is_correct: true)
   - One: Plausible but incorrect — worsens the crisis
   - One: Plausible but incorrect — based on a common misconception
3. Randomize the position of the correct answer across A, B, C.

Return ONLY valid JSON:
{
  "crisis_text": "string",
  "options": [
    {"id": "A", "text": "string", "is_correct": boolean},
    {"id": "B", "text": "string", "is_correct": boolean},
    {"id": "C", "text": "string", "is_correct": boolean}
  ]
}`;

    try {
      const raw = await callGemini(prompt, { temperature: 0.6, maxOutputTokens: 600, jsonMode: true });
      const scenarioData = parseJson(raw);

      return NextResponse.json({
        phase: 1,
        crisis_text: scenarioData.crisis_text,
        options: scenarioData.options,
        _metadata: {
          concept,
          corePrinciple,
          evaluation_rubric: "User must select the option where is_correct === true",
        },
      });
    } catch {
      return generateFallbackPhase1(concept, corePrinciple);
    }
  } catch (error) {
    console.error("Phase 1 generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate phase 1 scenario" },
      { status: 500 }
    );
  }
}

function generateFallbackPhase1(concept: string, corePrinciple: string) {
  const options = [
    { id: "A", text: `Apply ${corePrinciple} immediately to resolve the crisis`, is_correct: true },
    { id: "B", text: `Bypass ${corePrinciple} to act faster`, is_correct: false },
    { id: "C", text: `Wait for more data before applying ${corePrinciple}`, is_correct: false },
  ].sort(() => Math.random() - 0.5)
   .map((o, i) => ({ ...o, id: ["A", "B", "C"][i] }));

  return NextResponse.json({
    phase: 1,
    crisis_text: `CRISIS ALERT: A critical situation demands immediate application of ${concept}. The standard playbook requires you to act decisively based on ${corePrinciple}. Choosing incorrectly will escalate the crisis significantly.`,
    options,
    _metadata: {
      concept,
      corePrinciple,
      evaluation_rubric: "User must select the option where is_correct === true",
    },
  });
}
