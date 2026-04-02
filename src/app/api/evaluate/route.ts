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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nodeId, prediction, question } = body;

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

    // Define expected keywords/concepts for each node
    const nodeKeywords: Record<string, { keywords: string[]; concepts: string[] }> = {
      "node-001": {
        keywords: ["membrane", "permeable", "gradient", "ion", "osmotic", "selective", "diffusion", "active transport"],
        concepts: ["cell death", "lysis", "equilibration", "concentration gradient", "Na+", "K+", "homeostasis"],
      },
      "node-002": {
        keywords: ["ATP", "energy", "mitochondria", "metabolic", "glucose", "respiration", "damage", "protein synthesis"],
        concepts: ["cellular death", "energy collapse", "organ failure", "metabolic shutdown", "starvation", "organ damage"],
      },
      "node-003": {
        keywords: ["mutation", "accuracy", "replication", "speed", "error", "cancer", "division", "DNA", "genetic"],
        concepts: ["genetic instability", "cancer", "evolution", "selection pressure", "mutation rate", "fidelity"],
      },
      "node-004": {
        keywords: ["photon", "electron", "ROS", "reactive oxygen", "damage", "thermal", "energy conversion", "ATP", "NADPH"],
        concepts: ["oxidative stress", "membrane damage", "protein damage", "photoinhibition", "excess energy", "heat"],
      },
      "node-005": {
        keywords: ["osmotic", "water", "solute", "hypotonic", "lysis", "pressure", "ion", "equilibrium", "active regulation"],
        concepts: ["cell rupture", "swelling", "pressure gradient", "ion pumps", "regulatory volume decrease", "turgor"],
      },
    };

    const nodeConfig = nodeKeywords[nodeId] || nodeKeywords["node-001"];
    const predictionLower = prediction.toLowerCase();

    // Score based on keyword presence and concept coverage
    let score = 0;
    let foundKeywords = 0;
    let foundConcepts = 0;

    // Check for keywords (core vocabulary)
    for (const keyword of nodeConfig.keywords) {
      if (predictionLower.includes(keyword)) {
        foundKeywords++;
      }
    }

    // Check for concepts (deeper understanding)
    for (const concept of nodeConfig.concepts) {
      if (predictionLower.includes(concept)) {
        foundConcepts++;
      }
    }

    // Calculate accuracy
    const keywordScore = (foundKeywords / nodeConfig.keywords.length) * 100;
    const conceptScore = (foundConcepts / nodeConfig.concepts.length) * 100;
    const overallScore = (keywordScore * 0.6 + conceptScore * 0.4); // Weight keywords more heavily

    console.log("Scoring:", { keywordScore, conceptScore, overallScore, foundKeywords, foundConcepts });

    // Determine accuracy level with more granular feedback
    let accuracy = "frost";
    let feedback = "The answer doesn't show sufficient understanding of the causal chain.";

    if (overallScore >= 70) {
      accuracy = "ignition";
      feedback = "Excellent prediction! You've identified the key cascade and consequences.";
    } else if (overallScore >= 45) {
      accuracy = "warning";
      feedback = "Good understanding, but you missed some key implications in the domino chain.";
    } else if (overallScore >= 25) {
      accuracy = "frost";
      feedback = "You identified some elements, but the causal logic needs more development. Try again.";
    } else {
      accuracy = "frost";
      feedback = "The response doesn't adequately trace the domino effect. Review the mechanism and try again.";
    }

    return NextResponse.json({
      accuracy,
      feedback,
      score: Math.round(overallScore),
      details: {
        keywordsFound: foundKeywords,
        conceptsFound: foundConcepts,
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

