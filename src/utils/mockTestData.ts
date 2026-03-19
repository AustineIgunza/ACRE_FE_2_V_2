/**
 * MOCK TEST DATA - Complete testing scenarios
 * All data for frontend testing WITHOUT backend
 * Includes correct, warning, and frost scenarios
 */

import {
  Cluster,
  CrisisScenario,
  CausalAnchor,
  ThermalState,
  MasteryCard,
} from "@/types/arce";

// ============================================
// MOCK CLUSTERS WITH NODES
// ============================================

export const MOCK_CLUSTERS: Cluster[] = [
  {
    id: "cluster-1",
    clusterIndex: 0,
    title: "Cell Biology Fundamentals",
    description: "Understand the basic unit of life and its essential functions",
    status: "unlocked",
    nodes: [
      {
        id: "node-1",
        title: "Cell Structure & Organization",
        description:
          "Learn how cells contain specialized structures like nucleus, mitochondria, and membrane",
        thermalState: "neutral",
        heat: 20,
        integrity: 0,
      },
      {
        id: "node-2",
        title: "Metabolic Processes",
        description: "Understand how cells obtain and convert energy for survival",
        thermalState: "neutral",
        heat: 45,
        integrity: 0,
      },
      {
        id: "node-3",
        title: "Cell Communication",
        description:
          "Discover how cells signal and coordinate with neighboring cells",
        thermalState: "neutral",
        heat: 75,
        integrity: 0,
      },
    ],
  },
  {
    id: "cluster-2",
    clusterIndex: 1,
    title: "Advanced Cell Functions",
    description: "Master complex cellular processes and organism integration",
    status: "locked",
    nodes: [
      {
        id: "node-4",
        title: "Growth & Reproduction",
        description: "Understand cellular division and organism development",
        thermalState: "neutral",
        heat: 0,
        integrity: 0,
      },
      {
        id: "node-5",
        title: "Environmental Adaptation",
        description: "Learn how cells respond and adapt to environmental changes",
        thermalState: "neutral",
        heat: 0,
        integrity: 0,
      },
    ],
  },
];

// ============================================
// MOCK CRISIS SCENARIOS
// ============================================

export const MOCK_CRISIS_SCENARIOS: CrisisScenario[] = [
  {
    id: "scenario-1",
    nodeId: "node-1",
    crisisText:
      "A researcher observes that a cell is unable to produce energy despite having food molecules available. The nucleus is intact and the cell membrane appears normal. What is the critical structure likely malfunctioning?",
    questionType: "multiple-choice",
    actionButtons: [
      {
        id: "btn-1-a",
        label: "The mitochondria are dysfunctional - they cannot convert nutrients to ATP",
        order: 1,
      },
      {
        id: "btn-1-b",
        label: "The cell nucleus is damaged and needs replacement",
        order: 2,
      },
      {
        id: "btn-1-c",
        label: "The ribosome malfunction is preventing all protein synthesis",
        order: 3,
      },
    ],
    difficulty: "level-1",
  },

  {
    id: "scenario-2",
    nodeId: "node-2",
    crisisText:
      "During cell division, a daughter cell receives no mitochondria. What immediate consequence will occur to this new cell's survival?",
    questionType: "multiple-choice",
    actionButtons: [
      {
        id: "btn-2-a",
        label: "The cell will quickly die due to inability to generate ATP energy",
        order: 1,
      },
      {
        id: "btn-2-b",
        label: "The nucleus will compensate by producing its own energy",
        order: 2,
      },
      {
        id: "btn-2-c",
        label: "The cell will attempt to borrow mitochondria from neighboring cells through membrane fusion",
        order: 3,
      },
    ],
    difficulty: "level-2",
  },

  {
    id: "scenario-3",
    nodeId: "node-3",
    crisisText:
      "Cells in different tissues need to coordinate their growth. They receive chemical signals from neighboring cells indicating growth has slowed. What process is enabling this coordination?",
    questionType: "multiple-choice",
    actionButtons: [
      {
        id: "btn-3-a",
        label: "Cells are communicating through chemical signaling molecules binding to surface receptors",
        order: 1,
      },
      {
        id: "btn-3-b",
        label: "Cell membranes are directly fusing to share information",
        order: 2,
      },
      {
        id: "btn-3-c",
        label: "Gap junctions allow direct passage of small molecules between cells for coordinated response",
        order: 3,
      },
    ],
    difficulty: "level-1",
  },

];

// ============================================
// MOCK THERMAL FEEDBACK (Different answers)
// ============================================

export type DefenseResult = {
  thermalState: ThermalState;
  feedback: string;
  keywords: string[];
  formalDefinition: string;
};

export const getDefenseEvaluation = (
  scenarioId: string,
  actionButtonId: string,
  defenseLength: number
): DefenseResult => {
  // TEST MODE: B is always wrong (FROST), A and C are correct with different heat
  if (actionButtonId.endsWith("-b")) {
    // Button B: Always FROST (wrong answer - RED heat)
    return {
      thermalState: "frost",
      feedback: "FROST - This answer misses the key concept. Review the core mechanism.",
      keywords: ["incomplete", "missing-concept", "reconsider"],
      formalDefinition:
        "Test mode: Button B is incorrect. Button A gives low heat (GOOD), Button C gives high heat (BAD) - review the heatmap to see the difference!",
    };
  }

  if (actionButtonId.endsWith("-a")) {
    // Button A: Correct answer with LOW HEAT (BLUE - Good performance)
    return {
      thermalState: "ignition",
      feedback: "IGNITION - Excellent! You identified the correct mechanism with clear reasoning.",
      keywords: ["correct-answer", "good-heat", "low-risk"],
      formalDefinition:
        "Button A is correct and shows LOW HEAT (blue bar) in the heatmap - this means good performance with low risk.",
    };
  }

  if (actionButtonId.endsWith("-c")) {
    // Button C: Also correct answer but HIGH HEAT (RED - Bad performance)
    return {
      thermalState: "ignition",
      feedback: "IGNITION - Correct answer! However, notice HIGH HEAT in the heatmap - this solution works but has high risk.",
      keywords: ["correct-risky", "high-heat", "high-risk"],
      formalDefinition:
        "Button C is correct but shows HIGH HEAT (red bar) in the heatmap - this means correct logic but risky implementation.",
    };
  }

  // Fallback
  return {
    thermalState: "warning",
    feedback: "WARNING - Please select A, B, or C to continue.",
    keywords: ["test-mode"],
    formalDefinition: "Select one of the answer options.",
  };
};

// ============================================
// MOCK MASTERY CARD GENERATION
// ============================================

export const generateMockMasteryCard = (
  nodeId: string,
  defense: string,
  thermalState: ThermalState
): MasteryCard => {
  const nodeDefinitions: Record<string, { title: string; definition: string }> =
    {
      "node-1": {
        title: "Cell Structure & Organization",
        definition:
          "Cell structure refers to the specialized compartments (organelles) within cells, each with distinct functions. The mitochondria is the powerhouse of the cell, converting nutrients into ATP energy. The nucleus controls gene expression. The cell membrane regulates what enters and exits.",
      },
      "node-2": {
        title: "Metabolic Processes",
        definition:
          "Metabolism encompasses all chemical reactions that convert nutrients into energy and building blocks. Without mitochondria, cells cannot produce ATP and will rapidly die. Glucose and other molecules are broken down through glycolysis, citric acid cycle, and oxidative phosphorylation.",
      },
      "node-3": {
        title: "Cell Communication",
        definition:
          "Cells communicate through chemical signaling molecules (hormones, neurotransmitters) that bind to surface receptors. This allows cells in different tissues to coordinate growth, respond to signals, and maintain homeostasis. Signal transduction cascades amplify and relay these messages.",
      },
      "node-4": {
        title: "Growth & Reproduction",
        definition:
          "Cell division is tightly regulated by checkpoints that verify DNA replication accuracy before allowing mitosis. Without these regulatory mechanisms, uncontrolled cell division (cancer) results. Proper checkpoint control ensures genetic integrity across generations.",
      },
      "node-5": {
        title: "Environmental Adaptation",
        definition:
          "Cells adapt to osmotic stress through active transport mechanisms that pump ions in or out, regulating internal salt concentration. When placed in hypertonic solutions, cells lose water through osmosis unless they actively pump solutes out. This adaptation requires energy and active ion channels.",
      },
    };

  const nodeInfo = nodeDefinitions[nodeId] || {
    title: "Unknown Node",
    definition: "A mastery concept to be defined.",
  };

  return {
    id: `mastery-${nodeId}-${Date.now()}`,
    nodeId,
    formalDefinition: nodeInfo.definition,
    keywords:
      thermalState === "ignition"
        ? [
            "correct-concept",
            "deep-understanding",
            "mastery",
            "excellent-reasoning",
          ]
        : thermalState === "warning"
          ? ["partial-understanding", "incomplete-analysis", "room-for-growth"]
          : ["shallow-reasoning", "symptom-focus", "surface-level"],
    createdAt: Date.now(),
    shareUrl: `https://arce.app/mastery/${nodeId}`,
  };
};
