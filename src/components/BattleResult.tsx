import { useEffect } from "react";
import { useCombatStore } from "@/store/combatStore";
import { useThermalStore } from "@/store/thermalStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BattleResultProps {
  onReset: () => void;
}

export default function BattleResult({ onReset }: BattleResultProps) {
  const { battle_state, nodeContext } = useCombatStore();
  const { updateNodeHeat, updateNodeIntegrity, recordNodeAttempt, units, saveToLocalStorage, solidifyMastery, loadFromLocalStorage } = useThermalStore();
  const router = useRouter();

  // Update node stats on victory
  useEffect(() => {
    if (battle_state?.is_victory && nodeContext) {
      const correctAnswers = battle_state.battle_log.filter((log) => log.was_correct).length;
      const totalEncounters = battle_state.boss.encounters.length;

      // Mark attempt as successful if accuracy >= 70%
      const accuracy = totalEncounters > 0 ? Math.round((correctAnswers / totalEncounters) * 100) : 0;
      const isSuccess = accuracy >= 70;

      // Always record the attempt
      recordNodeAttempt(nodeContext.unitId, nodeContext.nodeId, isSuccess);
      
      // Get current node to calculate new values
      const unit = units.find(u => u.id === nodeContext.unitId);
      const node = unit?.nodes.find(n => n.id === nodeContext.nodeId);
      
      if (node) {
        if (isSuccess) {
          // Increase heat and integrity on quiz victory
          updateNodeHeat(nodeContext.unitId, nodeContext.nodeId, Math.min(100, node.heat + 25));
          updateNodeIntegrity(nodeContext.unitId, nodeContext.nodeId, Math.min(100, node.integrity + 20));
        } else {
          // Slight integrity penalty on quiz failure
          updateNodeIntegrity(nodeContext.unitId, nodeContext.nodeId, Math.max(0, node.integrity - 10));
        }

        // Save to localStorage immediately
        saveToLocalStorage();
        
        // Log for debugging
        console.log("Quiz completed - Updated node stats:", {
          nodeId: nodeContext.nodeId,
          accuracy,
          isSuccess,
          newHeat: node.heat + (isSuccess ? 25 : 0),
          newIntegrity: node.integrity + (isSuccess ? 20 : -10),
        });
      }
    }
  }, [battle_state?.is_victory]);

  if (!battle_state) return null;

  const isVictory = battle_state.is_victory;
  const correctAnswers = battle_state.battle_log.filter(
    (log) => log.was_correct
  ).length;
  const totalEncounters = battle_state.boss.encounters.length;
  const accuracy = totalEncounters > 0 ? Math.round((correctAnswers / totalEncounters) * 100) : 0;

  // Check if node is ready to solidify (accuracy >= 85 and heat >= 80)
  const canSolidify = nodeContext && accuracy >= 85;

  const handleCloseQuiz = () => {
    // Ensure latest updates are saved and loaded
    saveToLocalStorage();
    loadFromLocalStorage();
    // Navigate with a small delay to ensure state is updated
    setTimeout(() => {
      router.push("/heatmap");
    }, 100);
  };

  const handleSolidifyMastery = () => {
    if (nodeContext) {
      solidifyMastery(nodeContext.unitId);
      saveToLocalStorage();
      loadFromLocalStorage();
      setTimeout(() => {
        router.push("/heatmap");
      }, 100);
    }
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

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: canSolidify && isVictory ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr", gap: "16px" }}>
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
          {canSolidify && isVictory && (
            <button 
              onClick={handleSolidifyMastery}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "var(--snap)",
                color: "white",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 0 16px rgba(255, 193, 7, 0.4)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = "0 0 24px rgba(255, 193, 7, 0.6)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = "0 0 16px rgba(255, 193, 7, 0.4)";
              }}
            >
              🔒 Solidify Mastery
            </button>
          )}
          <button onClick={onReset} className="btn-primary" style={{ width: "100%" }}>
            {isVictory ? (nodeContext ? "🎯 Another Quiz" : "⚔️ New Battle") : "⚔️ Try Again"}
          </button>
        </div>
      </div>
    </div>
  );
}
