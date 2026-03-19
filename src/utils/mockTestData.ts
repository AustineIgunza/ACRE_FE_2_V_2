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
        heat: 0,
        integrity: 0,
      },
      {
        id: "node-2",
        title: "Metabolic Processes",
        description: "Understand how cells obtain and convert energy for survival",
        thermalState: "neutral",
        heat: 0,
        integrity: 0,
      },
      {
        id: "node-3",
        title: "Cell Communication",
        description:
          "Discover how cells signal and coordinate with neighboring cells",
        thermalState: "neutral",
        heat: 0,
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
        label: "The cell nucleus is damaged and needs replacement",
        order: 1,
      },
      {
        id: "btn-1-b",
        label: "The mitochondria are dysfunctional - they cannot convert nutrients to ATP",
        order: 2,
      },
      {
        id: "btn-1-c",
        label: "The cell membrane is blocking energy absorption",
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
        label: "It will survive indefinitely by absorbing energy from nearby cells",
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
        label: "Cell membranes are directly fusing to share information",
        order: 1,
      },
      {
        id: "btn-3-b",
        label: "Cells are communicating through chemical signaling molecules binding to surface receptors",
        order: 2,
      },
      {
        id: "btn-3-c",
        label: "The nucleus is broadcasting control signals to all cells",
        order: 3,
      },
    ],
    difficulty: "level-1",
  },

  {
    id: "scenario-4",
    nodeId: "node-4",
    crisisText:
      "A cell has successfully replicated its DNA and is preparing to divide. Growth phase has completed and cell size doubled. What is the most critical factor preventing uncontrolled division?",
    questionType: "multiple-choice",
    actionButtons: [
      {
        id: "btn-4-a",
        label: "The mitochondria refuse to divide with the nucleus",
        order: 1,
      },
      {
        id: "btn-4-b",
        label:
          "Cells possess regulatory checkpoints that verify proper DNA replication and stop division if errors exist",
        order: 2,
      },
      {
        id: "btn-4-c",
        label: "The cell membrane hardens and prevents cell division entirely",
        order: 3,
      },
    ],
    difficulty: "level-2",
  },

  {
    id: "scenario-5",
    nodeId: "node-5",
    crisisText:
      "A cell is placed in an environment with extreme salinity (high salt concentration). The cell's internal salt concentration is much lower. How does the cell adapt to survive?",
    questionType: "multiple-choice",
    actionButtons: [
      {
        id: "btn-5-a",
        label: "Water flows out of the cell due to osmotic pressure - the cell shrivels and dies unless it actively pumps salt OUT",
        order: 1,
      },
      {
        id: "btn-5-b",
        label: "The nucleus expands to dilute the external salt concentration",
        order: 2,
      },
      {
        id: "btn-5-c",
        label: "The cell membrane becomes impermeable and blocks all osmotic pressure",
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
  // Map: scenario + button + defense length → thermal state
  // This simulates AI evaluation

  const evaluations: Record<string, Record<string, DefenseResult>> = {
    // Scenario 1: Client dependency (Feedback Loops)
    "scenario-1": {
      "btn-1-a": {
        thermalState: "frost",
        feedback:
          "❄️ FROST - Offering a discount treats the symptom, not the cause. You're creating a negative feedback loop that will squeeze margins and increase dependency. Why does the client matter so much?",
        keywords: ["symptom-treatment", "negative-feedback", "dependency"],
        formalDefinition:
          "Feedback loops are reinforcing cycles where outputs become inputs, either amplifying (positive feedback) or dampening (negative feedback) the original signal.",
      },
      "btn-1-b": {
        thermalState: "ignition",
        feedback:
          "🔥 IGNITION - DEEP CAUSALITY DETECTED! You identified the ROOT leverage point: single-client dependency. Diversification breaks the feedback loop and creates resilience. This is systems thinking.",
        keywords: ["diversification", "resilience", "leverage-point"],
        formalDefinition:
          "A leverage point is a location in a system where a small, targeted change produces disproportionately large effects on the system's behavior.",
      },
      "btn-1-c": {
        thermalState: "warning",
        feedback:
          "⚠️ WARNING - You're acknowledging the risk exists, but raising prices on a dissatisfied client could accelerate their departure. You're addressing the wrong variable.",
        keywords: ["pricing-strategy", "risk-acknowledgment", "incomplete"],
        formalDefinition:
          "Feedback loops are reinforcing cycles that can amplify or dampen system behavior.",
      },
    },

    // Scenario 2: Bottleneck (Factory shutdown)
    "scenario-2": {
      "btn-2-a": {
        thermalState: "ignition",
        feedback:
          "🔥 IGNITION - You identified the bottleneck: single production facility. Finding an alternative supplier removes the critical constraint. This is strategic bottleneck breaking.",
        keywords: ["bottleneck-identification", "constraint-removal", "agility"],
        formalDefinition:
          "A bottleneck is a point in a system where resource capacity is limited, creating a constraint that reduces throughput of the entire system.",
      },
      "btn-2-b": {
        thermalState: "frost",
        feedback:
          "❄️ FROST - Negotiating delays only pushes the problem forward. Regulatory closure will eventually happen. You're treating time as a resource when you should address the actual constraint.",
        keywords: ["delay-tactics", "constraint-avoidance", "short-term"],
        formalDefinition:
          "A bottleneck is a limited-capacity point that constrains overall system throughput.",
      },
      "btn-2-c": {
        thermalState: "warning",
        feedback:
          "⚠️ WARNING - Pivoting to a new product might work, but you haven't solved the production bottleneck. You still depend on a single facility. What happens if THIS product faces regulation too?",
        keywords: ["partial-solution", "surface-level", "recurring-risk"],
        formalDefinition:
          "A bottleneck constrains system capacity and creates risk when not addressed at the source.",
      },
    },

    // Scenario 3: Leverage Points (Bug fixes vs features)
    "scenario-3": {
      "btn-3-a": {
        thermalState: "ignition",
        feedback:
          "🔥 IGNITION - You found the leverage point! Fixing crashing bugs removes the highest-friction barrier to user retention. This is where small effort yields massive impact. Systems thinkers call this 'finding the constraint.'",
        keywords: ["leverage-point", "constraint-identification", "friction"],
        formalDefinition:
          "A leverage point is a location where a small change in a system produces disproportionate effects on overall performance and outcomes.",
      },
      "btn-3-b": {
        thermalState: "frost",
        feedback:
          "❄️ FROST - Adding features to a broken product is rearranging deck chairs. Users are leaving because the core experience is broken. Why would new features matter if the app crashes?",
        keywords: ["missing-leverage", "wrong-priority", "feature-bloat"],
        formalDefinition:
          "A leverage point is where small changes yield large effects; missing it means effort is wasted.",
      },
      "btn-3-c": {
        thermalState: "warning",
        feedback:
          "⚠️ WARNING - Marketing can't sell a broken product. You're addressing demand when the real issue is supply-side quality. You're in the right ballpark but attacking from wrong angle.",
        keywords: ["demand-vs-supply", "symptom-focus", "incomplete-analysis"],
        formalDefinition:
          "A leverage point is a constraint location; ignoring it means efforts elsewhere have diminished returns.",
      },
    },

    // Scenario 4: Root Cause Analysis
    "scenario-4": {
      "btn-4-a": {
        thermalState: "frost",
        feedback:
          "❄️ FROST - Blaming speed is lazy analysis. You haven't traced the causal chain. Why is the timeline so compressed? Was scope changed? Were requirements unclear from day one?",
        keywords: ["surface-blame", "no-root-cause", "symptom"],
        formalDefinition:
          "Root cause analysis is the process of identifying the fundamental origin of a problem by tracing causal chains backward from symptoms.",
      },
      "btn-4-b": {
        thermalState: "ignition",
        feedback:
          "🔥 IGNITION - You traced the causal chain! Unrealistic initial estimates + scope creep = the ROOT cause. This is true root cause analysis. The fix: stricter requirements management or timeline adjustment.",
        keywords: ["root-cause-found", "scope-management", "causal-chain"],
        formalDefinition:
          "Root cause analysis identifies the fundamental origin of problems by tracing backward through causal chains, not just treating symptoms.",
      },
      "btn-4-c": {
        thermalState: "frost",
        feedback:
          "❄️ FROST - Tools won't solve a fundamentally flawed project plan. You're treating an organizational issue as a tool problem. What's the REAL reason you're behind?",
        keywords: ["tool-obsession", "misdiagnosis", "avoidance"],
        formalDefinition:
          "Root cause analysis requires identifying the fundamental origin, not treating symptoms with tools.",
      },
    },

    // Scenario 5: Trade-off Evaluation
    "scenario-5": {
      "btn-5-a": {
        thermalState: "ignition",
        feedback:
          "🔥 IGNITION - You weighed long-term ROI against immediate revenue impact. Automation creates permanent efficiency; people can leave. This is sophisticated trade-off reasoning.",
        keywords: ["long-term-thinking", "roi-analysis", "strategic"],
        formalDefinition:
          "Trade-off evaluation requires weighing competing priorities by their long-term effects, not immediate impacts.",
      },
      "btn-5-b": {
        thermalState: "warning",
        feedback:
          "⚠️ WARNING - People do grow revenue, but they also leave. You're optimizing for short-term growth over long-term stability. What happens when those 10 people get better offers?",
        keywords: ["short-term-bias", "people-churn-risk", "partial"],
        formalDefinition:
          "Trade-off evaluation must weigh short-term vs long-term consequences, not just immediate returns.",
      },
      "btn-5-c": {
        thermalState: "frost",
        feedback:
          "❄️ FROST - Delaying a strategic decision is a decision itself - you're missing market opportunity and letting competitors invest first. What's your actual constraint: capital or confidence?",
        keywords: ["analysis-paralysis", "opportunity-cost", "avoidance"],
        formalDefinition:
          "Trade-off evaluation requires making decisions; delay has consequences equal to any choice.",
      },
    },
  };

  // If we have specific evaluation, use it
  if (evaluations[scenarioId]?.[actionButtonId]) {
    return evaluations[scenarioId][actionButtonId];
  }

  // Fallback: evaluate based on defense length
  if (defenseLength < 50) {
    return {
      thermalState: "frost",
      feedback:
        "❄️ FROST - Your defense is too shallow. You need to explain the causal chain. Why does your choice work? What are the consequences?",
      keywords: ["shallow-reasoning", "incomplete-defense"],
      formalDefinition: "A defense must explain the underlying causal mechanisms.",
    };
  }

  if (defenseLength < 150) {
    return {
      thermalState: "warning",
      feedback:
        "⚠️ WARNING - You're on the right track, but incomplete. Consider second-order effects: What else changes when you make this move?",
      keywords: ["partial-reasoning", "first-order-only"],
      formalDefinition:
        "Strategic reasoning requires considering both immediate and cascading effects.",
    };
  }

  return {
    thermalState: "ignition",
    feedback:
      "🔥 IGNITION - Excellent causal reasoning! You've identified the leverage point and explained the feedback loops. This shows deep systems thinking.",
    keywords: ["causal-depth", "systems-thinking", "strategic"],
    formalDefinition:
      "Systems thinking integrates multiple causal chains and leverage points into coherent strategic reasoning.",
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
        title: "Feedback Loops",
        definition:
          "Feedback loops are self-reinforcing or self-limiting cycles in a system where the output of one element becomes input to another, creating amplification (positive feedback) or dampening (negative feedback) effects. Understanding feedback loops is essential for predicting long-term system behavior and identifying intervention points.",
      },
      "node-2": {
        title: "Bottleneck Detection",
        definition:
          "A bottleneck is a point in a system where resource availability or processing capacity is limited, creating a constraint that reduces the throughput of the entire system. Identifying and removing bottlenecks is a high-leverage intervention: fixing the constraint often yields disproportionately large improvements in overall system performance.",
      },
      "node-3": {
        title: "Leverage Points",
        definition:
          "Leverage points are locations in a system where small, targeted changes produce disproportionately large effects on overall behavior and outcomes. Effective systems thinking involves identifying where leverage exists and applying minimal effort at those points, rather than distributing effort equally across the system.",
      },
      "node-4": {
        title: "Root Cause Analysis",
        definition:
          "Root cause analysis is the systematic process of tracing a problem backward through causal chains to identify its fundamental origin, rather than addressing only its symptoms. True root cause identification requires asking 'why' multiple times and resisting the temptation to treat symptoms with surface-level solutions.",
      },
      "node-5": {
        title: "Trade-off Evaluation",
        definition:
          "Trade-off evaluation is the process of weighing competing priorities by analyzing their second-order and long-term consequences, not just immediate impacts. Strategic decision-making requires understanding what you're optimizing for and accepting that improvement in one dimension often comes at the cost of another.",
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
            "systems-thinking",
            "causal-reasoning",
            "leverage-points",
            "strategic-analysis",
          ]
        : thermalState === "warning"
          ? ["partial-understanding", "incomplete-analysis", "room-for-growth"]
          : ["shallow-reasoning", "symptom-focus", "surface-level"],
    createdAt: Date.now(),
    shareUrl: `https://arce.app/mastery/${nodeId}`,
  };
};
