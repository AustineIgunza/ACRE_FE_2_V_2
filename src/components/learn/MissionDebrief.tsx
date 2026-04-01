"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useArceStore } from "@/store/arceStore";
import { useRouter } from "next/navigation";

export default function MissionDebrief() {
  const { session, document, resetGame } = useArceStore();
  const router = useRouter();

  const [displayedHeat, setDisplayedHeat] = useState(0);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);

  // Animated heat counter
  useEffect(() => {
    if (!session) return;
    const targetHeat = session.globalHeat;
    if (targetHeat <= 0) { setDisplayedHeat(0); return; }
    let start = 0;
    const increment = targetHeat / (1500 / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetHeat) {
        setDisplayedHeat(targetHeat);
        clearInterval(timer);
      } else {
        setDisplayedHeat(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [session]);

  if (!session || !document) return null;

  const toggleAccordion = (nodeId: string) => {
    setExpandedNodeId((prev) => (prev === nodeId ? null : nodeId));
  };

  const getAccuracyColor = (accuracy?: string) => {
    switch (accuracy) {
      case "ignition": return "#ff5c35";
      case "warning": return "#f59e0b";
      case "frost": return "#3b82f6";
      default: return "#8b5cf6";
    }
  };

  const getAccuracyLabel = (accuracy?: string) => {
    switch (accuracy) {
      case "ignition": return "IGNITED";
      case "warning": return "UNSTABLE";
      case "frost": return "FROST";
      default: return "NEUTRAL";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0c",
        color: "#f0f2ec",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "64px 24px",
        overflowY: "auto",
        position: "relative",
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: "-150px", left: "50%", transform: "translateX(-50%)",
        width: "80vh", height: "80vh",
        background: "radial-gradient(circle, rgba(255,92,53,0.07) 0%, transparent 60%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ maxWidth: "800px", width: "100%", zIndex: 1, paddingBottom: "100px" }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: "11px", letterSpacing: "4px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "16px" }}
          >
            Mission Debrief
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ fontFamily: "Georgia, serif", fontSize: "36px", fontWeight: 400, color: "#fff", marginBottom: "24px", lineHeight: 1.2 }}
          >
            {document.topic_title}
          </motion.h1>

          {/* Glowing Heat Counter */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            style={{
              display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              width: "160px", height: "160px", borderRadius: "50%",
              border: "2px solid rgba(255,92,53,0.2)",
              backgroundColor: "rgba(255,92,53,0.05)",
              boxShadow: "0 0 40px rgba(255,92,53,0.15), inset 0 0 20px rgba(255,92,53,0.1)",
              marginBottom: "16px",
            }}
          >
            <div style={{ fontSize: "42px", fontWeight: 800, color: "#ff5c35", fontFamily: "monospace", display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span>+</span>{displayedHeat}
            </div>
            <div style={{ fontSize: "11px", letterSpacing: "2px", color: "rgba(255,92,53,0.7)", textTransform: "uppercase", fontWeight: 600 }}>
              Session Heat
            </div>
          </motion.div>
        </div>

        {/* ── INTEL CARD ACCORDION ── */}
        <div style={{ marginBottom: "64px" }}>
          <h3 style={{
            fontSize: "13px", letterSpacing: "2px", color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase", marginBottom: "24px", textAlign: "center",
            borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "16px",
          }}>
            Forged Intel Matrix ({session.responses.length} Nodes)
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {session.responses.map((response, index) => {
              const card = response.intelCard;
              if (!card) return null;

              const isExpanded = expandedNodeId === card.nodeId;
              const color = getAccuracyColor(card.accuracy);

              return (
                <motion.div
                  key={card.nodeId}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  style={{
                    backgroundColor: isExpanded ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isExpanded ? color : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "12px", overflow: "hidden", transition: "all 0.3s ease",
                  }}
                >
                  {/* Header row */}
                  <button
                    onClick={() => toggleAccordion(card.nodeId)}
                    style={{
                      width: "100%", padding: "20px 24px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "none", border: "none", cursor: "pointer",
                      textAlign: "left", color: "#fff",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        backgroundColor: `${color}15`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color, fontSize: "12px", fontFamily: "monospace", fontWeight: 700,
                      }}>
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <span style={{ fontSize: "16px", fontWeight: 500, fontFamily: "Georgia, serif" }}>
                        {card.title}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "1px" }}>
                        {getAccuracyLabel(card.accuracy)} (+{card.heatDelta})
                      </span>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} style={{ color: "rgba(255,255,255,0.3)" }}>
                        ▼
                      </motion.div>
                    </div>
                  </button>

                  {/* Expandable content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{
                          padding: "24px", paddingTop: 0,
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                          marginTop: "8px",
                          display: "flex", flexDirection: "column", gap: "24px",
                        }}>
                          {/* Formal Mechanism */}
                          <div>
                            <span style={{ display: "block", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
                              Formal Mechanism
                            </span>
                            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: 0 }}>
                              {card.formalMechanism}
                            </p>
                          </div>

                          {/* So What? */}
                          <div>
                            <span style={{ display: "block", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
                              "So What?"
                            </span>
                            <div style={{
                              padding: "16px",
                              backgroundColor: `${color}10`,
                              borderLeft: `2px solid ${color}`,
                              color: "#f0f2ec", fontSize: "15px", lineHeight: 1.6,
                              fontFamily: "Georgia, serif", fontStyle: "italic",
                            }}>
                              {card.soWhat}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          style={{ display: "flex", gap: "16px", justifyContent: "center" }}
        >
          <button
            onClick={() => router.push("/heatmap")}
            style={{
              padding: "16px 32px", backgroundColor: "rgba(255,255,255,0.05)",
              color: "#fff", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px", fontSize: "12px", fontWeight: 700,
              letterSpacing: "1px", cursor: "pointer", transition: "all 0.2s",
            }}
          >
            VIEW KNOWLEDGE PORTFOLIO
          </button>

          <button
            onClick={resetGame}
            style={{
              padding: "16px 32px", backgroundColor: "#ff5c35",
              color: "#fff", border: "none", borderRadius: "8px",
              fontSize: "12px", fontWeight: 700, letterSpacing: "1px",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            INITIATE NEW EXTRACTION
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
