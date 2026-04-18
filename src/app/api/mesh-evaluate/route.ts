import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

function parseJson(raw: string) {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, nodes, userSynthesis, collapseQuestion, userCollapseResponse } = body as {
      mode: "synthesis" | "collapse";
      nodes: Array<{ nodeId: string; formalMechanism: string; soWhat: string }>;
      userSynthesis?: string;
      collapseQuestion?: string;
      userCollapseResponse?: string;
    };

    const nodeList = nodes
      .map((n) => `- ${n.nodeId}: ${n.formalMechanism}`)
      .join("\n");

    if (mode === "synthesis") {
      const prompt = `You are ARCÉ's Systems Evaluator. The student has completed a full learning session and is now synthesizing across ${nodes.length} nodes.

NODES MASTERED:
${nodeList}

STUDENT'S SYNTHESIS: "${userSynthesis}"

EVALUATION CRITERIA:
- 75-100: Correctly identifies a real dependency relationship between at least 2 nodes, traces a causal chain, and identifies a plausible system-level consequence. Shows genuine synthesis.
- 45-74: Identifies the right nodes but the dependency chain is incomplete, imprecise, or missing a key causal step.
- 0-44: Superficial, vague, or incorrect connection with no meaningful causal chain.

Also generate a compelling "system collapse" question by picking the node whose removal would create the most interesting cascade across the other nodes.

Return ONLY valid JSON:
{
  "score": 80,
  "feedback": "2-3 sentences evaluating their synthesis — what they got right and what was missing",
  "collapseQuestion": "If the [specific node title] mechanism failed entirely — meaning [brief description of what would stop working] — trace the ripple effects through at least two other nodes you've mastered. What breaks first? What stabilizes? What is the new equilibrium?",
  "collapsedNodeId": "the-node-id"
}`;

      const raw = await callGemini(prompt, { temperature: 0.4, maxOutputTokens: 600, jsonMode: true });
      const result = parseJson(raw);
      const score = Math.max(0, Math.min(100, Number(result.score) || 0));

      return NextResponse.json({
        score,
        feedback: result.feedback || "Synthesis evaluated.",
        collapseQuestion: result.collapseQuestion || `If one core node in this system were removed, which would cause the most damage? Trace the cascade through the remaining nodes.`,
        collapsedNodeId: result.collapsedNodeId || nodes[0]?.nodeId,
      });
    }

    // Collapse mode
    const prompt = `You are ARCÉ's Systems Evaluator. The student answered a system collapse scenario.

COLLAPSE SCENARIO: "${collapseQuestion}"
STUDENT RESPONSE: "${userCollapseResponse}"

ALL NODES:
${nodeList}

EVALUATE WHETHER THEY:
1. Correctly identified what breaks in the collapsed node
2. Traced at least one second-order effect through another node
3. Identified a new equilibrium or stable state

SCORING:
- 75-100: Clear cascade traced through at least 2 nodes, identifies stabilization point
- 45-74: Partial cascade — one second-order effect identified but incomplete
- 0-44: Only surface-level effects described, no inter-node reasoning

Return ONLY valid JSON:
{
  "score": 72,
  "feedback": "2-3 sentences of specific evaluation on their cascade reasoning",
  "accuracy": "warning"
}`;

    const raw = await callGemini(prompt, { temperature: 0.35, maxOutputTokens: 400, jsonMode: true });
    const result = parseJson(raw);
    const score = Math.max(0, Math.min(100, Number(result.score) || 0));
    const accuracy = score >= 75 ? "ignition" : score >= 45 ? "warning" : "frost";

    return NextResponse.json({
      score,
      feedback: result.feedback || "Collapse analysis evaluated.",
      accuracy,
    });
  } catch (error) {
    console.error("Mesh evaluate error:", error);
    return NextResponse.json(
      { error: "Evaluation failed", score: 50, feedback: "Unable to evaluate. Please try again.", accuracy: "warning" },
      { status: 500 }
    );
  }
}
