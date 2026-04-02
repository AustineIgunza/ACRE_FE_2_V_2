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
 * Each Logic Node becomes a Predictive Question (free-text, no multiple choice)
 */

// Mock Logic Nodes extracted from cell biology material
// Each node is a fundamental invariant that drives the learning experience
const logicNodes = [
  {
    id: "node-001",
    title: "Cell Membrane Selectivity",
    invariant: "The cell membrane controls all molecular exchange between cell and environment",
    crisis_scenario: "A toxic chemical is attempting to enter a cell. The cell membrane must maintain a concentration gradient to survive. If the membrane loses its selective permeability, what happens to cellular homeostasis?",
    domino_question: "Walk me through the Domino Effect: If the cell membrane becomes permeable to all molecules, what cascades do you predict? Start with what enters the cell, then describe the consequences.",
    formal_mechanism: "Semipermeable Membrane → Selective Transport → Ionic Gradient Maintenance → Cellular Equilibrium",
    latex_formula: "\\text{Selective Transport} \\implies \\text{Maintained Gradient} \\implies \\text{Cell Survival}",
    so_what: "Without selective permeability, cells cannot maintain the chemical environment they need to function. This is the cheat code: control what crosses the boundary, control what happens inside.",
  },
  {
    id: "node-002",
    title: "Energy Paradox",
    invariant: "Cells invest energy (ATP) to obtain more energy (through chemical reactions)",
    crisis_scenario: "A cell suddenly loses access to glucose, its primary energy source. Mitochondria begin to fail. But wait—the cell has emergency stores of nutrients. The question: should the cell burn through those stores quickly, or ration them slowly?",
    domino_question: "Walk me through the Domino Effect: If a cell rations energy too slowly, what happens to its ability to repair damage, synthesize proteins, and maintain ion pumps? If it burns reserves too fast, what's the endpoint?",
    formal_mechanism: "Energy Investment → Metabolic Efficiency → Temporal Survival → Evolutionary Fitness",
    latex_formula: "\\text{ATP Production} \\implies \\text{Active Transport} \\implies \\text{Cellular Work}",
    so_what: "Cells are not simple consumers; they are strategic managers of energy budgets. Understanding this paradox explains why starvation and disease are deadly—the cell's economic system collapses.",
  },
  {
    id: "node-003",
    title: "Division Trade-Off",
    invariant: "Cell division sacrifices individual cell complexity for population continuity",
    crisis_scenario: "A cell is about to divide. It must decide: invest energy in perfect DNA replication and risk slower reproduction, or replicate quickly and risk errors that create mutations?",
    domino_question: "Walk me through the Domino Effect: If a cell prioritizes speed over accuracy, what cascades? What about the opposite? Consider: short-term survival vs. long-term genetic integrity.",
    formal_mechanism: "Replication Speed ↔ Accuracy Trade-off → Mutation Rate → Selection Pressure",
    latex_formula: "\\text{Cell Division} \\implies (\\text{Population Growth} \\lor \\text{Genetic Stability})",
    so_what: "Evolution is built on this tension. Cancer emerges when cells choose unchecked division. This is why replication is the most carefully monitored process in biology.",
  },
  {
    id: "node-004",
    title: "Photosynthetic Conversion",
    invariant: "Light energy is converted into chemical energy (ATP/NADPH) through ordered electron transfer",
    crisis_scenario: "A plant cell is exposed to intense light but cannot convert it fast enough. Excess photons build up as heat. If the photosynthetic machinery becomes too slow, what thermal damage occurs?",
    domino_question: "Walk me through the Domino Effect: If light harvesting outpaces electron transfer, electrons become unstable and generate reactive oxygen. Describe the cascade: from photon to ROS to cellular damage.",
    formal_mechanism: "Photon Absorption → Electron Excitation → Coupled Phosphorylation → ATP/NADPH Production",
    latex_formula: "\\text{Light Energy} + \\text{Electron Transport Chain} \\implies \\text{ATP + NADPH}",
    so_what: "Photosynthesis is not magic; it's a tightly coupled energy conversion system. Plants developed this precisely because chaos (free electrons) is fatal. Order = survival.",
  },
  {
    id: "node-005",
    title: "Osmotic Pressure Balance",
    invariant: "Water passively flows toward regions of higher solute concentration; cells must maintain isotonic equilibrium",
    crisis_scenario: "A cell is suddenly placed in a hypotonic solution (fewer solutes outside). Water rushes in. If the cell cannot actively regulate its internal osmotic pressure, it will lyse and rupture.",
    domino_question: "Walk me through the Domino Effect: If a cell is in a hypotonic environment, water enters by osmosis. Describe what happens: internal pressure rises, the cell swells, the membrane stretches. What is the endpoint? How do cells normally prevent this?",
    formal_mechanism: "Solute Gradient → Water Influx (Osmosis) → Internal Pressure → Active Ion Regulation → Equilibrium",
    latex_formula: "\\Delta \\text{Osmotic Pressure} \\implies \\text{Water Movement} \\implies \\text{Cell Volume Control}",
    so_what: "Osmotic balance is non-negotiable. This is why salt kills slugs, why IV drips must be isotonic, why cells die in distilled water. Understand osmosis, understand why organisms fail.",
  },
];

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

    // Return Logic Nodes (Phase 0 output)
    // In production, this would:
    // 1. Extract content from input (text/url/file)
    // 2. Strip entropy, identify invariants, create 7±2 nodes
    // 3. Generate crisis scenarios and domino questions
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
