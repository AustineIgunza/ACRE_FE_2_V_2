"use client";

import { useEffect, useState } from "react";
import { useArceStore } from "@/store/arceStore";
import { useCombatStore } from "@/store/combatStore";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BattleArena from "@/components/BattleArena";

export default function BattlePage() {
  const { user, authInitialized, initAuth } = useArceStore();
  const { battle_state, startBattle, resetBattle, is_loading, error: battleError } = useCombatStore();
  const router = useRouter();
  const [sourceContent, setSourceContent] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");

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

  const handleStartBattle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceContent.trim().length < 50) return;
    await startBattle(sourceContent, sourceTitle || "Battle Session");
  };

  const handleReset = () => {
    resetBattle();
    setSourceContent("");
    setSourceTitle("");
  };

  return (
    <div style={{ backgroundColor: "var(--p-surface)", minHeight: "100vh", color: "var(--t-mid)" }}>
      <Navbar />

      <main role="main" style={{ padding: "48px 24px 80px", maxWidth: "800px", margin: "0 auto" }}>
        
        {!battle_state ? (
          <>
            {/* Pre-Battle Setup */}
            <div style={{ marginBottom: "40px", animation: "slideUp 0.4s ease-out" }}>
              <span className="eyebrow" style={{ marginBottom: "12px", display: "inline-block" }}>
                BATTLE ARENA
              </span>
              <h1 style={{ fontSize: "36px", letterSpacing: "-1px", color: "var(--t-primary)", marginBottom: "8px" }}>
                Boss Battle Mode
              </h1>
              <p style={{ fontSize: "17px", color: "var(--t-secondary)" }}>
                Confront a boss that tests your knowledge in an intense multi-round encounter.
              </p>
            </div>

            <form
              onSubmit={handleStartBattle}
              className="folio-card"
              style={{
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                animation: "slideUp 0.6s ease-out",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="eyebrow" style={{ textAlign: "center" }}>
                  Study Material
                </label>
                <p style={{ textAlign: "center", fontSize: "14px", color: "var(--t-secondary)", marginBottom: "8px" }}>
                  Paste your notes to generate a boss battle
                </p>
                <textarea
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  placeholder="Enter your study material here... (minimum 50 characters)"
                  className="folio-input"
                  style={{
                    width: "100%",
                    minHeight: "140px",
                    resize: "vertical",
                    fontFamily: "inherit",
                    lineHeight: 1.6,
                  }}
                  disabled={is_loading}
                />
                <div style={{
                  textAlign: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: sourceContent.length >= 50 ? "var(--success)" : "var(--t-secondary)",
                }}>
                  {sourceContent.length} / 50 characters minimum
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="eyebrow" style={{ textAlign: "center" }}>
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder="e.g., Biology Final Boss"
                  className="folio-input"
                  style={{ width: "100%", textAlign: "center" }}
                  disabled={is_loading}
                />
              </div>

              <button
                type="submit"
                disabled={is_loading || sourceContent.trim().length < 50}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  fontSize: "14px",
                  opacity: is_loading || sourceContent.trim().length < 50 ? 0.5 : 1,
                  cursor: is_loading || sourceContent.trim().length < 50 ? "not-allowed" : "pointer",
                }}
              >
                {is_loading ? "Summoning Boss..." : "⚔️ Enter Battle Arena"}
              </button>

              {battleError && (
                <div style={{
                  padding: "16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--error-bg)",
                  color: "var(--error)",
                  fontSize: "14px",
                  fontWeight: 600,
                  textAlign: "center",
                }}>
                  {battleError}
                </div>
              )}
            </form>
          </>
        ) : (
          <>
            {/* Active Battle */}
            <div style={{ marginBottom: "24px", animation: "slideUp 0.4s ease-out" }}>
              <span className="eyebrow" style={{ marginBottom: "8px", display: "inline-block" }}>
                BATTLE IN PROGRESS
              </span>
            </div>
            
            <BattleArena />

            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <button onClick={handleReset} className="btn-ghost">
                ← Exit Battle
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
