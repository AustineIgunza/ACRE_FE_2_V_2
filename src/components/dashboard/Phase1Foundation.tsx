"use client";

import { useState } from "react";
import { useFlashpointStore } from "@/store/flashpointStore";

export default function Phase1Foundation() {
  const { flashpointData, submitFlashpoint, evaluationResult, isLoading, fetchTriage, resetFlashpoint } = useFlashpointStore();
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  if (evaluationResult) {
    return (
      <div style={{ padding: "40px", backgroundColor: "var(--p-white)", borderRadius: "12px", border: `2px solid ${evaluationResult.isSuccess ? 'var(--success)' : 'var(--snap)'}`, textAlign: "center", animation: "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}>
        <h2 style={{ color: evaluationResult.isSuccess ? 'var(--success)' : 'var(--snap)', marginBottom: "16px", fontSize: "24px" }}>
          {evaluationResult.isSuccess ? "THREAT NEUTRALIZED" : "CATASTROPHIC FAILURE"}
        </h2>
        <p style={{ color: "var(--t-secondary)", marginBottom: "32px", fontSize: "16px" }}>{evaluationResult.feedback}</p>
        <button onClick={() => { fetchTriage(); resetFlashpoint(); }} className="button-primary" style={{ padding: "12px 32px" }}>RETURN TO DASHBOARD</button>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      <div style={{ padding: "24px", backgroundColor: "rgba(255, 59, 48, 0.05)", border: "1px solid rgba(255, 59, 48, 0.2)", borderRadius: "12px", marginBottom: "32px", color: "var(--snap)" }}>
        <strong style={{ display: "block", fontSize: "12px", letterSpacing: "2px", marginBottom: "8px", fontWeight: 800 }}>CRISIS ALERT (PHASE 1)</strong>
        <p style={{ fontSize: "18px", lineHeight: 1.6, fontWeight: 500 }}>{flashpointData.crisis_text}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ color: "var(--t-primary)", fontSize: "14px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Immediate Action Required:</h3>
        {flashpointData.options.map((opt: any) => (
          <button
            key={opt.id}
            onClick={() => {
              if (isLoading) return;
              setSelectedOpt(opt.id);
              submitFlashpoint({ isPhase1: true, isPhase1Success: opt.is_correct });
            }}
            disabled={isLoading}
            style={{
              textAlign: "left",
              padding: "24px",
              backgroundColor: "var(--p-white)",
              border: `2px solid ${selectedOpt === opt.id ? 'var(--snap)' : 'var(--p-border)'}`,
              borderRadius: "12px",
              cursor: isLoading ? "wait" : "pointer",
              transition: "all 0.2s",
              fontSize: "16px",
              fontWeight: 500,
              color: "var(--t-primary)",
              opacity: isLoading && selectedOpt !== opt.id ? 0.4 : 1,
              boxShadow: selectedOpt === opt.id ? "0 4px 12px rgba(0,0,0,0.05)" : "none"
            }}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
