"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  phase: "extracting" | "evaluating" | "transitioning";
  progress?: number;
}

export default function LoadingScreen({
  phase,
  progress = 0,
}: LoadingScreenProps) {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getMessage = () => {
    switch (phase) {
      case "extracting":
        return "Extracting causal anchors from your material";
      case "evaluating":
        return "Evaluating your logic depth";
      case "transitioning":
        return "Preparing next challenge";
      default:
        return "Processing";
    }
  };

  const getIcon = () => {
    switch (phase) {
      case "extracting":
        return "🧠";
      case "evaluating":
        return "⚖️";
      case "transitioning":
        return "⏱️";
      default:
        return "⚙️";
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "var(--p-white)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      animation: "fadeIn 0.3s ease-out",
    }}>
      <div style={{ textAlign: "center", maxWidth: "400px", padding: "0 24px" }}>
        {/* Icon */}
        <div style={{
          fontSize: "56px",
          marginBottom: "32px",
          animation: "bounce-light 2s infinite",
        }}>
          {getIcon()}
        </div>

        {/* Message */}
        <h2 style={{
          fontFamily: "Georgia, serif",
          fontWeight: 400,
          fontSize: "24px",
          color: "var(--t-primary)",
          letterSpacing: "-0.8px",
          marginBottom: "8px",
          lineHeight: 1.3,
        }}>
          {getMessage()}
          <span style={{ display: "inline-block", width: "24px" }}>
            {".".repeat(dotCount)}
          </span>
        </h2>

        {/* Subtext */}
        <p style={{
          color: "var(--t-secondary)",
          fontSize: "14px",
          marginBottom: "32px",
          lineHeight: 1.6,
        }}>
          {phase === "extracting" &&
            "Breaking down your material into logical frameworks"}
          {phase === "evaluating" &&
            "Analyzing your response for causality depth"}
          {phase === "transitioning" &&
            "Setting up the next challenge"}
        </p>

        {/* Progress Bar */}
        <div style={{ width: "100%", maxWidth: "300px", marginBottom: "24px" }}>
          <div style={{ 
            height: "6px", 
            borderRadius: "3px", 
            backgroundColor: "var(--p-border)", 
            overflow: "hidden",
            marginBottom: "8px"
          }}>
            <div style={{
              height: "100%",
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: "var(--snap)",
              transition: "width 0.3s ease-out",
              borderRadius: "3px",
              boxShadow: "0 0 8px rgba(255, 193, 7, 0.5)"
            }} />
          </div>
          <p style={{ fontSize: "12px", color: "var(--t-muted)", margin: 0, textAlign: "center" }}>
            {Math.round(Math.min(progress, 100))}%
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: "24px" }}>
          <div className="progress-container" style={{ height: "6px", marginBottom: "12px" }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--t-secondary)" }}>
            {Math.round(progress)}%
          </p>
        </div>

        {/* Tips */}
        <div className="folio-card" style={{
          textAlign: "left",
          padding: "20px",
          marginTop: "32px",
        }}>
          <span className="eyebrow" style={{ marginBottom: "12px" }}>
            💡 While you wait
          </span>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              "Think about the consequences of each move",
              "Consider all stakeholders affected",
              "Depth of reasoning matters more than speed",
            ].map((tip, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "var(--t-mid)" }}>
                <span style={{ color: "var(--snap)", marginTop: "2px", flexShrink: 0 }}>•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
