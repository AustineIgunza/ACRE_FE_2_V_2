import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { YoutubeTranscript } from "youtube-transcript";
import { callGemini as callGeminiBase } from "@/lib/gemini";

async function callGemini(prompt: string): Promise<string> {
  return callGeminiBase(prompt, { temperature: 0.4, maxOutputTokens: 8192, jsonMode: true });
}

// ── Gemini multimodal call (for PDF, images, audio, video) ───────────────────
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

async function callGeminiMultimodal(
  prompt: string,
  mimeType: string,
  base64Data: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  let lastError: Error | null = null;

  for (const model of MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Data } }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 8192, responseMimeType: "application/json" },
        }),
      }
    );
    if (res.status === 503 || res.status === 429) { lastError = new Error(`${model} ${res.status}`); continue; }
    if (!res.ok) { const err = await res.text(); throw new Error(`Gemini error ${res.status}: ${err}`); }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }

  throw lastError ?? new Error("All Gemini models failed");
}

// ── Title/Unit auto-detection prompt ─────────────────────────────────────────
function buildTitlePrompt(hint: string): string {
  return `Analyze the following content and determine the academic subject and specific topic being studied.
Return ONLY valid JSON with no extra text: {"unit_name": "broad subject area (e.g. Company Law, Human Biology, Macroeconomics, Computer Science)", "topic_name": "specific topic within that subject (e.g. Director Liability, Cell Division, Monetary Policy, Recursion)"}

Content: "${hint.slice(0, 1500)}"`;
}

async function detectUnitTopic(hint: string): Promise<{ unit_name: string; topic_name: string }> {
  try {
    const raw = await callGeminiBase(buildTitlePrompt(hint), { temperature: 0.3, maxOutputTokens: 120, jsonMode: true });
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const data = JSON.parse(cleaned);
    return { unit_name: data.unit_name || "", topic_name: data.topic_name || "" };
  } catch {
    return { unit_name: "", topic_name: "" };
  }
}

// ── Dynamic node count (target: 7±2 per spec) ────────────────────────────────
function calcNodeCount(length: number): number {
  if (length < 300)   return 3;
  if (length < 700)   return 4;
  if (length < 1400)  return 5;
  if (length < 2500)  return 6;
  if (length < 4000)  return 7;
  if (length < 7000)  return 8;
  if (length < 11000) return 10;
  return 12;
}

// ── Arcé Master Prompt ────────────────────────────────────────────────────────
function buildPrompt(text: string, nodeCount: number): string {
  return `
ACT AS: Arcé Lead Learning Designer & Triage Lead.

CORE MISSION:
Deconstruct the provided material into ${nodeCount} "Closed-Loop Mastery Nodes."
Distinguish between "Rote Ammunition" (facts/terms) and "The Weapon" (causal logic/invariants).
Every node must be derived DIRECTLY from the source material — not from general knowledge.

SOURCE MATERIAL:
"""
${text.slice(0, 15000)}
"""

OUTPUT RULES:
- Return ONLY a valid JSON array of exactly ${nodeCount} nodes. No markdown, no commentary.
- Each node must be grounded in the actual content above.
- The domino_question must be open-ended (never multiple choice).
- The multiple_choice_options must have exactly one correct answer. IMPORTANT: Rotate which option (A, B, or C) is correct — do NOT always put the correct answer in position A. Distribute correct answers across A, B, and C.
- ALL three options must sound equally plausible to someone who partially understands. Wrong options must contain partial truths, correct-sounding reasoning, or common expert-level misconceptions — NOT obviously wrong answers.
- Tone: high-stakes, professional, slightly witty.
- NO SPOILERS: crisis_scenario and domino_question must create the itch, not reveal the answer.
- CRITICAL: crisis_scenario must be MAX 45 WORDS — it is a 15-second hook, not a paragraph. Short. Punchy. Ends with one question.

JSON SCHEMA (return this exact structure):
[
  {
    "id": "kebab-case-slug-from-title",
    "title": "Short concept title from the material (3-6 words)",
    "crisis_scenario": "Phase 0.25 PARADOX GATE — ONE punchy sentence of context (≤25 words) + one sharp question (≤20 words). TOTAL MAX 45 WORDS. Makes user's intuition fail. Ends with a question. NO long setup.",
    "domino_question": "Phase 1.0 CHALLENGE — An open-ended predictive question. Format: 'You are [role]. [crisis]. Walk me through the Domino Effect — [specific chain to trace]. What happens first?' NEVER provide options.",
    "formal_mechanism": "Phase 2.0 INTEL CARD — The core invariant as a compressed cause-effect statement. Strip all entropy. 1-2 sentences max.",
    "latex_formula": "Symbolic formula using LaTeX: e.g. '\\\\uparrow X \\\\implies \\\\downarrow Y \\\\implies \\\\uparrow Z'",
    "so_what": "The 'cheat code' leverage insight — why mastering this node is a real-world superpower. 1 sentence.",
    "stress_test": "Phase 4.0 STRESS TEST — A specific counter-variable challenge for THIS node's invariant. NOT 'what if assumptions change?' — instead name the exact variable that breaks or inverts the rule. Format: '[Specific edge case from the material]. Your Intel Card says [invariant]. But [specific counter-condition]. Does your logic hold — or does the chain break?' 2-3 sentences max. Adaptive to this node only.",
    "multiple_choice_question": "Phase Signal Check — A recognition question testing the core invariant. Direct, specific to this node.",
    "multiple_choice_options": [
      { "id": "A", "text": "One of the three options — rotate which is correct across different nodes", "is_correct": false },
      { "id": "B", "text": "One of the three options — rotate which is correct across different nodes", "is_correct": true },
      { "id": "C", "text": "One of the three options — rotate which is correct across different nodes", "is_correct": false }
    ]
  }
]

EXAMPLE (Company Law source material):
[
  {
    "id": "corporate-veil-doctrine",
    "title": "The Corporate Veil Doctrine",
    "crisis_scenario": "A CEO is sued personally for company debts. His lawyer says the corporate veil protects him — but the CEO has been paying his mortgage from the company account. Does the veil hold?",
    "domino_question": "You are the plaintiff's attorney. The CEO has been using the company bank account to pay his mortgage and school fees for two years. Walk me through the Domino Effect — what legal doctrine is triggered, what evidence do you need, and what happens to the CEO's personal assets?",
    "formal_mechanism": "A company is a separate legal person from its owners. However, when the separation is used as a mask for fraud or abuse, courts will 'pierce the veil' and hold owners personally liable.",
    "latex_formula": "\\\\text{Fraud/Abuse} \\\\implies \\\\text{Veil Pierced} \\\\implies \\\\text{Personal Liability}",
    "so_what": "The corporate veil is a shield, not a cloak — the moment you use it to hide wrongdoing, it becomes a window.",
    "stress_test": "Your Intel Card says fraud pierces the veil — but what about negligence? A CEO runs the company into £2M of debt through bad decisions, not fraud. Does your invariant still apply, or does the chain break when intent is absent?",
    "multiple_choice_question": "A director mixes personal and company funds for 3 years. A creditor sues. Which outcome is most likely?",
    "multiple_choice_options": [
      { "id": "A", "text": "The director is personally liable — commingling funds pierces the corporate veil", "is_correct": true },
      { "id": "B", "text": "The company is liable only — it is a separate legal entity regardless", "is_correct": false },
      { "id": "C", "text": "Neither is liable — the creditor needed a personal guarantee", "is_correct": false }
    ]
  }
]
`.trim();
}

// ── Multimodal prompt (no text extraction needed — Gemini reads the file) ─────
function buildMultimodalPrompt(nodeCount: number): string {
  return `
ACT AS: Arcé Lead Learning Designer & Triage Lead.

CORE MISSION:
Analyse the attached file and deconstruct its content into ${nodeCount} "Closed-Loop Mastery Nodes."
Distinguish between "Rote Ammunition" (facts/terms) and "The Weapon" (causal logic/invariants).
Every node must be derived DIRECTLY from the source material — not from general knowledge.

OUTPUT RULES:
- Return ONLY a valid JSON array of exactly ${nodeCount} nodes. No markdown, no commentary.
- Each node must be grounded in the actual content.
- The domino_question must be open-ended (never multiple choice).
- The multiple_choice_options must have exactly one correct answer. Rotate which option (A, B, or C) is correct — do NOT always put the correct answer in position A. All three options must sound equally plausible.
- Tone: high-stakes, professional, slightly witty.
- NO SPOILERS: crisis_scenario and domino_question must create the itch, not reveal the answer.
- CRITICAL: crisis_scenario must be MAX 45 WORDS.

JSON SCHEMA:
[
  {
    "id": "kebab-case-slug",
    "title": "Short concept title (3-6 words)",
    "crisis_scenario": "ONE punchy sentence + one sharp question. MAX 45 WORDS.",
    "domino_question": "Open-ended predictive question. Format: 'You are [role]. Walk me through the Domino Effect...'",
    "formal_mechanism": "Core invariant as compressed cause-effect. 1-2 sentences.",
    "latex_formula": "LaTeX symbolic formula",
    "so_what": "The leverage insight. 1 sentence.",
    "stress_test": "Counter-variable challenge. 2-3 sentences.",
    "multiple_choice_question": "Recognition question testing the invariant.",
    "multiple_choice_options": [
      { "id": "A", "text": "Correct answer", "is_correct": true },
      { "id": "B", "text": "Plausible distractor", "is_correct": false },
      { "id": "C", "text": "Common misconception", "is_correct": false }
    ]
  }
]
`.trim();
}

// ── YouTube URL detection ─────────────────────────────────────────────────────
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// ── YouTube transcript fetcher ────────────────────────────────────────────────
async function fetchYouTubeTranscript(videoId: string): Promise<string> {
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  if (!transcript || transcript.length === 0) {
    throw new Error("No transcript available for this video. Try a video with captions enabled.");
  }
  return transcript.map((t) => t.text).join(" ");
}

// ── URL text fetcher (web pages / documents) ──────────────────────────────────
async function fetchUrlText(url: string): Promise<string> {
  // Convert Google Docs/Sheets/Slides to export URL for clean text
  const googleDocsMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (googleDocsMatch) {
    url = `https://docs.google.com/document/d/${googleDocsMatch[1]}/export?format=txt`;
  }
  const googleSheetsMatch = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (googleSheetsMatch) {
    url = `https://docs.google.com/spreadsheets/d/${googleSheetsMatch[1]}/export?format=csv`;
  }

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Arce/1.0)" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);

  const contentType = res.headers.get("content-type") || "";

  // PDF served via URL — return raw bytes for multimodal handling
  if (contentType.includes("application/pdf")) {
    const buffer = await res.arrayBuffer();
    return `__PDF_BASE64__:${Buffer.from(buffer).toString("base64")}`;
  }

  const html = await res.text();

  // Plain text (Google Docs export, CSV, etc.)
  if (contentType.includes("text/plain") || contentType.includes("text/csv")) {
    return html.trim().slice(0, 15000);
  }

  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 15000);
}

// ── MIME type helpers ─────────────────────────────────────────────────────────
const GEMINI_MULTIMODAL_TYPES: Record<string, string> = {
  "application/pdf": "application/pdf",
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
  "image/gif": "image/gif",
  "image/webp": "image/webp",
  "audio/mpeg": "audio/mpeg",
  "audio/mp4": "audio/mp4",
  "audio/wav": "audio/wav",
  "audio/ogg": "audio/ogg",
  "video/mp4": "video/mp4",
  "video/webm": "video/webm",
  "video/quicktime": "video/quicktime",
};

function getMimeType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const extMap: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    txt: "text/plain",
    csv: "text/csv",
  };
  return extMap[ext] || "text/plain";
}

// ── JSON parsing helper ───────────────────────────────────────────────────────
function parseGeminiJson(raw: string): any[] {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error("Not an array");
  return parsed;
}

// ── Normalise nodes ───────────────────────────────────────────────────────────
function normaliseNodes(logicNodes: any[]): any[] {
  return logicNodes.map((node: any, i: number) => ({
    id: node.id || `node-${String(i + 1).padStart(3, "0")}`,
    title: node.title || `Concept ${i + 1}`,
    invariant: node.formal_mechanism || "",
    crisis_scenario: node.crisis_scenario || "",
    domino_question: node.domino_question || "",
    formal_mechanism: node.formal_mechanism || "",
    latex_formula: node.latex_formula || "",
    so_what: node.so_what || "",
    stress_test: node.stress_test || "",
    multiple_choice_question: node.multiple_choice_question || "",
    multiple_choice_options: node.multiple_choice_options || [],
  }));
}

// ── Main route ────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const textMaterial = formData.get("text_material") as string | null;
    const url = formData.get("url") as string | null;
    const title = (formData.get("title") as string | null) || "Learning Session";
    const file = formData.get("file") as File | null;

    if (!textMaterial && !url && !file) {
      return NextResponse.json({ error: "Please provide text, URL, or file" }, { status: 400 });
    }

    let rawJson: string;
    let titleHint = "";
    let targetNodeCount = 5;

    // ── Plain text ──
    if (textMaterial) {
      if (textMaterial.trim().length < 50) {
        return NextResponse.json({ error: "Not enough content to generate nodes." }, { status: 400 });
      }
      targetNodeCount = calcNodeCount(textMaterial.length);
      titleHint = textMaterial;
      try {
        [rawJson] = await Promise.all([
          callGemini(buildPrompt(textMaterial, targetNodeCount)),
        ]);
      } catch (err: any) {
        console.error("Gemini call failed:", err.message);
        return NextResponse.json({ error: "AI extraction failed. Please try again." }, { status: 500 });
      }
    }

    // ── File upload ──
    else if (file) {
      const mimeType = getMimeType(file);
      const buffer = await file.arrayBuffer();

      // DOCX — extract text with mammoth
      if (
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mimeType === "application/msword" ||
        file.name.endsWith(".docx") ||
        file.name.endsWith(".doc")
      ) {
        let extractedText: string;
        try {
          const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
          extractedText = result.value;
        } catch (err: any) {
          console.error("DOCX parse error:", err.message);
          return NextResponse.json({ error: "Could not read the Word document. Try copying the text directly." }, { status: 400 });
        }

        if (extractedText.trim().length < 50) {
          return NextResponse.json({ error: "Not enough text content found in the document." }, { status: 400 });
        }

        targetNodeCount = calcNodeCount(extractedText.length);
        titleHint = extractedText;
        try {
          rawJson = await callGemini(buildPrompt(extractedText, targetNodeCount));
        } catch (err: any) {
          console.error("Gemini call failed:", err.message);
          return NextResponse.json({ error: "AI extraction failed. Please try again." }, { status: 500 });
        }
      }

      // PDF / images / audio / video — send inline to Gemini
      else if (GEMINI_MULTIMODAL_TYPES[mimeType]) {
        const base64Data = Buffer.from(buffer).toString("base64");
        targetNodeCount = 7;
        titleHint = file.name;
        try {
          rawJson = await callGeminiMultimodal(buildMultimodalPrompt(targetNodeCount), mimeType, base64Data);
        } catch (err: any) {
          console.error("Gemini multimodal call failed:", err.message);
          return NextResponse.json({ error: "AI extraction failed. Please try again." }, { status: 500 });
        }
      }

      // Plain text / CSV / code
      else {
        const extractedText = new TextDecoder().decode(buffer);
        if (extractedText.trim().length < 50) {
          return NextResponse.json({ error: "Not enough content to generate nodes." }, { status: 400 });
        }
        targetNodeCount = calcNodeCount(extractedText.length);
        titleHint = extractedText;
        try {
          rawJson = await callGemini(buildPrompt(extractedText, targetNodeCount));
        } catch (err: any) {
          console.error("Gemini call failed:", err.message);
          return NextResponse.json({ error: "AI extraction failed. Please try again." }, { status: 500 });
        }
      }
    }

    // ── URL ──
    else if (url) {
      const youtubeId = extractYouTubeId(url);

      if (youtubeId) {
        let transcript: string;
        try {
          transcript = await fetchYouTubeTranscript(youtubeId);
        } catch (err: any) {
          console.error("YouTube transcript error:", err.message);
          return NextResponse.json(
            { error: "Could not fetch video transcript. Make sure the video has captions enabled, or paste the transcript text directly." },
            { status: 400 }
          );
        }

        targetNodeCount = calcNodeCount(transcript.length);
        titleHint = transcript;
        try {
          rawJson = await callGemini(buildPrompt(transcript, targetNodeCount));
        } catch (err: any) {
          console.error("Gemini call failed:", err.message);
          return NextResponse.json({ error: "AI extraction failed. Please try again." }, { status: 500 });
        }
      } else {
        let fetchedContent: string;
        try {
          fetchedContent = await fetchUrlText(url);
        } catch (err) {
          return NextResponse.json(
            { error: "Could not fetch the URL. Please paste the content directly instead." },
            { status: 400 }
          );
        }

        if (fetchedContent.startsWith("__PDF_BASE64__:")) {
          const base64Data = fetchedContent.replace("__PDF_BASE64__:", "");
          titleHint = url;
          try {
            rawJson = await callGeminiMultimodal(buildMultimodalPrompt(7), "application/pdf", base64Data);
          } catch (err: any) {
            console.error("Gemini PDF call failed:", err.message);
            return NextResponse.json({ error: "AI extraction failed. Please try again." }, { status: 500 });
          }
        } else {
          if (fetchedContent.trim().length < 50) {
            return NextResponse.json({ error: "Not enough content found at that URL." }, { status: 400 });
          }
          targetNodeCount = calcNodeCount(fetchedContent.length);
          titleHint = fetchedContent;
          try {
            rawJson = await callGemini(buildPrompt(fetchedContent, targetNodeCount));
          } catch (err: any) {
            console.error("Gemini call failed:", err.message);
            return NextResponse.json({ error: "AI extraction failed. Please try again." }, { status: 500 });
          }
        }
      }
    } else {
      return NextResponse.json({ error: "No valid input provided." }, { status: 400 });
    }

    // ── Parse response ──
    let logicNodes: any[];
    try {
      logicNodes = parseGeminiJson(rawJson!);
    } catch {
      console.error("Failed to parse Gemini response:", rawJson!.slice(0, 500));
      return NextResponse.json({ error: "AI returned malformed data. Please try again." }, { status: 500 });
    }

    // ── Retry once if node count is significantly off ──
    // Also run title detection in parallel with retry (or standalone if no retry needed)
    let inferredUnit = "";
    let inferredTopic = "";

    const retryNeeded = logicNodes.length < targetNodeCount - 1 && textMaterial;

    const [, titleResult] = await Promise.all([
      retryNeeded
        ? (async () => {
            console.warn(`Node count mismatch: got ${logicNodes.length}, expected ${targetNodeCount}. Retrying...`);
            try {
              const retryPrompt = buildPrompt(textMaterial!, targetNodeCount) +
                `\n\nCRITICAL: You MUST return exactly ${targetNodeCount} nodes. The previous attempt only returned ${logicNodes.length}. Find more distinct concepts in the material.`;
              const retryRaw = await callGemini(retryPrompt);
              const retryNodes = parseGeminiJson(retryRaw);
              if (retryNodes.length > logicNodes.length) {
                logicNodes = retryNodes;
              }
            } catch { /* use original */ }
          })()
        : Promise.resolve(),
      titleHint
        ? detectUnitTopic(titleHint)
        : Promise.resolve({ unit_name: "", topic_name: "" }),
    ]);

    if (titleResult) {
      inferredUnit = (titleResult as any).unit_name || "";
      inferredTopic = (titleResult as any).topic_name || "";
    }

    return NextResponse.json({
      success: true,
      source_title: title,
      phase: "phase-0-extraction",
      logic_nodes: normaliseNodes(logicNodes),
      nodeCount: logicNodes.length,
      inferred_unit: inferredUnit,
      inferred_topic: inferredTopic,
    });
  } catch (error: any) {
    console.error("generate-scenarios error:", error);
    return NextResponse.json({ error: "Failed to generate scenarios" }, { status: 500 });
  }
}
