"use client";

import { useEffect, useState } from "react";
import { useArceStore } from "@/store/arceStore";
import { useCombatStore } from "@/store/combatStore";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MultimodalInput from "@/components/MultimodalInput";
import BattleArena from "@/components/BattleArena";
import QuizMode from "@/components/QuizMode";
import LoadingScreen from "@/components/LoadingScreen";

export default function BattlePage() {
  const { user, authInitialized, initAuth } = useArceStore();
  const { battle_state, startBattle, resetBattle, is_loading, error: battleError, nodeContext, setNodeContext } = useCombatStore();
  const router = useRouter();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (authInitialized && !user) {
      router.push("/signin");
    }
  }, [user, authInitialized, router]);

  if (!authInitialized || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--p-surface)" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          border: "3px solid var(--p-border)", borderTopColor: "var(--snap)",
          animation: "spin 0.6s linear infinite"
        }} />
      </div>
    );
  }

  const handleStartBattle = async (payload: { text?: string; url?: string; file?: File }, title: string) => {
    await startBattle(payload, title);
    // Don't clear nodeContext here - we need it to determine whether to show QuizMode or BattleArena
  };

  const handleReset = () => {
    resetBattle();
    // Clear nodeContext when resetting so we go back to setup
    setNodeContext(null);
  };

  return (
    <div style={{ backgroundColor: "var(--p-surface)", minHeight: "100vh", color: "var(--t-mid)" }}>
      <Navbar />

      {/* Loading Screen for Question Generation */}
      {is_loading && (
        <LoadingScreen phase="evaluating" progress={50} />
      )}

      <main role="main" style={{ padding: "48px 24px 80px", maxWidth: "800px", margin: "0 auto" }}>
        
        {!battle_state ? (
          <>
            {/* Pre-Battle Setup */}
            <div style={{ marginBottom: "40px", animation: "slideUp 0.4s ease-out" }}>
              <span className="eyebrow" style={{ marginBottom: "12px", display: "inline-block" }}>
                {nodeContext ? "NODE QUIZ" : "BATTLE ARENA"}
              </span>
              <h1 style={{ fontSize: "36px", letterSpacing: "-1px", color: "var(--t-primary)", marginBottom: "8px" }}>
                {nodeContext ? `Quiz: ${nodeContext.nodeTitle}` : "Boss Battle Mode"}
              </h1>
              <p style={{ fontSize: "17px", color: "var(--t-secondary)" }}>
                {nodeContext
                  ? `Test your knowledge on "${nodeContext.nodeTopic}" with targeted questions`
                  : "Confront a boss that tests your knowledge in an intense multi-round encounter."
                }
              </p>

              {/* Node Context Display */}
              {nodeContext && (
                <div style={{
                  marginTop: "16px",
                  padding: "12px",
                  backgroundColor: "var(--p-surface)",
                  borderRadius: "8px",
                  borderLeft: "4px solid var(--snap)",
                  fontSize: "14px",
                  color: "var(--t-secondary)",
                }}>
                  <strong style={{ color: "var(--t-primary)" }}>📌 {nodeContext.nodeTopic}</strong> — {nodeContext.nodeTitle}
                </div>
              )}
            </div>

            <div style={{ width: "100%" }}>
              {nodeContext ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <button
                    onClick={() => handleStartBattle({ text: `Topic: ${nodeContext.nodeTopic}\n\nConcept: ${nodeContext.nodeTitle}` }, nodeContext.nodeTitle)}
                    disabled={is_loading}
                    style={{
                      width: "100%",
                      padding: "16px",
                      background: "linear-gradient(135deg, var(--snap) 0%, var(--xp) 100%)",
                      color: "white",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "15px",
                      border: "none",
                      cursor: is_loading ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      opacity: is_loading ? 0.6 : 1,
                      boxShadow: "0 4px 12px rgba(255, 92, 53, 0.2)",
                    }}
                    onMouseOver={(e) => !is_loading && (e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 92, 53, 0.3)")}
                    onMouseOut={(e) => !is_loading && (e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 92, 53, 0.2)")}
                  >
                    {is_loading ? "Generating questions..." : "🎯 Start Node Quiz"}
                  </button>
                  <button
                    onClick={() => setNodeContext(null)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "var(--p-surface)",
                      color: "var(--t-primary)",
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: "14px",
                      border: "1px solid var(--p-border)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--p-border)")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--p-surface)")}
                  >
                    ← Back to Custom Battle
                  </button>
                </div>
              ) : (
                <MultimodalInput onSubmit={handleStartBattle} isLoading={is_loading} buttonText="⚔️ Enter Battle Arena" />
              )}
              {battleError && (
                <div style={{ marginTop: "16px", padding: "16px", borderRadius: "8px", backgroundColor: "var(--error-bg)", color: "var(--error)", fontSize: "14px", fontWeight: 600, textAlign: "center" }}>
                  {battleError}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Active Battle/Quiz */}
            <div style={{ marginBottom: "24px", animation: "slideUp 0.4s ease-out" }}>
              <span className="eyebrow" style={{ marginBottom: "8px", display: "inline-block" }}>
                {nodeContext ? "NODE QUIZ IN PROGRESS" : "BATTLE IN PROGRESS"}
              </span>
            </div>
            
            {nodeContext ? <QuizMode /> : <BattleArena />}

            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <button onClick={handleReset} className="btn-ghost">
                ← {nodeContext ? "Back to Heatmap" : "Exit Battle"}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
