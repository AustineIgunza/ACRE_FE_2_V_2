/**
 * Shared Gemini helper with automatic model fallback.
 * Tries gemini-2.5-flash first (8s timeout); falls back to gemini-2.5-flash-lite on 503/429/timeout.
 */

const MODELS = [
  { id: "gemini-2.5-flash", timeoutMs: 8000 },
  { id: "gemini-2.5-flash-lite", timeoutMs: 25000 },
];

export async function callGemini(
  prompt: string,
  options: { temperature?: number; maxOutputTokens?: number; jsonMode?: boolean } = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const { temperature = 0.4, maxOutputTokens = 8192, jsonMode = false } = options;

  let lastError: Error | null = null;

  for (const { id: model, timeoutMs } of MODELS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const body: any = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens },
      };
      if (jsonMode) {
        body.generationConfig.responseMimeType = "application/json";
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        }
      );

      clearTimeout(timer);

      // Retry next model on overload / quota
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
        lastError = new Error(`${model} timed out after ${timeoutMs}ms`);
        continue;
      }
      // If it's already the last model, rethrow; otherwise try next
      if (model !== MODELS[MODELS.length - 1].id) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  throw lastError ?? new Error("All Gemini models failed");
}
