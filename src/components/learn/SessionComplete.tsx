"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useArceStore } from "@/store/arceStore";
import { useRouter } from "next/navigation";

export default function SessionComplete() {
  const { gameSession, nodeResults, resetGame, saveHeatmapData } = useArceStore();
  const router = useRouter();
  const [totalHeat, setTotalHeat] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!gameSession) return;

    // Save heatmap data immediately
    saveHeatmapData();

    // Calculate stats from nodeResults
    if (nodeResults && Object.keys(nodeResults).length > 0) {
      const heat = Object.values(nodeResults).reduce(
        (sum, result) => sum + (result.heatScore || 0),
        0
      );
      const correct = Object.values(nodeResults).filter(
        (result) => result.accuracy === "ignition"
      ).length;

      setTotalHeat(heat);
      setCorrectCount(correct);
    }
  }, [gameSession, nodeResults, saveHeatmapData]);

  const handleViewDashboard = async () => {
    setRedirecting(true);
    // Give animations time to play
    await new Promise((resolve) => setTimeout(resolve, 500));
    resetGame();
    router.push("/dashboard");
  };

  const totalNodes = Object.keys(nodeResults || {}).length;
  const accuracy = totalNodes > 0 ? Math.round((correctCount / totalNodes) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0c",
        padding: "48px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: "600px", textAlign: "center" }}>
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          style={{
            fontSize: "80px",
            marginBottom: "24px",
          }}
        >
          {accuracy >= 70 ? "🎯" : accuracy >= 40 ? "📈" : "🔄"}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "#f0f2ec",
            marginBottom: "12px",
            fontFamily: "Georgia, serif",
          }}
        >
          {accuracy >= 70
            ? "Mastery Achieved!"
            : accuracy >= 40
            ? "Good Progress!"
            : "Keep Learning!"}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: "16px",
            color: "#b0b0c0",
            marginBottom: "40px",
            lineHeight: 1.6,
          }}
        >
          {accuracy >= 70
            ? "You've unlocked deep understanding of these concepts."
            : accuracy >= 40
            ? "You're building solid foundations. Keep pushing!"
            : "Review the concepts and try again to strengthen your mastery."}
        </motion.p>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {/* Accuracy */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              padding: "24px",
              background: "rgba(255, 92, 53, 0.1)",
              border: "1px solid rgba(255, 92, 53, 0.3)",
              borderRadius: "12px",
            }}
          >
            <div style={{ fontSize: "32px", fontWeight: 700, color: "#ff5c35", lineHeight: 1 }}>
              {accuracy}%
            </div>
            <p style={{ fontSize: "12px", color: "#b0b0c0", margin: "8px 0 0 0", textTransform: "uppercase", letterSpacing: "1px" }}>
              Accuracy
            </p>
          </motion.div>

          {/* Heat Score */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              padding: "24px",
              background: "rgba(255, 92, 53, 0.1)",
              border: "1px solid rgba(255, 92, 53, 0.3)",
              borderRadius: "12px",
            }}
          >
            <div style={{ fontSize: "32px", fontWeight: 700, color: "#ff8c42", lineHeight: 1 }}>
              +{totalHeat}
            </div>
            <p style={{ fontSize: "12px", color: "#b0b0c0", margin: "8px 0 0 0", textTransform: "uppercase", letterSpacing: "1px" }}>
              Heat Earned
            </p>
          </motion.div>

          {/* Mastered */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              padding: "24px",
              background: "rgba(255, 92, 53, 0.1)",
              border: "1px solid rgba(255, 92, 53, 0.3)",
              borderRadius: "12px",
            }}
          >
            <div style={{ fontSize: "32px", fontWeight: 700, color: "#22c55e", lineHeight: 1 }}>
              {correctCount}
            </div>
            <p style={{ fontSize: "12px", color: "#b0b0c0", margin: "8px 0 0 0", textTransform: "uppercase", letterSpacing: "1px" }}>
              Concepts
            </p>
          </motion.div>
        </motion.div>

        {/* Concept Breakdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            padding: "24px",
            background: "rgba(255, 92, 53, 0.05)",
            border: "1px solid rgba(255, 92, 53, 0.2)",
            borderRadius: "12px",
            marginBottom: "40px",
            textAlign: "left",
          }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#ff5c35", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
            Performance Summary
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {Object.entries(nodeResults || {}).map(([nodeId, result]) => (
              <div
                key={nodeId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255, 92, 53, 0.1)",
                }}
              >
                <span style={{ fontSize: "13px", color: "#b0b0c0" }}>
                  {nodeId.replace(/^(node|concept|scenario)[-_]?/i, "").replace(/[-_]/g, " ")}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: result.accuracy === "ignition" ? "#22c55e" : result.accuracy === "warning" ? "#f59e0b" : "#3b82f6",
                    textTransform: "uppercase",
                  }}
                >
                  {result.accuracy === "ignition" ? "✓ Ignition" : result.accuracy === "warning" ? "⚠ Warning" : "❄ Frost"}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewDashboard}
            disabled={redirecting}
            style={{
              padding: "14px 32px",
              background: "linear-gradient(135deg, #ff5c35, #ff8c42)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "1px",
              transition: "all 0.2s",
              opacity: redirecting ? 0.6 : 1,
            }}
          >
            {redirecting ? "Loading..." : "View Heatmap Update"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetGame();
              router.push("/learn");
            }}
            style={{
              padding: "14px 32px",
              background: "transparent",
              color: "#ff5c35",
              border: "2px solid rgba(255, 92, 53, 0.5)",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "1px",
              transition: "all 0.2s",
            }}
          >
            Start Another Session
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
