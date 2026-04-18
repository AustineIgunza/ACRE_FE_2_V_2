import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nodeId, userResponse, nodeContext } = body as {
      nodeId: string;
      userResponse: string;
      nodeContext: {
        formalMechanism: string;
        soWhat: string;
      };
    };

    const prompt = `You are ARCÉ's Relatability Engine. The student has just mastered a concept and is now connecting it to their personal knowledge.

CONCEPT: ${nodeId}
CORE MECHANISM: "${nodeContext.formalMechanism}"
LEVERAGE INSIGHT: "${nodeContext.soWhat}"

STUDENT'S BRIDGE: "${userResponse}"

YOUR TASK:
1. Validate whether their connection is meaningful (be generous — effort earns credit even if imprecise)
2. Extend the bridge with one additional cross-domain insight they may not have considered
3. Reinforce why the invariant holds across both domains

RULES:
- 2-4 sentences max
- Warm but intellectually stimulating
- End with one insight that deepens their connection
- Plain text only, no markdown or special characters

Respond now:`;

    const response = await callGemini(prompt, { temperature: 0.55, maxOutputTokens: 250 });
    const feedback = (response || "").trim();

    return NextResponse.json({
      feedback: feedback || "That's a sharp connection. The invariant travels across domains exactly as you described — when the underlying causal structure is the same, the rule holds.",
    });
  } catch (error) {
    console.error("Interleaving error:", error);
    return NextResponse.json({
      feedback: "Your connection shows real understanding. The mechanism you just learned operates in any system with the same causal structure — watch for it everywhere.",
    });
  }
}
