import { useEffect, useState } from "react";
import { useCombatStore } from "@/store/combatStore";
import { useThermalStore } from "@/store/thermalStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BattleResultProps {
  onReset: () => void;
}

export default function BattleResult({ onReset }: BattleResultProps) {
  const { battle_state, nodeContext } = useCombatStore();
  const { updateNodeStats, fetchThermalLibrary } = useThermalStore();
  const router = useRouter();
  const [hasUpdated, setHasUpdated] = useState(false);

  const isVictory = battle_state?.is_victory || false;
  const correctAnswers = battle_state?.battle_log.filter(
    (log) => log.was_correct
  ).length || 0;
  const totalEncounters = battle_state?.boss.encounters.length || 0;
  const accuracy = totalEncounters > 0 ? Math.round((correctAnswers / totalEncounters) * 100) : 0;

  // Sync stats to db on victory screen
  useEffect(() => {
    if (battle_state && nodeContext && !hasUpdated) {
      const isSuccess = accuracy >= 70;
      updateNodeStats(nodeContext.unitId, nodeContext.nodeId, isSuccess).then(() => {
        fetchThermalLibrary();
      });
      setHasUpdated(true);
    } else if (battle_state && !hasUpdated && !nodeContext) {
      // Just fetch if there's no node context to update
      fetchThermalLibrary();
      setHasUpdated(true);
    }
  }, [battle_state, nodeContext, hasUpdated, updateNodeStats, fetchThermalLibrary, accuracy]);

  if (!battle_state) return null;

  const handleCloseQuiz = () => {
    // Navigate with a small delay to ensure state is updated
    setTimeout(() => {
      router.push("/heatmap");
    }, 100);
  };

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
            ? nodeContext
              ? "🎯 Node quiz completed! Your mastery score has been updated."
              : "You've proven your mastery! Share your victory or challenge yourself again."
            : nodeContext
              ? "Learn from this quiz. Review the concept and try again."
              : "Learn from this defeat. Review the concepts and return stronger."}
        </p>

        {/* Node Context Display */}
        {nodeContext && (
          <div style={{
            marginBottom: "24px",
            padding: "12px",
            backgroundColor: "var(--p-surface)",
            borderRadius: "8px",
            borderLeft: "4px solid var(--snap)",
            fontSize: "13px",
            color: "var(--t-secondary)",
          }}>
            <strong style={{ color: "var(--t-primary)" }}>📌 {nodeContext.nodeTopic}</strong> — {nodeContext.nodeTitle}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: isVictory ? "1fr 1fr 1fr" : "1fr 1fr", gap: "16px" }}>
          {nodeContext && isVictory && (
            <button 
              onClick={handleCloseQuiz}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "var(--error)",
                color: "white",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              title="Close and return to heatmap"
            >
              ✕ Close
            </button>
          )}
          <Link href={nodeContext ? "/heatmap" : "/dashboard"}>
            <button className="btn-ghost" style={{ width: "100%" }}>
              ← {nodeContext ? "Heatmap" : "Dashboard"}
            </button>
          </Link>
          <button onClick={onReset} className="btn-primary" style={{ width: "100%" }}>
            {isVictory ? (nodeContext ? "🎯 Another Quiz" : "⚔️ New Battle") : "⚔️ Try Again"}
          </button>
        </div>
      </div>
    </div>
  );
}
