import { NextRequest, NextResponse } from "next/server";

// Helper function to detect gibberish/random text
function isGibberish(text: string): boolean {
  if (!text || text.length < 5) return true;
  
  // Check for vowel/consonant ratio (English text has ~38% vowels)
  const vowels = (text.match(/[aeiouAEIOU]/g) || []).length;
  const consonants = (text.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g) || []).length;
  const total = vowels + consonants;
  
  if (total === 0) return true;
  
  const vowelRatio = vowels / total;
  // If vowel ratio is too low (< 20%) or too high (> 60%), likely gibberish
  if (vowelRatio < 0.2 || vowelRatio > 0.6) return true;
  
  // Check for repeating characters (dndndhdgbbss has heavy repetition)
  let repeatCount = 0;
  for (let i = 0; i < text.length - 1; i++) {
    if (text[i] === text[i + 1]) repeatCount++;
  }
  if (repeatCount > text.length * 0.4) return true; // >40% repeating chars = gibberish
  
  // Check word length variance (gibberish often has very short words)
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return true;
  
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  if (avgWordLength < 2.5) return true; // Average word length too short
  
  return false;
}

// Extract key concepts from the question/scenario context
function extractConceptsFromQuestion(question: string): string[] {
  // Split into words, remove common words, and extract potential concepts
  const stopWords = new Set(["the", "a", "an", "is", "are", "what", "when", "where", "why", "how", "what", "describe", "explain", "walk", "through", "me", "step", "by", "and", "or", "in", "of", "to", "for"]);
  
  const words = question.toLowerCase()
    .split(/[\s\.,!?;:]+/)
    .filter(w => w.length > 3 && !stopWords.has(w));
  
  return [...new Set(words)]; // Deduplicate
}

// Semantic similarity: Count how many key words from question appear in prediction
function calculateSemanticScore(prediction: string, question: string): number {
  const predictionWords = new Set(prediction.toLowerCase().split(/[\s\.,!?;:]+/));
  const concepts = extractConceptsFromQuestion(question);
  
  let matchCount = 0;
  for (const concept of concepts) {
    if (predictionWords.has(concept)) {
      matchCount++;
    }
  }
  
  // Score: what percentage of key concepts were mentioned
  return concepts.length > 0 ? (matchCount / concepts.length) * 100 : 0;
}

// Check for causal/chain reasoning indicators
function calculateCausalReasoningScore(prediction: string): number {
  const causalPhrases = [
    "causes", "leads to", "results in", "results", "triggers", "initiates",
    "then", "therefore", "because", "due to", "as a result", "consequence",
    "effect", "impact", "cascade", "chain", "follows", "sequence",
    "chain reaction", "domino", "spreads", "propagates", "escalates"
  ];
  
  const predictionLower = prediction.toLowerCase();
  let causalCount = 0;
  
  for (const phrase of causalPhrases) {
    if (predictionLower.includes(phrase)) {
      causalCount++;
    }
  }
  
  // Maximum of 40% based on causal phrases (at least need semantic score)
  return Math.min(40, (causalCount / causalPhrases.length) * 100);
}

// Check for depth and detail
function calculateDetailScore(prediction: string): number {
  const sentences = prediction.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = prediction.split(/\s+/).length / sentences.length;
  
  // Prefer longer, more detailed answers
  if (avgWordsPerSentence < 10) return 10; // Too short
  if (avgWordsPerSentence < 20) return 30; // Minimal detail
  if (avgWordsPerSentence < 40) return 60; // Good detail
  return 100; // Excellent detail
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nodeId, prediction, question, originalText } = body;

    console.log("Evaluating:", { nodeId, prediction, question });

    // Check for gibberish first
    if (isGibberish(prediction)) {
      return NextResponse.json({
        accuracy: "frost",
        feedback: "That doesn't look like a coherent attempt. Please provide a thoughtful explanation of the domino effect.",
        score: 0,
        details: {
          keywordsFound: 0,
          conceptsFound: 0,
        }
      });
    }

    // Use dynamic evaluation based on the actual question/scenario
    const semanticScore = calculateSemanticScore(prediction, question || "");
    const causalScore = calculateCausalReasoningScore(prediction);
    const detailScore = calculateDetailScore(prediction);
    
    // Weighted score: 40% semantic, 40% causal reasoning, 20% detail
    const overallScore = (semanticScore * 0.4) + (causalScore * 0.4) + (detailScore * 0.2);

    console.log("Scoring:", { semanticScore, causalScore, detailScore, overallScore });

    // Determine thermal state with granular feedback based on actual score ranges
    let accuracy: "ignition" | "warning" | "frost" = "frost";
    let feedback = "The answer doesn't show sufficient understanding of the causal chain.";

    if (overallScore >= 75) {
      accuracy = "ignition";
      feedback = "🔥 Excellent! You've identified the key cascade and traced the chain reactions clearly. Your causal reasoning is outstanding.";
    } else if (overallScore >= 60) {
      accuracy = "warning";
      feedback = "⚠️ Good understanding! You identified the core mechanism, but could strengthen the causal chain. Try adding more steps to show how one event leads to the next.";
    } else if (overallScore >= 40) {
      accuracy = "frost";
      feedback = "❄️ You're on the right track and identified some key elements, but the causal logic needs more development. Show me how each step leads to the next consequence.";
    } else {
      accuracy = "frost";
      feedback = "❄️ The response doesn't adequately trace the domino effect. Try to identify the initial trigger, then show step-by-step how it cascades. Review the mechanism and try again.";
    }

    return NextResponse.json({
      accuracy,
      feedback,
      score: Math.round(overallScore),
      thermalState: accuracy,
      details: {
        semanticRelevance: Math.round(semanticScore),
        causalReasoning: Math.round(causalScore),
        detail: Math.round(detailScore),
      }
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json({ 
      error: "Invalid request",
      accuracy: "frost",
      feedback: "Unable to evaluate response",
    }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Evaluate endpoint" });
}

