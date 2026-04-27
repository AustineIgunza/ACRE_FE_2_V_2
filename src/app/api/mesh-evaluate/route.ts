import { NextRequest, NextResponse } from "next/server";

function parseJson(raw: string) {
  // Try to extract JSON from anywhere in the response
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find JSON object within the text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("No valid JSON found in response");
  }
}

async function callGeminiMesh(
  prompt: string,
  options: { temperature?: number; maxOutputTokens?: number }
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const { temperature = 0.4, maxOutputTokens = 800 } = options;

  const models = [
    { id: "gemini-2.5-flash", timeoutMs: 55000 },
    { id: "gemini-2.5-flash-lite", timeoutMs: 55000 },
  ];

  let lastError: Error | null = null;

  for (const { id: model, timeoutMs } of models) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature,
              maxOutputTokens,
              responseMimeType: "application/json",
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timer);

      if (res.status === 503 || res.status === 429) {
        lastError = new Error(`${model} returned ${res.status}`);
        continue;
      }

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini error ${res.status}: ${err}`);
      }

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        lastError = new Error(`${model} timed out`);
        continue;
      }
      lastError = err;
      continue;
    }
  }

  throw lastError ?? new Error("All Gemini models failed");
}

function keywordFallbackScore(text: string, nodes: Array<{ nodeId: string; formalMechanism: string }>): number {
  if (!text || text.trim().length < 20) return 15;
  const lower = text.toLowerCase();
  let score = 25;
  // Check for node references
  const nodeMatches = nodes.filter(n =>
    lower.includes(n.nodeId.toLowerCase().replace(/-/g, " ")) ||
    n.formalMechanism.toLowerCase().split(" ").slice(0, 3).some(w => w.length > 4 && lower.includes(w))
  ).length;
  score += Math.min(nodeMatches * 12, 36);
  // Check for causal language
  const causalTerms = ["because", "therefore", "leads to", "causes", "results in", "consequently", "thus", "hence", "so that", "which means", "cascade", "ripple", "chain"];
  const causalHits = causalTerms.filter(t => lower.includes(t)).length;
  score += Math.min(causalHits * 6, 24);
  // Bonus for length/depth
  if (text.length > 200) score += 10;
  if (text.length > 400) score += 5;
  return Math.min(score, 78);
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

      let result: any;
      try {
        const raw = await callGeminiMesh(prompt, { temperature: 0.4, maxOutputTokens: 700 });
        result = parseJson(raw);
      } catch (aiErr) {
        console.error("Mesh synthesis AI failed, using keyword fallback:", aiErr);
        const fbScore = keywordFallbackScore(userSynthesis || "", nodes);
        result = {
          score: fbScore,
          feedback: fbScore >= 60
            ? "You've identified connections across the nodes. Consider deepening the causal chain — what's the second-order effect when these mechanisms interact under stress?"
            : fbScore >= 40
            ? "You've touched on some relevant nodes, but the synthesis needs a clearer causal chain. How does one node's failure directly trigger another?"
            : "A stronger synthesis traces a specific mechanism from one node to another and names the system-level outcome. Try again with a concrete 'if X then Y then Z' structure.",
          collapseQuestion: `If the ${nodes[0]?.nodeId?.replace(/-/g, " ")} mechanism failed entirely, trace the ripple effects through at least two other nodes you've mastered. What breaks first? What stabilizes? What is the new equilibrium?`,
          collapsedNodeId: nodes[0]?.nodeId,
        };
      }

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

    let result: any;
    try {
      const raw = await callGeminiMesh(prompt, { temperature: 0.35, maxOutputTokens: 500 });
      result = parseJson(raw);
    } catch (aiErr) {
      console.error("Mesh collapse AI failed, using keyword fallback:", aiErr);
      const fbScore = keywordFallbackScore(userCollapseResponse || "", nodes);
      result = {
        score: fbScore,
        feedback: fbScore >= 60
          ? "You've traced some effects through the system. For full marks, identify both what stabilizes and what permanently changes after the collapse."
          : fbScore >= 40
          ? "You've identified the immediate break, but the cascade reasoning needs to go deeper — trace at least one second-order effect through another node."
          : "A strong collapse analysis names specific mechanisms that fail, traces inter-node effects, and identifies a new stable state. Revisit the node relationships.",
        accuracy: fbScore >= 75 ? "ignition" : fbScore >= 45 ? "warning" : "frost",
      };
    }

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
