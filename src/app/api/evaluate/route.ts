import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

function parseJson(raw: string) {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

function isGibberish(text: string): boolean {
  if (!text || text.length < 5) return true;
  const vowels = (text.match(/[aeiouAEIOU]/g) || []).length;
  const consonants = (text.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g) || []).length;
  const total = vowels + consonants;
  if (total === 0) return true;
  const vowelRatio = vowels / total;
  if (vowelRatio < 0.2 || vowelRatio > 0.6) return true;
  let repeatCount = 0;
  for (let i = 0; i < text.length - 1; i++) {
    if (text[i] === text[i + 1]) repeatCount++;
  }
  if (repeatCount > text.length * 0.4) return true;
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return true;
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  if (avgWordLength < 2.5) return true;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nodeId, prediction, question, isMultipleChoice, correctAnswer, formalMechanism, soWhat } = body;

    console.log("Evaluating:", { nodeId, isMultipleChoice });

    // Multiple choice — simple exact match
    if (isMultipleChoice) {
      const isCorrect = prediction === correctAnswer;
      return NextResponse.json({
        accuracy: isCorrect ? "ignition" : "frost",
        feedback: isCorrect
          ? "🔥 Correct! You've demonstrated your understanding of this concept."
          : "❄️ That's not quite right. Review the concept and try again.",
        score: isCorrect ? 100 : 30,
        thermalState: isCorrect ? "ignition" : "frost",
        details: { isCorrect, selectedAnswer: prediction, correctAnswer },
      });
    }

    // Gibberish gate
    if (isGibberish(prediction)) {
      return NextResponse.json({
        accuracy: "frost",
        feedback: "That doesn't look like a coherent attempt. Please provide a thoughtful explanation.",
        score: 0,
        thermalState: "frost",
        details: {},
      });
    }

    // AI-based evaluation via Gemini
    const prompt = `You are ARCÉ's answer evaluator. Score the student's response to a domino/stress-test question.

QUESTION: "${(question || "").slice(0, 500)}"
CORE MECHANISM: "${(formalMechanism || "").slice(0, 400)}"
LEVERAGE INSIGHT: "${(soWhat || "").slice(0, 200)}"

STUDENT ANSWER: "${prediction.slice(0, 1500)}"

SCORING GUIDE:
- 75–100 (ignition): Correctly identifies the invariant AND traces the causal chain with precision. The student clearly understands the mechanism.
- 45–74 (warning): Partial understanding — mechanism is present but causal chain is incomplete, imprecise, or missing a key step. Shows genuine engagement.
- 0–44 (frost): Misses the core invariant, shows surface-level or incorrect reasoning, or the answer is too vague/short to evaluate.

IMPORTANT: Be generous with credit. If the student's answer demonstrates understanding of the concept — even if worded differently or informally — score it accordingly. A correct answer in different words is still correct.

Return ONLY valid JSON:
{
  "score": 72,
  "accuracy": "warning",
  "thermalState": "warning",
  "feedback": "Specific 1-2 sentence feedback explaining what was correct and what was missing.",
  "missedConcept": "the specific part they got wrong, or null if ignition"
}`.trim();

    try {
      const raw = await callGemini(prompt, { temperature: 0.3, maxOutputTokens: 400, jsonMode: true });
      const result = parseJson(raw);

      const score = Math.max(0, Math.min(100, Number(result.score) || 0));
      const accuracy: "ignition" | "warning" | "frost" =
        score >= 75 ? "ignition" : score >= 45 ? "warning" : "frost";

      return NextResponse.json({
        accuracy,
        feedback: result.feedback || "Response evaluated.",
        score,
        thermalState: accuracy,
        details: { missedConcept: result.missedConcept || null },
      });
    } catch (aiError) {
      console.warn("Gemini evaluation failed, using fallback scoring:", aiError);

      // Fallback: length + causal phrase heuristic
      const causalPhrases = ["causes", "leads to", "results in", "triggers", "therefore", "because", "consequence", "cascade", "chain"];
      const lower = prediction.toLowerCase();
      const causalHits = causalPhrases.filter((p) => lower.includes(p)).length;
      const wordCount = prediction.split(/\s+/).length;
      const score = Math.min(100, (causalHits * 12) + Math.min(40, wordCount * 1.5));
      const accuracy: "ignition" | "warning" | "frost" = score >= 75 ? "ignition" : score >= 45 ? "warning" : "frost";

      return NextResponse.json({
        accuracy,
        feedback: accuracy === "ignition"
          ? "🔥 Strong causal reasoning — your chain is clear."
          : accuracy === "warning"
          ? "⚠️ Good attempt — strengthen the causal chain further."
          : "❄️ Try to trace how one event leads to the next, step by step.",
        score: Math.round(score),
        thermalState: accuracy,
        details: {},
      });
    }
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json({
      error: "Invalid request",
      accuracy: "frost",
      feedback: "Unable to evaluate response",
      score: 0,
      thermalState: "frost",
    }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Evaluate endpoint" });
}
