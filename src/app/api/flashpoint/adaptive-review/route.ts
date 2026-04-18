import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseJson(raw: string): any {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

function consecutiveCorrect(previousRounds: any[], currentCorrect: boolean): number {
  if (!currentCorrect) return 0;
  let streak = 1;
  for (let i = previousRounds.length - 1; i >= 0; i--) {
    if (previousRounds[i].correct) streak++;
    else break;
  }
  return streak;
}

// ── Generate first question ───────────────────────────────────────────────────
async function generateFirstQuestion(nodeContent: any, phase: number) {
  const phaseLabel =
    phase === 1 ? "Foundation (days 1-3): test recognition and basic recall" :
    phase === 2 ? "Application (days 7-14): test causal reasoning and prediction" :
    "Mastery (days 30+): test synthesis, edge cases, and critical variables";

  const prompt = `You are ARCÉ's review question generator. Create the opening review question for a spaced-repetition session.

CONCEPT:
Title: ${nodeContent.title}
Core Mechanism: ${nodeContent.formalMechanism || "—"}
Crisis Context: ${nodeContent.crisisText || "—"}
Domino Question (do NOT copy this verbatim — use it for inspiration only): ${nodeContent.dominoQuestion || "—"}
Leverage Insight: ${nodeContent.soWhat || "—"}
Stress Test: ${nodeContent.stressTest || "—"}

PHASE: ${phaseLabel}

Rules:
- Generate a FRESH question that tests the same core invariant but from a different angle than the domino question
- Make it scenario-based and high-stakes
- Phase 1: prefer multiple choice (3 options, exactly one correct)
- Phase 2 & 3: free_text only
- Keep it under 3 sentences

Return ONLY valid JSON:
{
  "question": "<the question text>",
  "type": "<mc or free_text>",
  "options": [
    {"id": "A", "text": "<option text>", "is_correct": true},
    {"id": "B", "text": "<option text>", "is_correct": false},
    {"id": "C", "text": "<option text>", "is_correct": false}
  ]
}
Note: If type is "free_text", options must be an empty array [].`.trim();

  const raw = await callGemini(prompt, { temperature: 0.7, maxOutputTokens: 800, jsonMode: true });
  return parseJson(raw);
}

// ── Evaluate answer + generate next question ─────────────────────────────────
async function evaluateAndGenerateNext(params: {
  nodeContent: any;
  phase: number;
  roundNumber: number;
  currentQuestion: string;
  userAnswer: string;
  questionType: string;
  mcCorrect: boolean | null;
  previousRounds: any[];
  sessionShouldEnd: boolean;
}) {
  const { nodeContent, phase, roundNumber, currentQuestion, userAnswer, questionType, mcCorrect, previousRounds, sessionShouldEnd } = params;

  const phaseLabel =
    phase === 1 ? "Foundation – days 1–3 (recognition & recall)" :
    phase === 2 ? "Application – days 7–14 (causal reasoning)" :
    "Mastery – days 30+ (synthesis & edge cases)";

  const historyText = previousRounds.length === 0
    ? "None — this is round 1."
    : previousRounds.map((r: any, i: number) =>
        `Round ${i + 1}: Q="${r.question.slice(0, 100)}" | Answer="${r.userAnswer.slice(0, 120)}" | Score=${r.score}/100`
      ).join("\n");

  const evalSection = questionType === "mc"
    ? `QUESTION TYPE: Multiple choice. The student chose the ${mcCorrect ? "CORRECT" : "INCORRECT"} option.
Score this answer: ${mcCorrect ? "between 80-100" : "between 0-25"}.`
    : `QUESTION TYPE: Free text. Evaluate the student's answer against the core mechanism.
Scoring guide:
- 75 to 100: Correctly identifies the invariant AND traces the causal chain with precision
- 45 to 74: Partial — mechanism present but chain incomplete, imprecise, or missing key step
- 0 to 44: Misses the invariant or shows surface/wrong reasoning`;

  const nextSection = sessionShouldEnd
    ? `The session is complete. Set sessionComplete to true and nextQuestion to null.`
    : `Generate the next question. Adapt based on the score you assign:
- Score below 50: Rephrase the SAME invariant through a completely different scenario — expose the WHY, not just the what.
- Score 50-75: Push to application — ask them to predict a consequence or identify what breaks the chain.
- Score above 75: Stress test — challenge with the specific counter-variable from the stress test.
- NEVER use the same wording as the previous question.
- Always scenario-based, under 3 sentences.
- Phase ${phase} type: ${phase === 1 ? "mc (with 3 options) or free_text" : "free_text only"}`;

  const prompt = `You are ARCÉ's adaptive Socratic review AI. Evaluate the student's answer, then ${sessionShouldEnd ? "end the session" : "generate the next adaptive question"}.

CONCEPT NODE:
Title: ${nodeContent.title}
Core Mechanism: ${nodeContent.formalMechanism || "—"}
Crisis Context: ${nodeContent.crisisText || "—"}
Leverage Insight: ${nodeContent.soWhat || "—"}
Stress Test: ${nodeContent.stressTest || "—"}

PHASE: ${phaseLabel} | ROUND: ${roundNumber} of 3

HISTORY:
${historyText}

CURRENT QUESTION: "${currentQuestion}"
STUDENT ANSWER: "${String(userAnswer).slice(0, 1200)}"

${evalSection}

${nextSection}

Return ONLY valid JSON (no markdown).

If phase is 1 and the next question type is "mc", include 3 options like this example:
{
  "evaluation": {
    "score": 72,
    "correct": true,
    "feedback": "You identified the feedback loop but missed the threshold condition.",
    "missedConcept": "threshold condition"
  },
  "sessionComplete": false,
  "nextQuestion": {
    "question": "Which condition makes the feedback loop irreversible?",
    "type": "mc",
    "options": [
      {"id": "A", "text": "When X exceeds the critical threshold Z", "is_correct": true},
      {"id": "B", "text": "When Y drops below baseline", "is_correct": false},
      {"id": "C", "text": "When the feedback delay exceeds 24 hours", "is_correct": false}
    ],
    "targetAspect": "threshold condition"
  }
}

If phase is 2 or 3, or the question is free_text, use "options": [].
IMPORTANT: Replace ALL example values with your real assessment. If sessionComplete is true, set nextQuestion to null.`.trim();

  const raw = await callGemini(prompt, { temperature: 0.5, maxOutputTokens: 1200, jsonMode: true });
  const result = parseJson(raw);

  // Server-side enforcement
  if (sessionShouldEnd) {
    result.sessionComplete = true;
    result.nextQuestion = null;
  } else {
    // Session must continue — override any early termination
    result.sessionComplete = false;

    // If Gemini didn't produce a next question, generate a fallback
    if (!result.nextQuestion?.question) {
      const lastScore = result.evaluation?.score ?? 50;
      const fallback =
        lastScore < 50
          ? nodeContent.crisisText
            ? `The scenario: "${nodeContent.crisisText.slice(0, 120)}". Walk through the causal chain step by step — what triggers, what follows, and why.`
            : `Explain the core mechanism of "${nodeContent.title}" in your own words: what triggers, what follows?`
          : lastScore < 75
          ? nodeContent.soWhat
            ? `The key insight is: "${nodeContent.soWhat}". Apply it — give a real-world example where this mechanism plays out.`
            : `Give a concrete example that demonstrates the mechanism of "${nodeContent.title}".`
          : nodeContent.stressTest
          ? `Stress test: ${nodeContent.stressTest}`
          : `What single variable would reverse or break the chain described in "${nodeContent.title}"? Explain why.`;

      result.nextQuestion = {
        question: fallback,
        type: "free_text",
        options: [],
      };
    }
  }

  return result;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mode: "generate" → just produce the first question, no evaluation
    if (body.mode === "generate") {
      const { nodeContent, phase = 1 } = body;
      if (!nodeContent) return NextResponse.json({ error: "Missing nodeContent" }, { status: 400 });

      const question = await generateFirstQuestion(nodeContent, phase);
      return NextResponse.json({ question });
    }

    // Mode: "evaluate" (default) → evaluate + get next question
    const {
      nodeContent,
      phase = 1,
      roundNumber = 1,
      currentQuestion,
      userAnswer,
      questionType = "free_text",
      mcCorrect = null,
      previousRounds = [],
    } = body;

    if (!nodeContent || !currentQuestion || userAnswer === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const MAX_ROUNDS = 3;
    const streak = consecutiveCorrect(previousRounds, mcCorrect ?? false);
    const sessionShouldEnd = roundNumber >= MAX_ROUNDS || streak >= 2;

    const result = await evaluateAndGenerateNext({
      nodeContent, phase, roundNumber, currentQuestion,
      userAnswer, questionType, mcCorrect, previousRounds, sessionShouldEnd,
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("adaptive-review error:", error.message);
    return NextResponse.json({
      evaluation: {
        score: 50,
        correct: false,
        feedback: "Evaluation service temporarily unavailable. Your response was recorded.",
        missedConcept: "unknown",
      },
      sessionComplete: true,
      nextQuestion: null,
    });
  }
}
