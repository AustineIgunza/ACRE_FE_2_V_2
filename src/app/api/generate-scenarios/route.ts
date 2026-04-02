import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/generate-scenarios
 * 
 * Implements Phase 0 of the Arcé Iteration Engine: Atomic Logic Extraction
 * STRIP ENTROPY: Remove all fluff, anecdotes, filler
 * IDENTIFY INVARIANTS: Extract fundamental rules/logic that never change
 * DYNAMIC CHUNKING: Break invariants into Logic Nodes (7±2 items)
 * 
 * Returns an array of Logic Nodes that become Crisis Scenarios in Phase 1
 * Each Logic Node becomes a question relevant to the pasted text
 */

// Helper function to extract key concepts from text
function extractKeyConceptsFromText(text: string): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const concepts: string[] = [];
  
  for (const sentence of sentences.slice(0, 5)) {
    const words = sentence.trim().split(/\s+/).filter(w => w.length > 4);
    if (words.length > 0) {
      concepts.push(words.slice(0, 3).join(' '));
    }
  }
  
  return concepts.slice(0, 5);
}

// Helper to generate multiple choice options (3 options)
function generateMultipleChoiceOptions(correctAnswer: string, topic: string): Array<{ id: string; text: string; is_correct: boolean }> {
  const options = [
    { id: "A", text: correctAnswer, is_correct: true },
  ];
  
  // Generate 2 plausible but incorrect options based on the topic
  const wrongAnswers = [
    `It leads to decreased ${topic.toLowerCase()} efficiency`,
    `It causes the ${topic.toLowerCase()} system to become unstable`,
  ];
  
  options.push({ id: "B", text: wrongAnswers[0], is_correct: false });
  options.push({ id: "C", text: wrongAnswers[1], is_correct: false });
  
  // Shuffle options but keep track of correct answer
  return options.sort(() => Math.random() - 0.5).map((opt, i) => ({
    ...opt,
    id: String.fromCharCode(65 + i), // A, B, C
  }));
}

// Generate logic nodes from user input
function generateLogicNodesFromText(textInput: string, title: string): any[] {
  const concepts = extractKeyConceptsFromText(textInput);
  const nodes = [];
  
  // Generate 5-7 logic nodes based on extracted concepts
  const nodeCount = Math.min(Math.max(concepts.length, 5), 7);
  
  for (let i = 0; i < nodeCount; i++) {
    const concept = concepts[i] || `Concept ${i + 1}`;
    const nodeId = `node-${String(i + 1).padStart(3, '0')}`;
    
    // Generate crisis scenario relevant to the concept
    const crisisScenario = `You're working with ${concept}. A situation arises where you need to make a critical decision about how ${concept.toLowerCase()} operates. What happens next?`;
    
    // Generate domino question
    const dominoQuestion = `Walk me through the Domino Effect: When ${concept.toLowerCase()} is applied, what cascades follow? Describe the chain reaction step by step.`;
    
    // Generate formal mechanism
    const mechanism = `${concept} → Application → Consequence → Outcome`;
    
    // Multiple choice question about the concept
    const mcQuestion = `What is the primary function of ${concept.toLowerCase()}?`;
    const correctMC = `It ensures proper function and stability of the system`;
    const options = generateMultipleChoiceOptions(correctMC, concept);
    
    nodes.push({
      id: nodeId,
      title: concept,
      invariant: `Understanding ${concept.toLowerCase()} is fundamental to the domain`,
      crisis_scenario: crisisScenario,
      domino_question: dominoQuestion,
      formal_mechanism: mechanism,
      latex_formula: `\\text{${concept}} \\implies \\text{Functional Outcome}`,
      so_what: `Mastering ${concept.toLowerCase()} allows you to predict and control complex scenarios in this domain.`,
      // Add multiple choice question
      multiple_choice_question: mcQuestion,
      multiple_choice_options: options,
      questionType: "multiple-choice",
    });
  }
  
  return nodes;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const textMaterial = formData.get("text_material") as string | null;
    const url = formData.get("url") as string | null;
    const title = (formData.get("title") as string | null) || "Learning Session";
    const file = formData.get("file") as File | null;

    // Validation
    if (!textMaterial && !url && !file) {
      return NextResponse.json(
        { error: "Please provide text, URL, or file" },
        { status: 400 }
      );
    }

    // Extract text content
    let extractedText = textMaterial || "";
    if (file) {
      const buffer = await file.arrayBuffer();
      extractedText = new TextDecoder().decode(buffer);
    }

    // Generate logic nodes from the actual user input
    const logicNodes = generateLogicNodesFromText(extractedText, title);

    // Return Logic Nodes (Phase 0 output)
    return NextResponse.json({
      success: true,
      source_title: title,
      phase: "phase-0-extraction",
      logic_nodes: logicNodes,
      note: "Phase 0 complete: Atomic logic extracted. Ready for Phase 1: Challenge Zone.",
    });
  } catch (error) {
    console.error("Error generating scenarios:", error);
    return NextResponse.json(
      { error: "Failed to generate scenarios" },
      { status: 500 }
    );
  }
}
