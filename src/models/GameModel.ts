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
    return {
      id: `node-${Date.now()}`,
      title: crisisTitle,
      description: defense.substring(0, 100),
      thermalState,
      heat: thermalState === "ignition" ? 85 : thermalState === "warning" ? 55 : 25,
      integrity: thermalState === "ignition" ? 80 : thermalState === "warning" ? 50 : 20,
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
