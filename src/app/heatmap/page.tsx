"use client";

import { useEffect, useState } from "react";
import { useArceStore } from "@/store/arceStore";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function HeatmapPage() {
  const { user, authInitialized, initAuth, fetchProgress, userProgress, progressDetails } = useArceStore();
  const router = useRouter();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (authInitialized && !user) {
      router.push("/signin");
    } else if (authInitialized && user) {
      fetchProgress();
    }
  }, [user, authInitialized, router, fetchProgress]);

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

  const progressNodes = progressDetails;
  const totalConcepts = progressNodes.length;
  const masteredCount = progressNodes.filter(n => n.isIgnited).length;
  const averageHeat = totalConcepts > 0
    ? Math.round(progressNodes.reduce((sum, n) => sum + n.heatScore, 0) / totalConcepts)
    : 0;

  const getHeatColor = (heat: number) => {
    if (heat >= 100) return "var(--success)";
    if (heat > 50) return "var(--warning)";
    if (heat > 0) return "var(--error)";
    return "var(--t-muted)";
  };

  return (
    <div style={{ backgroundColor: "var(--p-surface)", minHeight: "100vh", color: "var(--t-mid)" }}>
      <Navbar />

      <main role="main" style={{ padding: "48px 24px 80px", maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "40px", animation: "slideUp 0.4s ease-out" }}>
          <span className="eyebrow" style={{ marginBottom: "12px", display: "inline-block" }}>
            HEATMAP
          </span>
          <h1 style={{ fontSize: "36px", letterSpacing: "-1px", color: "var(--t-primary)", marginBottom: "8px" }}>
            Your Mastery Heatmap
          </h1>
          <p style={{ fontSize: "17px", color: "var(--t-secondary)" }}>
            Visualize your progress across every concept you have studied.
          </p>
        </div>

        {/* Summary Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px", animation: "slideUp 0.5s ease-out" }}>
          <div className="folio-card" style={{ padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--snap)", lineHeight: 1 }}>{totalConcepts}</div>
            <p style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--t-muted)", letterSpacing: "1px", margin: "8px 0 0 0" }}>Concepts</p>
          </div>
          <div className="folio-card" style={{ padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--success)", lineHeight: 1 }}>{masteredCount}</div>
            <p style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--t-muted)", letterSpacing: "1px", margin: "8px 0 0 0" }}>Mastered</p>
          </div>
          <div className="folio-card" style={{ padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--xp)", lineHeight: 1 }}>{averageHeat}%</div>
            <p style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--t-muted)", letterSpacing: "1px", margin: "8px 0 0 0" }}>Avg Heat</p>
          </div>
        </div>

        {/* Node List from Database */}
        {progressNodes.length > 0 ? (
          <div style={{ animation: "slideUp 0.6s ease-out" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--t-deep)", marginBottom: "16px" }}>All Concept Nodes</h3>
            <div className="folio-card" style={{ padding: "0", overflow: "hidden" }}>
              {progressNodes
                .sort((a, b) => b.heatScore - a.heatScore)
                .map((node, i) => (
                <div
                  key={node.nodeId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 24px",
                    borderBottom: i < progressNodes.length - 1 ? "1px solid var(--p-border)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "8px",
                      backgroundColor: node.isIgnited ? "var(--success-bg)" : "var(--p-surface)",
                      color: node.isIgnited ? "var(--success)" : "var(--t-muted)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "16px", fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {node.isIgnited ? "🔥" : "○"}
                    </div>
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--t-deep)" }}>
                        {node.nodeId
                          .replace(/^(node|scenario|concept)[-_]?/i, "")
                          .replace(/[-_]/g, " ")
                          .replace(/\b\w/g, c => c.toUpperCase())
                          || `Concept ${node.nodeId}`}
                      </span>
                      <div style={{ fontSize: "12px", color: "var(--t-muted)", marginTop: "2px" }}>
                        Last attempt: {new Date(node.lastAttempt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "80px", height: "8px", borderRadius: "4px", backgroundColor: "var(--p-border)", overflow: "hidden" }}>
                      <div style={{
                        width: `${Math.min(node.heatScore, 100)}%`, height: "100%", borderRadius: "4px",
                        backgroundColor: getHeatColor(node.heatScore),
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--t-deep)", width: "40px", textAlign: "right" }}>
                      {node.heatScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="folio-card" style={{ padding: "48px", textAlign: "center", animation: "slideUp 0.6s ease-out" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗺️</div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--t-deep)", marginBottom: "8px" }}>No data yet</h3>
            <p style={{ fontSize: "15px", color: "var(--t-secondary)", marginBottom: "24px" }}>
              Complete learning sessions to start populating your heatmap with mastery data.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
