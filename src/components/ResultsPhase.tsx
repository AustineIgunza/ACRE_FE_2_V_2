"use client";

import { GameSession } from "@/types/arce";
import MasteryCanvas from "./MasteryCanvas";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ResultsPhaseProps {
  session: GameSession;
  onNewGame?: () => void;
}

// Custom hook to animate numbers
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
}

export default function ResultsPhase({ session, onNewGame }: ResultsPhaseProps) {
  const animatedHeat = useCountUp(session.globalHeat, 2500);
  const totalXPNum = session.globalHeat * 10 + session.masteryCards.length * 50;
  const animatedXP = useCountUp(totalXPNum, 3000);

  const shareToWhatsApp = () => {
    const text = `I just earned ${totalXPNum} XP on Learn Forge!\n\nTopic: ${session.sourceTitle}\nMastery Rate: ${session.globalHeat}%\n\nCan you beat my score?`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareToTwitter = () => {
    const text = `Just crushed "${session.sourceTitle}" on Learn Forge — earned ${totalXPNum} XP!\n\nMastered ${session.masteryCards.length} concepts through critical thinking challenges.\n\nWho can beat this? #LearnForge #Learning`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--p-white)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "48px 24px 80px",
    }}>
      {/* ── HEADER ENTRY ── */}
      <div style={{ textAlign: "center", marginBottom: "64px", animation: "slideUp 0.6s ease-out" }}>
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "var(--xp)",
          color: "white",
          fontSize: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          animation: "scaleBounce 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}>
          ⚡
        </div>
        <span className="eyebrow" style={{ marginBottom: "16px", display: "inline-block" }}>SESSION COMPLETE</span>
        <h1 style={{
          fontSize: "48px",
          letterSpacing: "-1px",
          marginBottom: "16px",
          color: "var(--t-primary)",
        }}>
          Lesson Complete!
        </h1>
        <p style={{ fontSize: "18px", color: "var(--t-secondary)" }}>
          {session.sourceTitle}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%", maxWidth: "800px" }}>
        
        {/* ── XP & STREAK (Hero Stats) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", animation: "slideUp 0.8s ease-out" }}>
          <div className="folio-card" style={{ textAlign: "center", padding: "40px 24px" }}>
            <span className="eyebrow" style={{ marginBottom: "12px" }}>XP Earned</span>
            <div className="stat-xp" style={{ fontSize: "48px", marginBottom: "8px" }}>
              +{animatedXP}
            </div>
            <p style={{ fontSize: "14px", color: "var(--t-secondary)", margin: 0, fontWeight: 500 }}>
              Total Experience
            </p>
          </div>
          
          <div className="folio-card" style={{ textAlign: "center", padding: "40px 24px" }}>
            <span className="eyebrow" style={{ marginBottom: "12px" }}>Mastery Heat</span>
            <div className="stat-primary" style={{ fontSize: "48px", marginBottom: "8px" }}>
              {animatedHeat}%
            </div>
            <p style={{ fontSize: "14px", color: "var(--t-secondary)", margin: 0, fontWeight: 500 }}>
              Accuracy & Depth
            </p>
          </div>
        </div>

        {/* ── MASTERY CARDS LIST ── */}
        {session.masteryCards.length > 0 && (
          <div style={{ animation: "slideUp 1s ease-out" }}>
            <h3 style={{ fontSize: "20px", marginBottom: "20px", fontWeight: 700, color: "var(--t-primary)" }}>Concepts Mastered</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {session.masteryCards.map((card) => (
                <div key={card.id} className="folio-card" style={{ borderLeft: "4px solid var(--xp)", padding: "24px" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>
                    {(() => {
                      // Find the node title from session clusters
                      const foundNode = session.clusters
                        .flatMap(c => c.nodes)
                        .find(n => n.id === card.nodeId);
                      return foundNode?.title || card.nodeId;
                    })()}
                  </h4>
                  <p style={{ fontSize: "14px", color: "var(--t-mid)", lineHeight: 1.6, marginBottom: "16px" }}>
                    {card.formalDefinition}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {card.keywords.map((kw, i) => (
                      <span key={i} style={{ fontSize: "12px", fontWeight: 600, background: "var(--p-surface)", padding: "4px 10px", borderRadius: "100px", color: "var(--t-secondary)" }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESPONSE JOURNEY ── */}
        {session.responses.length > 0 && (
          <div style={{ animation: "slideUp 1.2s ease-out" }}>
            <h3 style={{ fontSize: "20px", marginBottom: "20px", fontWeight: 700, color: "var(--t-primary)" }}>Your Journey</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "var(--p-surface)", padding: "24px", borderRadius: "16px" }}>
              {session.responses.map((res, i) => {
                const isIce = res.thermalResult === "frost";
                const isWarn = res.thermalResult === "warning";
                const isFire = res.thermalResult === "ignition";
                return (
                  <div key={res.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--p-white)", padding: "16px", borderRadius: "10px", border: "1px solid var(--p-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ 
                        width: "32px", height: "32px", borderRadius: "8px", 
                        display: "flex", alignItems: "center", justifyContent: "center", 
                        background: isFire ? "var(--success-bg)" : isWarn ? "var(--warning-bg)" : "var(--error-bg)",
                        color: isFire ? "var(--success)" : isWarn ? "var(--warning)" : "var(--error)",
                        fontWeight: 700
                      }}>
                        {i + 1}
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--t-deep)" }}>
                        Scenario Depth: {res.defense.length} chars
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: "12px", fontWeight: 700, textTransform: "uppercase",
                      color: isFire ? "var(--success)" : isWarn ? "var(--warning)" : "var(--error)"
                    }}>
                      {isFire ? "Mastered" : isWarn ? "Needs Review" : "Missed"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ACTIONS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginTop: "24px", animation: "slideUp 1.4s ease-out" }}>
          <Link href="/dashboard">
            <button className="btn-ghost" style={{ textAlign: "center", width: "100%" }}>
              ← Dashboard
            </button>
          </Link>
          <button onClick={shareToTwitter} className="btn-ghost" style={{ textAlign: "center" }}>
            𝕏 Share Results
          </button>
          <button onClick={onNewGame} className="btn-primary" style={{ textAlign: "center" }}>
            Continue Learning
          </button>
        </div>

      </div>

      {/* Mastery Canvas */}
      <div style={{ width: "100%", marginTop: "64px", opacity: 0.8, filter: "grayscale(0.5)" }}>
        <MasteryCanvas clusters={session.clusters} />
      </div>
    </div>
  );
}
