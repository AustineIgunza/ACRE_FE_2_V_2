import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, nodeContext, history } = body as {
      nodeId: string;
      message: string;
      nodeContext: {
        crisisText: string;
        formalMechanism: string;
        soWhat: string;
        dominoQuestion: string;
      };
      history: Array<{ role: "user" | "ai"; content: string }>;
    };

    const historyText = (history || [])
      .slice(-6)
      .map((m) => `${m.role === "user" ? "Student" : "ARCÉ"}: ${m.content}`)
      .join("\n");

    const prompt = `You are ARCÉ's Socratic tutor. The student is about to be challenged on a concept and wants to clarify it first.

CRISIS SCENARIO (what they'll face):
"${nodeContext.crisisText}"

CORE MECHANISM (the critical 20% they must understand):
"${nodeContext.formalMechanism}"

LEVERAGE INSIGHT:
"${nodeContext.soWhat}"

UPCOMING CHALLENGE QUESTION:
"${nodeContext.dominoQuestion}"

${historyText ? `CONVERSATION SO FAR:\n${historyText}\n` : ""}
STUDENT QUESTION: "${message}"

RULES:
- Give a thorough, helpful response — aim for 3-6 sentences. Never truncate mid-thought.
- Guide understanding through Socratic questions when useful, but also give clear explanations
- You MAY explain the formal mechanism clearly — that's the point of this phase
- Do NOT give away the domino answer directly, but help them understand the underlying logic
- Tone: sharp, intellectually engaging, slightly challenging
- Plain text only, no markdown

Respond now:`;

    const response = await callGemini(prompt, { temperature: 0.5, maxOutputTokens: 900 });
    const text = (response || "").trim();

    return NextResponse.json({ response: text || "Interesting question. Let me ask you this — what do you think happens first in this chain?" });
  } catch (error) {
    console.error("Clarification chat error:", error);
    return NextResponse.json({
      response: "I'm having trouble responding right now. Try rephrasing your question.",
    });
  }
}
