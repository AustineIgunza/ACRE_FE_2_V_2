/**
 * ARCÉ Game Controller
 * Orchestrates game flow and handles user interactions
 */

import { GameModel } from "@/models/GameModel";
import { useArceStore } from "@/store/arceStore";
import { CrisisScenario, GameSession } from "@/types/arce";

export class GameController {
  /**
   * Initialize a new game session
   */
  static initializeGame(sourceContent: string, sourceTitle: string): void {
    const validation = GameModel.validateInput(sourceContent);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid input");
    }

    const store = useArceStore.getState();
    store.startGame({ text: sourceContent }, sourceTitle);
  }

  /**
   * Process player action selection
   */
  static selectAction(actionId: string): void {
    const store = useArceStore.getState();
    store.selectAction(actionId);
  }

  /**
   * Show defense textbox
   */
  static showDefenseBox(): void {
    const store = useArceStore.getState();
    store.showDefense();
  }

  /**
   * Submit defense and calculate thermal state
   */
  static async submitDefense(defenseText: string): Promise<void> {
    const store = useArceStore.getState();
    const { currentScenario } = store;

    if (!currentScenario) {
      throw new Error("No active scenario");
    }

    const validation = GameModel.validateInput(defenseText);
    if (!validation.valid) {
      throw new Error("Defense must be at least 20 characters");
    }

    // Submit defense to store (which handles thermal state calculation)
    await store.submitDefense(defenseText);
  }

  /**
   * Advance to next crisis
   */
  static nextCrisis(): void {
    const store = useArceStore.getState();
    store.nextNode();
  }

  /**
   * Reset game session
   */
  static resetGame(): void {
    const store = useArceStore.getState();
    store.resetGame();
  }

  /**
   * Get current game metrics
   */
  static getMetrics() {
    const store = useArceStore.getState();
    if (!store.gameSession) return null;
    return GameModel.calculateMetrics(store.gameSession);
  }

  /**
   * Share results to social media
   */
  static shareToWhatsApp(session: GameSession): void {
    const text = `I just mastered "${session.sourceTitle}" on ARCÉ!

Heat: ${session.globalHeat}%
Integrity: ${session.globalIntegrity}%
Responses: ${session.responses.length}

Can you beat my score? Try ARCÉ now!`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  /**
   * Share results to Twitter
   */
  static shareToTwitter(session: GameSession): void {
    const text = `Just crushed "${session.sourceTitle}" on ARCÉ - The Iteration Engine!

Final Heat: ${session.globalHeat}%
Mastered ${session.masteryCards.length} concepts through crisis scenarios.

Who can beat this? #ARCÉ #Mastery`;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }
}
