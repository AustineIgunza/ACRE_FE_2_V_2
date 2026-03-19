/**
 * ARCÉ Game Model
 * Handles all business logic and game state transformations
 */

import { GameSession, CrisisScenario, ThermalState, CausalAnchor } from "@/types/arce";

export class GameModel {
  /**
   * Calculate thermal state based on defense quality
   */
  static calculateThermalState(defenseLength: number, crisisComplexity: number): ThermalState {
    if (defenseLength < 50) return "frost";
    if (defenseLength < 150 && crisisComplexity > 7) return "warning";
    return "ignition";
  }

  /**
   * Calculate heat and integrity scores
   */
  static calculateScores(
    thermalState: ThermalState,
    currentHeat: number,
    currentIntegrity: number
  ): { heat: number; integrity: number } {
    const heatIncrements: Record<ThermalState, number> = {
      frost: 15,
      warning: 35,
      ignition: 50,
      neutral: 0,
    };

    const integrityIncrements: Record<ThermalState, number> = {
      frost: 5,
      warning: 25,
      ignition: 45,
      neutral: 0,
    };

    return {
      heat: Math.min(100, currentHeat + heatIncrements[thermalState]),
      integrity: Math.min(100, currentIntegrity + integrityIncrements[thermalState]),
    };
  }

  /**
   * Generate mastery card from crisis response
   */
  static generateMasteryCard(
    crisisTitle: string,
    thermalState: ThermalState,
    defense: string
  ): CausalAnchor {
    // Generate formal academic definition based on crisis context
    const formalDefinitions: Record<string, string> = {
      "supply-chain": "Supply Chain Resilience refers to the capacity of a logistical network to withstand disruptions, recover rapidly, and maintain functional continuity through diversified sourcing strategies and contingency planning.",
      "feedback-loops": "Feedback loops are self-regulating mechanisms where outputs of a system become inputs, creating either reinforcing cycles (exponential growth/decay) or balancing cycles (homeostasis). Understanding polarity and delay is critical for system intervention.",
      "leverage-points": "Leverage points are interventions in a system where small changes produce disproportionate effects. Systems thinking identifies these high-impact zones rather than applying uniform force across all variables.",
      "bottleneck": "A bottleneck is a single point of constraint that limits system throughput regardless of other capacity. Identifying and eliminating bottlenecks provides exponential improvement in overall system performance.",
      "default": `${crisisTitle} represents a complex system dynamic where multiple causal chains interact. Deep understanding requires identifying leverage points and feedback loops that perpetuate or resolve the crisis. The formal definition: ${defense.substring(0, 80)}...`,
    };

    // Extract category from crisis title
    const lowerTitle = crisisTitle.toLowerCase();
    let category = "default";
    if (lowerTitle.includes("supply")) category = "supply-chain";
    if (lowerTitle.includes("feedback")) category = "feedback-loops";
    if (lowerTitle.includes("leverage")) category = "leverage-points";
    if (lowerTitle.includes("bottleneck")) category = "bottleneck";

    // Generate keywords based on thermal state and context
    const keywordMap: Record<ThermalState, string[]> = {
      frost: ["surface-level", "incomplete-causality", "single-factor-bias", "needs-deepening"],
      warning: ["partial-understanding", "emerging-causality", "multi-factor-analysis", "developing-mastery"],
      ignition: ["deep-causality", "systems-thinking", "leverage-identification", "mastery-achieved"],
      neutral: ["analysis-pending", "evaluation-in-progress"],
    };

    const contextKeywords = 
      lowerTitle.includes("supply") ? ["supply-chain", "resilience", "diversification", "contingency"] :
      lowerTitle.includes("feedback") ? ["feedback-loops", "causality", "reinforcement", "homeostasis"] :
      lowerTitle.includes("leverage") ? ["leverage-points", "intervention", "systems-change", "multiplicative-effect"] :
      lowerTitle.includes("bottleneck") ? ["constraint", "throughput", "optimization", "critical-path"] :
      ["systems-thinking", "complexity", "causality"];

    const keywords = [...new Set([...keywordMap[thermalState], ...contextKeywords])].slice(0, 6);

    return {
      id: `node-${Date.now()}`,
      title: crisisTitle,
      description: formalDefinitions[category],
      formalDefinition: formalDefinitions[category],
      keywords,
      thermalState,
      heat: thermalState === "ignition" ? 85 : thermalState === "warning" ? 55 : 25,
      integrity: thermalState === "ignition" ? 80 : thermalState === "warning" ? 50 : 20,
      userDefense: defense,
    };
  }

  /**
   * Validate game input
   */
  static validateInput(content: string): { valid: boolean; error?: string } {
    if (!content || content.trim().length === 0) {
      return { valid: false, error: "Content cannot be empty" };
    }
    if (content.length < 100) {
      return { valid: false, error: "Content must be at least 100 characters" };
    }
    return { valid: true };
  }

  /**
   * Calculate session completion metrics
   */
  static calculateMetrics(session: GameSession) {
    return {
      avgHeat: Math.round(session.globalHeat),
      avgIntegrity: Math.round(session.globalIntegrity),
      totalResponses: session.responses.length,
      masteredNodes: session.masteryCards.length,
      ignitionCount: session.responses.filter((r) => r.thermalResult === "ignition").length,
    };
  }
}
