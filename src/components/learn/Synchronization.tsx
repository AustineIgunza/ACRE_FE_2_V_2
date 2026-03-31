"use client";

import { motion } from "framer-motion";
import { useArceStore } from "@/store/arceStore";

export default function Synchronization() {
  const { currentNode, currentIntelCard, document, currentNodeIndex, completedNodeIds } = useArceStore();

  if (!currentNode) return null;

  const totalNodes = document?.nodes.length || 0;
  const completedCount = completedNodeIds.length + 1; // +1 for the current one being synced

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        backgroundColor: "#0a0a0c",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "32px",
        overflow: "hidden",
      }}
    >
      {/* Background Grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      {/* Card flying into dashboard animation */}
      <motion.div
        initial={{ y: 100, scale: 0.5, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "280px",
          padding: "20px",
          borderRadius: "12px",
          backgroundColor: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,92,53,0.3)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>🎴</div>
        <h3 style={{
          fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 400,
          color: "#f0f2ec", marginBottom: "4px",
        }}>
          {currentIntelCard?.title || currentNode.title}
        </h3>
        <span style={{
          fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
          color: "#22c55e", fontWeight: 600,
        }}>
          MASTERED
        </span>
      </motion.div>

      {/* Plug-in animation line */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        style={{
          width: "2px",
          height: "60px",
          backgroundColor: "#ff5c35",
          transformOrigin: "top",
        }}
      />

      {/* Dashboard slot */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          padding: "20px 40px",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "rgba(255,255,255,0.03)",
          display: "flex",
          alignItems: "center",
          gap: "24px",
        }}
      >
        {/* Node slots */}
        {Array.from({ length: totalNodes }).map((_, i) => {
          const isCompleted = i < completedCount;
          const isCurrent = i === completedCount - 1;

          return (
            <motion.div
              key={i}
              initial={isCurrent ? { scale: 0.5 } : {}}
              animate={isCurrent ? { scale: [0.5, 1.3, 1] } : {}}
              transition={isCurrent ? { delay: 1.0, duration: 0.5 } : {}}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700,
                backgroundColor: isCompleted
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${isCompleted ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                color: isCompleted ? "#22c55e" : "rgba(255,255,255,0.2)",
                boxShadow: isCurrent ? "0 0 20px rgba(34,197,94,0.3)" : "none",
              }}
            >
              {isCompleted ? "✓" : i + 1}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Progress Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{ textAlign: "center" }}
      >
        <p style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: "14px",
          marginBottom: "4px",
        }}>
          {completedCount} of {totalNodes} nodes synchronized
        </p>
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            color: "#ff5c35",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          {completedCount < totalNodes ? "ADVANCING TO NEXT NODE..." : "ALL NODES COMPLETE"}
        </motion.p>
      </motion.div>

      {/* Success flash */}
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
        style={{
          position: "absolute",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,197,94,0.4) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}
