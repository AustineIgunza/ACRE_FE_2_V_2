"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useArceStore } from "@/store/arceStore";

export default function BreakthroughTransition() {
  const { currentPhase } = useArceStore();

  useEffect(() => {
    // After transition animation completes (2.5s total), advance to sanctuary
    const timer = setTimeout(() => {
      if (currentPhase === "transition") {
        useArceStore.setState({ currentPhase: "sanctuary" });
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [currentPhase]);
  return (
    <motion.div
      initial={{ opacity: 1 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Dark background sliding away to the left */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: "-100%" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#0a0a0c",
          zIndex: 1,
        }}
      />

      {/* White gallery background emerging */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "var(--p-white)",
          zIndex: 0,
        }}
      />

      {/* Center flash */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 20, opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        style={{
          position: "absolute",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,92,53,0.8) 0%, transparent 70%)",
          zIndex: 2,
        }}
      />

      {/* "BREAKTHROUGH" text flash */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.2, times: [0, 0.2, 0.6, 1], delay: 0.1 }}
        style={{
          zIndex: 3,
          textAlign: "center",
        }}
      >
        <p style={{
          fontSize: "11px",
          letterSpacing: "6px",
          textTransform: "uppercase",
          fontWeight: 700,
          color: "#ff5c35",
          marginBottom: "8px",
        }}>
          LOGIC MAPPED
        </p>
        <h2 style={{
          fontFamily: "Georgia, serif",
          fontSize: "28px",
          fontWeight: 400,
          letterSpacing: "-1px",
          color: "#f0f2ec",
        }}>
          Breakthrough
        </h2>
      </motion.div>

      {/* Particle effects */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: (Math.random() - 0.5) * 600,
            y: (Math.random() - 0.5) * 600,
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 1 + Math.random() * 0.5,
            delay: 0.3 + Math.random() * 0.3,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            width: 4 + Math.random() * 4,
            height: 4 + Math.random() * 4,
            borderRadius: "50%",
            backgroundColor: "#ff5c35",
            zIndex: 4,
          }}
        />
      ))}
    </motion.div>
  );
}
