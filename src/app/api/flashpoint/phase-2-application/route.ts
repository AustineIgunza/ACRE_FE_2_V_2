import { NextRequest, NextResponse } from "next/server";

// Phase 2: Proposal Override - Identify & Correct Flawed Logic
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

    // Generate flawed proposal using Claude API
    const proposalResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: `You are the scenario generator for an advanced crisis training simulator. Your task is to generate a flawed proposal scenario where the user must identify the flaw and provide the correct direction.

CONSTRAINTS:
- The tone must be urgent and realistic; the proposer is a senior figure attempting to resolve a crisis.
- ABSOLUTELY NO fantasy elements, "boss battles", magic, or "godly/supernatural" tropes. Keep it grounded in real-world professional, technical, or tactical reality.
- The flaw should be subtle but critical—violating the Core Principle in a way that sounds plausible.
- Output strictly in JSON format.
- Do NOT include markdown formatting like \`\`\`json.

INPUT:
- Target Concept: ${concept}
- Core Principle: ${corePrinciple}

TASK:
1. Generate a "CRISIS ALERT" (2-3 sentences) establishing an urgent context.
2. Generate a flawed proposal (2-3 sentences) from a senior stakeholder that subtly violates the Core Principle. The proposal should sound reasonable at first but is actually flawed.
3. Specify what the speaker's role is (e.g., "Chief Operations Officer", "Lead Engineer", "Head of Security").
4. Provide an evaluation rubric that explains:
   - What the flaw is
   - What the correct direction should be
   - Why applying the Core Principle would work better

JSON OUTPUT SCHEMA:
{
  "crisis_text": "string",
  "flawed_proposal": {
    "speaker": "string (title/role)",
    "quote": "string (2-3 sentences)"
  },
  "ui_prompt": "string (instruction for user on what to provide)",
  "evaluation_rubric": {
    "flaw_explanation": "string",
    "correct_direction": "string",
    "why_it_matters": "string"
  }
}`,
          },
        ],
      }),
    });

    if (!proposalResponse.ok) {
      const error = await proposalResponse.text();
      console.error("Claude API error:", error);
      // Fallback to template-based generation
      return generateFallbackPhase2(concept, corePrinciple);
    }

    const proposalData = await proposalResponse.json();
    const generatedText =
      proposalData.content[0].type === "text" ? proposalData.content[0].text : "";

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
      phase: 2,
      crisis_text: scenarioData.crisis_text,
      flawed_proposal: scenarioData.flawed_proposal,
      ui_prompt:
        scenarioData.ui_prompt ||
        "Identify the flaw in this proposal and explain the correct direction",
      evaluation_rubric: scenarioData.evaluation_rubric,
      _metadata: {
        concept,
        corePrinciple,
      },
    });
  } catch (error) {
    console.error("Phase 2 generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate phase 2 scenario" },
      { status: 500 }
    );
  }
}

function generateFallbackPhase2(concept: string, corePrinciple: string) {
  // Fallback template-based generation
  return NextResponse.json({
    phase: 2,
    crisis_text: `CRISIS ALERT: A critical situation requires immediate strategic decision-making. A senior stakeholder has proposed an action plan. Your task is to evaluate and correct it based on ${concept}.`,
    flawed_proposal: {
      speaker: "Operations Director",
      quote: `I recommend we proceed by bypassing the standard protocol. It's faster and more efficient. While it doesn't strictly follow ${corePrinciple}, I believe the speed advantage justifies this approach.`,
    },
    ui_prompt: "Identify the critical flaw in this proposal and explain what the correct direction should be",
    evaluation_rubric: {
      flaw_explanation: `The proposal violates ${corePrinciple} by prioritizing speed over adherence to core principles, which could lead to systemic failure.`,
      correct_direction: `The correct approach is to apply ${corePrinciple} fully, even if it takes longer initially. This ensures long-term stability and prevents cascading failures.`,
      why_it_matters: `Violations of core principles create technical debt and future risks. Adhering to ${corePrinciple} ensures the solution is robust and maintainable.`,
    },
    _metadata: {
      concept,
      corePrinciple,
    },
  });
}
