"use client";

import { useCombatStore } from "@/store/combatStore";
import EncounterCard from "./UI/EncounterCard";
import BattleResult from "./BattleResult";

/**
 * QuizMode Component
 * Displays a simple quiz interface without boss battle mechanics
 * Used for node-specific quizzes
 */
export default function QuizMode() {
  const {
    battle_state,
    is_loading,
    resetBattle,
  } = useCombatStore();

  const current_encounter = battle_state?.boss.encounters[battle_state.current_encounter_index] || null;

  if (!battle_state) {
    return (
      <div style={{ textAlign: "center", padding: "48px" }}>
        <div className="folio-loader" style={{ margin: "0 auto 16px" }} />
        <p className="eyebrow">Loading quiz...</p>
      </div>
    );
  }

  // Quiz is over — show result
  if ((battle_state.is_victory || battle_state.is_defeat)) {
    return <BattleResult onReset={resetBattle} />;
  }

  // If we finished all encounters but result isn't set yet
  if (!current_encounter) {
    return (
      <div style={{ textAlign: "center", padding: "48px" }}>
        <div className="folio-loader" style={{ margin: "0 auto 16px" }} />
        <p className="eyebrow">Processing results...</p>
      </div>
    );
  }

  const totalEncounters = battle_state.boss.encounters.length;
  const currentIndex = battle_state.current_encounter_index + 1;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Quiz Header */}
      <div style={{
        marginBottom: "32px",
        padding: "16px",
        backgroundColor: "var(--p-surface)",
        borderRadius: "8px",
        borderLeft: "4px solid var(--snap)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span className="eyebrow">Question {currentIndex} of {totalEncounters}</span>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-secondary)" }}>
            {Math.round((currentIndex / totalEncounters) * 100)}% complete
          </span>
        </div>
        <div style={{
          width: "100%",
          height: "4px",
          backgroundColor: "var(--p-border)",
          borderRadius: "2px",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            backgroundColor: "var(--snap)",
            width: `${(currentIndex / totalEncounters) * 100}%`,
            transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* Question Card */}
      <EncounterCard
        encounter={current_encounter}
        is_loading={is_loading}
      />

      {/* Question Count */}
      <div style={{
        textAlign: "center",
        marginTop: "24px",
        fontSize: "12px",
        color: "var(--t-secondary)",
      }}>
        {currentIndex} / {totalEncounters} questions answered
      </div>
    </div>
  );
}
