/**
 * ACRE: Combat Schema - The API Contract
 * This is the exact JSON structure that Backend sends to Frontend
 * 
 * CRITICAL: Both teams must align on this by end of Day 1
 */

export interface CombatEncounter {
  id: number;
  scenario: string; // The "crisis" the user must solve
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_option: "A" | "B" | "C" | "D";
  win_feedback: string; // Why this answer shows mastery
  loss_feedback: string; // The learning insight (NOT just "wrong")
}

export interface CombatBoss {
  boss_name: string;
  intro_narrative: string; // Story context before the fight
  encounters: CombatEncounter[];
}

export interface BattleState {
  boss: CombatBoss;
  current_encounter_index: number;
  player_hp: number;
  boss_hp: number;
  max_player_hp: number;
  max_boss_hp: number;
  battle_log: BattleLog[];
  is_victory: boolean;
  is_defeat: boolean;
}

export interface BattleLog {
  timestamp: number;
  encounter_id: number;
  player_choice: "A" | "B" | "C" | "D";
  was_correct: boolean;
  damage_dealt: number;
  damage_taken: number;
  feedback: string;
}

/**
 * EXAMPLE: What the Backend will send on Day 2
 */
export const EXAMPLE_COMBAT_BOSS: CombatBoss = {
  boss_name: "The Passive Consumer",
  intro_narrative:
    "You are a builder trying to master Volume Negates Luck. The Passive Consumer stands before you—a manifestation of shallow learning. Defeat it by proving you understand the deep mechanics.",
  encounters: [
    {
      id: 1,
      scenario:
        "You have two choices: Spend 4 weeks perfecting one version, or build 10 'ugly' versions in 4 weeks and test them all. Why is Choice 2 mathematically more likely to result in higher quality?",
      options: {
        A: "Because luck favors the bold.",
        B: "Because you get more chances to be lucky.",
        C: "Because by the 10th attempt, you're a completely different builder. Quality is a byproduct of high-volume reps, not a starting condition.",
        D: "Because 10 is greater than 1.",
      },
      correct_option: "C",
      win_feedback:
        "🔥 CRITICAL HIT! You understand that the person who does it 10 times IS different. Mastery confirmed.",
      loss_feedback:
        "The boss laughs. You're still thinking luck matters. The truth: repetition is the forge. Volume doesn't negate luck—it transcends the need for luck.",
    },
    {
      id: 2,
      scenario:
        "A student asks you: 'Should I focus on hard problems or easy problems first?' You answer:",
      options: {
        A: "Start with the hardest problems to build strength.",
        B: "Start with easy problems to build confidence, then increase difficulty.",
        C: "Volume > difficulty. Do 100 easy problems before 1 hard problem. Each rep is a rep. The person after 100 reps is different.",
        D: "It doesn't matter.",
      },
      correct_option: "C",
      win_feedback:
        "🔥 DEVASTATING BLOW! You've transcended the complexity trap. Volume is the real variable.",
      loss_feedback:
        "The boss smiles. You're still optimizing for difficulty. Wrong variable. The real variable is: How many reps until you're a different thinker?",
    },
  ],
};

/**
 * Backend API Endpoints (Frontend will call these)
 */

// POST /api/battle/start
export interface StartBattleRequest {
  source_content: string; // User pastes notes/transcript here
  source_title?: string;
}

export interface StartBattleResponse {
  success: boolean;
  battle_state: BattleState;
  error?: string;
}

// POST /api/battle/answer
export interface SubmitAnswerRequest {
  battle_session_id: string;
  encounter_id: number;
  player_choice: "A" | "B" | "C" | "D";
}

export interface SubmitAnswerResponse {
  success: boolean;
  was_correct: boolean;
  damage_dealt: number; // To boss
  damage_taken: number; // To player
  feedback: string;
  new_battle_state: BattleState;
  error?: string;
}

/**
 * Frontend State Management (Zustand store)
 */
export interface CombatStore {
  // State
  battle_session_id: string | null;
  battle_state: BattleState | null;
  is_loading: boolean;
  error: string | null;

  // Actions
  startBattle: (payload: { text?: string; url?: string; file?: File }, sourceTitle?: string) => Promise<void>;
  submitAnswer: (
    encounterId: number,
    choice: "A" | "B" | "C" | "D"
  ) => Promise<void>;
  resetBattle: () => void;


}
