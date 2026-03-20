"use client";

import { useState } from "react";
import { useCombatStore } from "@/store/combatStore";
import HealthBar from "./UI/HealthBar";
import EncounterCard from "./UI/EncounterCard";
import BattleResult from "./BattleResult";

/**
 * BattleArena Component
 * Manages the boss fight UI, health bars, and local feedback delay
 */
export default function BattleArena() {
  const {
    battle_state,
    current_encounter,
    player_hp_percent,
    boss_hp_percent,
    is_loading,
    resetBattle,
    submitAnswer,
  } = useCombatStore();

  const [localFeedback, setLocalFeedback] = useState<{
    choice: string;
    isCorrect: boolean;
  } | null>(null);

  if (!battle_state) {
    return (
      <div style={{ textAlign: "center", padding: "48px" }}>
        <div className="folio-loader" style={{ margin: "0 auto 16px" }} />
        <p className="eyebrow">Summoning the Boss...</p>
      </div>
    );
  }

  // Battle is over — show victory or defeat
  // We ONLY show the result if we aren't currently showing local feedback from the final move
  if ((battle_state.is_victory || battle_state.is_defeat) && !localFeedback) {
    return <BattleResult onReset={resetBattle} />;
  }

  const handleChoice = async (choice: "A" | "B" | "C" | "D") => {
    if (!current_encounter || localFeedback) return;
    
    const isCorrect = choice === current_encounter.correct_option;
    setLocalFeedback({ choice, isCorrect });

    // Wait 2 seconds so the user can see the feedback before the store updates the turn
    setTimeout(async () => {
      await submitAnswer(current_encounter.id, choice);
      setLocalFeedback(null);
    }, 2000);
  };

  // If we finished all encounters and aren't showing feedback, but store isn't victory yet
  if (!current_encounter && !localFeedback) {
    return (
      <div style={{ textAlign: "center", padding: "48px" }}>
        <div className="folio-loader" style={{ margin: "0 auto 16px" }} />
        <p className="eyebrow">Finalizing Battle Results...</p>
      </div>
    );
  }

  // At this point, current_encounter is guaranteed to exist OR we are currently showing local feedback 
  // (if localFeedback is active, current_encounter might be null IF the store update arrived, 
  // but usually we want to keep the card visible).
  
  // To keep the UI stable during the feedback delay, we use the last known encounter
  const displayEncounter = current_encounter;
  
  if (!displayEncounter) return null;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Boss Introduction */}
      {battle_state.current_encounter_index === 0 && !localFeedback && (
        <div className="folio-card" style={{
          marginBottom: "32px",
          padding: "32px",
          textAlign: "center",
          borderLeft: "4px solid var(--xp)",
        }}>
          <h2 style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "var(--t-deep)",
            marginBottom: "12px",
          }}>
            ⚔️ {battle_state.boss.boss_name}
          </h2>
          <p style={{ fontSize: "15px", color: "var(--t-mid)", lineHeight: 1.7 }}>
            {battle_state.boss.intro_narrative}
          </p>
          <p style={{
            fontSize: "13px",
            color: "var(--t-muted)",
            marginTop: "16px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}>
            Encounter {battle_state.current_encounter_index + 1} of{" "}
            {battle_state.boss.encounters.length}
          </p>
        </div>
      )}

      {/* Health Bars */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--t-deep)" }}>Your HP</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--t-secondary)" }}>
              {battle_state.player_hp} / {battle_state.max_player_hp}
            </span>
          </div>
          <div className="progress-container" style={{ height: "12px" }}>
            <div className="progress-fill" style={{
              width: `${player_hp_percent}%`,
              backgroundColor: player_hp_percent > 50 ? "var(--snap)" : player_hp_percent > 25 ? "var(--warning)" : "var(--error)",
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: "18px", fontWeight: 700, color: "var(--t-muted)", margin: "12px 0" }}>VS</div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--t-deep)" }}>
              {battle_state.boss.boss_name}
            </span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--t-secondary)" }}>
              {battle_state.boss_hp} / {battle_state.max_boss_hp}
            </span>
          </div>
          <div className="progress-container" style={{ height: "12px" }}>
            <div className="progress-fill" style={{
              width: `${boss_hp_percent}%`,
              backgroundColor: "var(--error)",
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      </div>

      {/* Encounter Card */}
      <div className="folio-card" style={{ padding: "32px", marginBottom: "24px", position: "relative" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--t-deep)", marginBottom: "20px" }}>
          ⚡ Scenario
        </h3>
        <p style={{ fontSize: "15px", color: "var(--t-mid)", lineHeight: 1.7, marginBottom: "28px", whiteSpace: "pre-line" }}>
          {displayEncounter.scenario}
        </p>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {(["A", "B", "C", "D"] as const)
            .filter(key => displayEncounter.options[key] && !displayEncounter.options[key].includes("N/A"))
            .map((key) => (
            <button
              key={key}
              onClick={() => handleChoice(key)}
              disabled={is_loading || !!localFeedback}
              className="btn-ghost"
              style={{
                textAlign: "left",
                padding: "16px 20px",
                fontSize: "14px",
                lineHeight: 1.5,
                opacity: (is_loading || !!localFeedback) ? (localFeedback?.choice === key ? 1 : 0.5) : 1,
                cursor: (is_loading || !!localFeedback) ? "not-allowed" : "pointer",
                border: localFeedback?.choice === key 
                  ? `2px solid ${localFeedback.isCorrect ? "var(--success)" : "var(--error)"}`
                  : undefined,
                backgroundColor: localFeedback?.choice === key 
                  ? (localFeedback.isCorrect ? "var(--success-bg)" : "var(--error-bg)")
                  : undefined,
              }}
            >
              <span style={{ fontWeight: 700, marginRight: "8px", color: "var(--snap)" }}>{key}.</span>
              {displayEncounter.options[key]}
            </button>
          ))}
        </div>

        {/* Local Feedback Message */}
        {localFeedback && (
          <div style={{
            marginTop: "24px",
            padding: "24px",
            borderRadius: "12px",
            backgroundColor: localFeedback.isCorrect ? "var(--success-bg)" : "var(--error-bg)",
            color: localFeedback.isCorrect ? "var(--success)" : "var(--error)",
            fontWeight: 700,
            textAlign: "center",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            animation: "pulse 1s infinite alternate",
          }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>
              {localFeedback.isCorrect ? "🎯" : "💥"}
            </div>
            <div style={{ fontSize: "18px", marginBottom: "4px" }}>
              {localFeedback.isCorrect ? "CRITICAL HIT!" : "MISS!"}
            </div>
            <p style={{ fontSize: "14px", fontWeight: 600 }}>
              {localFeedback.isCorrect 
                ? displayEncounter.win_feedback 
                : displayEncounter.loss_feedback}
            </p>
          </div>
        )}
      </div>

      {/* Battle Log */}
      {battle_state.battle_log.length > 0 && (
        <div className="folio-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--t-deep)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
            ⚔️ Battle Log
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
            {[...battle_state.battle_log].reverse().map((log, idx) => (
              <div
                key={idx}
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  backgroundColor: log.was_correct ? "var(--success-bg)" : "var(--error-bg)",
                  color: log.was_correct ? "var(--success)" : "var(--error)",
                  fontWeight: 600,
                }}
              >
                <span style={{ fontWeight: 700 }}>Turn {battle_state.battle_log.length - idx}:</span>{" "}
                {log.was_correct ? "✅ Critical Hit!" : "❌ Miss"} ({log.damage_dealt} dmg to boss, {log.damage_taken} dmg to you)
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
