"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useArceStore } from "@/store/arceStore";

export default function InterleavingPhase() {
  const { currentScenario } = useArceStore();
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bridgingFeedback, setBridgingFeedback] = useState<string | null>(null);

  if (!currentScenario) return null;

  const nodeTitle = (currentScenario.nodeId || currentScenario.id)
    .split("-")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const handleSubmit = async () => {
    if (!response.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/interleaving", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId: currentScenario.nodeId || currentScenario.id,
          userResponse: response,
          nodeContext: {
            formalMechanism: currentScenario.formalMechanism || "",
            soWhat: (currentScenario as any).soWhat || "",
          },
        }),
      });
      const data = res.ok ? await res.json() : { feedback: "Connection noted. The mechanism you learned exists in many domains." };
      setBridgingFeedback(data.feedback);
    } catch {
      setBridgingFeedback("Sharp thinking. The invariant you just learned travels across domains — trust your intuition on where it shows up.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    useArceStore.setState({ currentPhase: "synchronization" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0c",
        color: "#e8e6e0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient */}
      <div style={{
        position: "absolute", bottom: "-150px", right: "-150px",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "720px" }}>
        {/* Eyebrow */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "10px 20px", borderRadius: "8px",
            backgroundColor: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.15)",
            marginBottom: "32px",
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#22c55e" }}
          />
          <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
            RELATABILITY CHECK
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(22px, 3vw, 34px)",
            fontWeight: 400, letterSpacing: "-0.8px",
            color: "#f0f2ec", marginBottom: "12px",
          }}
        >
          Connect this to something you already know.
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "32px" }}
        >
          How does <strong style={{ color: "rgba(255,255,255,0.8)" }}>{nodeTitle}</strong> relate to a domain you're already familiar with — a sport, hobby, game, or field you know well?
        </motion.p>

        <AnimatePresence mode="wait">
          {!bridgingFeedback ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="e.g. This reminds me of how in chess, sacrificing a piece (short-term loss) creates positional dominance (long-term gain) — the same trade-off logic applies here..."
                style={{
                  width: "100%", minHeight: "130px", padding: "18px 20px",
                  fontSize: "14px", lineHeight: 1.7, fontFamily: "inherit",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  color: "#f0f2ec", resize: "vertical", outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.35)"; e.currentTarget.style.backgroundColor = "rgba(34,197,94,0.04)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
                <span>{response.trim().split(/\s+/).filter(Boolean).length} words</span>
                <span>Min. ~20 words</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 28px rgba(34,197,94,0.25)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting || response.trim().split(/\s+/).filter(Boolean).length < 5}
                style={{
                  marginTop: "24px", width: "100%",
                  padding: "16px 32px", fontSize: "14px", fontWeight: 700,
                  letterSpacing: "1px", textTransform: "uppercase",
                  color: "#fff",
                  backgroundColor: response.trim() ? "#22c55e" : "rgba(34,197,94,0.3)",
                  border: "none", borderRadius: "10px",
                  cursor: isSubmitting || !response.trim() ? "not-allowed" : "pointer",
                  transition: "all 0.3s",
                }}
              >
                {isSubmitting ? "BRIDGING..." : "SUBMIT CONNECTION →"}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div style={{
                padding: "24px 28px", borderRadius: "14px",
                backgroundColor: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                marginBottom: "24px",
              }}>
                <p style={{ fontSize: "11px", color: "#22c55e", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>
                  ARCÉ BRIDGE ANALYSIS
                </p>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.85)", lineHeight: 1.75, margin: 0, fontStyle: "italic", fontFamily: "Georgia, serif" }}>
                  {bridgingFeedback}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 28px rgba(255,92,53,0.25)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                style={{
                  width: "100%",
                  padding: "16px 32px", fontSize: "14px", fontWeight: 700,
                  letterSpacing: "1px", textTransform: "uppercase",
                  color: "#fff", backgroundColor: "#ff5c35",
                  border: "none", borderRadius: "10px", cursor: "pointer",
                }}
              >
                NODE SYNCHRONIZED →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
