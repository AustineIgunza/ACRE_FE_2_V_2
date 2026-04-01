"use client";

import { useState } from "react";
import { useFlashpointStore } from "@/store/flashpointStore";

export default function Phase2Application() {
  const { flashpointData, submitFlashpoint, evaluationResult, isLoading, fetchTriage, resetFlashpoint } = useFlashpointStore();
  const [input, setInput] = useState("");

  if (evaluationResult) {
    return (
      <div style={{ padding: "40px", backgroundColor: "var(--p-white)", borderRadius: "12px", border: `2px solid ${evaluationResult.isSuccess ? 'var(--success)' : 'var(--snap)'}`, textAlign: "center", animation: "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}>
        <h2 style={{ color: evaluationResult.isSuccess ? 'var(--success)' : 'var(--snap)', marginBottom: "16px", fontSize: "24px" }}>
          {evaluationResult.isSuccess ? "OVERRIDE SUCCESSFUL" : "LOGIC BREACH"}
        </h2>
        <p style={{ color: "var(--t-secondary)", marginBottom: "32px", fontSize: "16px" }}>{evaluationResult.feedback}</p>
        <button onClick={() => { fetchTriage(); resetFlashpoint(); }} className="button-primary" style={{ padding: "12px 32px" }}>RETURN TO DASHBOARD</button>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      <div style={{ padding: "24px", backgroundColor: "rgba(255, 149, 0, 0.05)", border: "1px solid rgba(255, 149, 0, 0.2)", borderRadius: "12px", marginBottom: "24px", color: "var(--warning)" }}>
        <strong style={{ display: "block", fontSize: "12px", letterSpacing: "2px", marginBottom: "8px", fontWeight: 800 }}>CRISIS ALERT (PHASE 2)</strong>
        <p style={{ fontSize: "16px", lineHeight: 1.5, fontWeight: 500 }}>{flashpointData.crisis_text}</p>
      </div>

      <div style={{ padding: "20px", backgroundColor: "#1e1e1e", borderRadius: "8px", borderLeft: "4px solid var(--t-primary)", marginBottom: "32px", fontFamily: "monospace" }}>
        <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>Advisory Board Comm Link:</div>
        <div style={{ color: "#d4d4d4", fontSize: "15px", lineHeight: 1.6 }}>
          <strong style={{ color: "#569cd6" }}>{flashpointData.flawed_proposal.speaker}:</strong> "{flashpointData.flawed_proposal.quote}"
        </div>
      </div>

      <div style={{ backgroundColor: "var(--p-white)", padding: "24px", borderRadius: "12px", border: "1px solid var(--p-border)" }}>
        <label style={{ display: "block", color: "var(--t-primary)", fontSize: "14px", fontWeight: 600, marginBottom: "16px" }}>
          {flashpointData.ui_prompt || "Override the flawed logic and advise:"}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Type your counter-argument here..."
          style={{ width: "100%", height: "120px", padding: "16px", border: "1px solid var(--p-border)", borderRadius: "8px", fontSize: "15px", resize: "vertical", outline: "none", marginBottom: "16px", fontFamily: "inherit" }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            disabled={input.trim().length === 0 || isLoading}
            onClick={() => {
              submitFlashpoint({ userInput: input, evaluationRubric: flashpointData.evaluation_rubric });
            }}
            className="button-primary"
            style={{ padding: "10px 24px", opacity: input.trim().length === 0 || isLoading ? 0.5 : 1 }}
          >
            {isLoading ? "EVALUATING..." : "TRANSMIT OVERRIDE"}
          </button>
        </div>
      </div>
    </div>
  );
}
