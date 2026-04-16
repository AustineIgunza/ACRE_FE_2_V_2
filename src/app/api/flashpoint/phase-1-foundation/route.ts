import { NextRequest, NextResponse } from "next/server";

// Phase 1: Multiple Choice - Rapid Recognition
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conceptId, concept, corePrinciple } = body;

    if (!concept || !corePrinciple) {
      return NextResponse.json(
        { error: "Missing concept or corePrinciple" },
        { status: 400 }
      );
    }

    // Generate crisis scenario using Claude API
    const crisisResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are the scenario generator for a high-stakes training simulator. Your task is to generate a rapid-fire crisis scenario based on a specific educational concept.

CONSTRAINTS:
- The tone must be urgent, realistic, and highly pressurized.
- ABSOLUTELY NO fantasy elements, "boss battles", magic, or "godly/supernatural" tropes. Keep it grounded in real-world professional, technical, or tactical reality.
- Output strictly in JSON format.
- Do NOT include markdown formatting like \`\`\`json.

INPUT:
- Target Concept: ${concept}
- Core Principle: ${corePrinciple}

TASK:
1. Generate a 2-sentence "CRISIS ALERT" where the user must apply the Target Concept immediately to avert disaster.
2. Generate 3 action choices.
   - Option A: Plausible but incorrect action that worsens the crisis.
   - Option B: The exact correct action based on the Core Principle.
   - Option C: Plausible but incorrect action based on a common misconception.
3. Randomize the position of the correct answer (could be A, B, or C).

JSON OUTPUT SCHEMA:
{
  "crisis_text": "string",
  "options": [
    {"id": "A", "text": "string", "is_correct": boolean},
    {"id": "B", "text": "string", "is_correct": boolean},
    {"id": "C", "text": "string", "is_correct": boolean}
  ]
}`,
          },
        ],
      }),
    });

    if (!crisisResponse.ok) {
      const error = await crisisResponse.text();
      console.error("Claude API error:", error);
      // Fallback to template-based generation
      return generateFallbackPhase1(concept, corePrinciple);
    }

    const crisisData = await crisisResponse.json();
    const generatedText =
      crisisData.content[0].type === "text" ? crisisData.content[0].text : "";

    // Parse JSON from response
    let scenarioData;
    try {
      scenarioData = JSON.parse(generatedText);
    } catch (e) {
      // Try to extract JSON if wrapped
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scenarioData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse scenario");
      }
    }

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
  } catch (error) {
    console.error("Phase 1 generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate phase 1 scenario" },
      { status: 500 }
    );
  }
}

function generateFallbackPhase1(concept: string, corePrinciple: string) {
  // Fallback template-based generation
  const correctOptions = [
    {
      id: "A",
      text: `Implement ${corePrinciple} to resolve the crisis`,
      is_correct: true,
    },
    {
      id: "B",
      text: `Violate ${corePrinciple} by taking the opposite action`,
      is_correct: false,
    },
    {
      id: "C",
      text: `Ignore ${corePrinciple} and take a middle-ground approach`,
      is_correct: false,
    },
  ];

  // Shuffle
  const shuffled = correctOptions.sort(() => Math.random() - 0.5);

  return NextResponse.json({
    phase: 1,
    crisis_text: `CRISIS ALERT: A critical situation demands immediate application of ${concept}. The standard playbook requires you to act decisively based on ${corePrinciple}. Choosing incorrectly will escalate the crisis significantly.`,
    options: shuffled,
    _metadata: {
      concept,
      corePrinciple,
      evaluation_rubric: "User must select the option where is_correct === true",
    },
  });
}
