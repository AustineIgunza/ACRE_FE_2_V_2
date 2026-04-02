"use client";

import { useCombatStore } from "@/store/combatStore";
import Link from "next/link";

interface BattleResultProps {
  onReset: () => void;
}

export default function BattleResult({ onReset }: BattleResultProps) {
  const { battle_state } = useCombatStore();

  if (!battle_state) return null;

  const isVictory = battle_state.is_victory;
  const correctAnswers = battle_state.battle_log.filter(
    (log) => log.was_correct
  ).length;
  const totalEncounters = battle_state.boss.encounters.length;
  const accuracy = totalEncounters > 0 ? Math.round((correctAnswers / totalEncounters) * 100) : 0;

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      {/* Result Card */}
      <div className="folio-card" style={{
        padding: "48px 32px",
        textAlign: "center",
        borderLeft: `4px solid ${isVictory ? "var(--success)" : "var(--error)"}`,
        animation: "slideUp 0.6s ease-out",
      }}>
        {/* Icon & Title */}
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>
          {isVictory ? "🏆" : "💀"}
        </div>
        <h1 style={{
          fontSize: "36px",
          fontWeight: 700,
          color: "var(--t-primary)",
          letterSpacing: "-1px",
          marginBottom: "8px",
        }}>
          {isVictory ? "VICTORY!" : "DEFEAT"}
        </h1>
        <p style={{ fontSize: "17px", color: "var(--t-secondary)", marginBottom: "32px" }}>
          {isVictory ? "You defeated" : "Vanquished by"}{" "}
          <strong style={{ color: "var(--t-deep)" }}>{battle_state.boss.boss_name}</strong>
        </p>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
          marginBottom: "32px",
          padding: "24px",
          backgroundColor: "var(--p-surface)",
          borderRadius: "12px",
        }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--t-muted)", marginBottom: "8px" }}>
              Encounters
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--t-deep)" }}>
              {correctAnswers}/{totalEncounters}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--t-muted)", marginBottom: "8px" }}>
              Accuracy
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: accuracy >= 70 ? "var(--success)" : accuracy >= 40 ? "var(--warning)" : "var(--error)" }}>
              {accuracy}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--t-muted)", marginBottom: "8px" }}>
              Final HP
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--t-deep)" }}>
              {battle_state.player_hp}
            </div>
          </div>
        </div>

        {/* Battle Summary */}
        {battle_state.battle_log.length > 0 && (
          <div style={{
            padding: "20px",
            backgroundColor: "var(--p-surface)",
            borderRadius: "12px",
            marginBottom: "32px",
            textAlign: "left",
            maxHeight: "200px",
            overflowY: "auto",
          }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--t-deep)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Battle Summary
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {battle_state.battle_log.map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    backgroundColor: log.was_correct ? "var(--success-bg)" : "var(--error-bg)",
                  }}
                >
                  <span style={{ fontWeight: 600, color: log.was_correct ? "var(--success)" : "var(--error)" }}>
                    Turn {idx + 1}: {log.was_correct ? "✅ Correct" : "❌ Wrong"}
                  </span>
                  <span style={{ color: "var(--t-muted)" }}>
                    +{log.damage_dealt} dmg / -{log.damage_taken} hp
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message */}
        <p style={{ fontSize: "16px", color: "var(--t-mid)", marginBottom: "32px" }}>
          {isVictory
            ? "You've proven your mastery! Share your victory or challenge yourself again."
            : "Learn from this defeat. Review the concepts and return stronger."}
        </p>

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Link href="/dashboard">
            <button className="btn-ghost" style={{ width: "100%" }}>
              ← Dashboard
            </button>
          </Link>
          <button onClick={onReset} className="btn-primary" style={{ width: "100%" }}>
            {isVictory ? "⚔️ New Battle" : "⚔️ Try Again"}
          </button>
        </div>
      </div>
    </div>
  );
}
