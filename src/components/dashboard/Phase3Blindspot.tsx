"use client";

import { useState } from "react";
import { useFlashpointStore } from "@/store/flashpointStore";

export default function Phase3Blindspot() {
  const { flashpointData, submitFlashpoint, evaluationResult, isLoading, fetchTriage, resetFlashpoint } = useFlashpointStore();
  const [input, setInput] = useState("");

  if (evaluationResult) {
    return (
      <div style={{ padding: "40px", backgroundColor: "#000", borderRadius: "12px", border: `1px solid ${evaluationResult.isSuccess ? 'var(--success)' : 'var(--snap)'}`, textAlign: "center", color: "#fff", animation: "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}>
        <h2 style={{ color: evaluationResult.isSuccess ? 'var(--success)' : 'var(--snap)', marginBottom: "16px", fontSize: "28px", letterSpacing: "2px" }}>
          {evaluationResult.isSuccess ? "VARIABLE REVEALED" : "FATAL BLINDSPOT"}
        </h2>
        {evaluationResult.isSuccess && (
          <div style={{ padding: "16px", backgroundColor: "rgba(255,255,255,0.1)", margin: "0 auto 24px", borderRadius: "8px", fontFamily: "monospace", display: "inline-block", color: "var(--info)" }}>
             DATA EXFILTRATED: {flashpointData.success_reveal_data}
          </div>
        )}
        <p style={{ color: "#aaa", marginBottom: "32px", fontSize: "16px", lineHeight: 1.6, maxWidth: "500px", margin: "0 auto 32px" }}>{evaluationResult.feedback}</p>
        <button onClick={() => { fetchTriage(); resetFlashpoint(); }} style={{ padding: "12px 32px", background: "#fff", color: "#000", border: "none", borderRadius: "24px", fontWeight: 700, cursor: "pointer", fontSize: "14px", letterSpacing: "1px" }}>EXIT SIMULATION</button>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out", backgroundColor: "#000", padding: "48px", borderRadius: "16px", color: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "40px" }}>
        <div style={{ height: "1px", flex: 1, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
        <span style={{ fontSize: "11px", letterSpacing: "4px", padding: "0 24px", color: "rgba(255,255,255,0.5)" }}>PHASE 3: THE BLINDSPOT</span>
        <div style={{ height: "1px", flex: 1, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
      </div>

      <p style={{ fontSize: "20px", lineHeight: 1.6, fontWeight: 300, textAlign: "justify", marginBottom: "40px", color: "#ddd" }}>
        {flashpointData.crisis_text}
      </p>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <label style={{ color: "var(--info)", fontSize: "13px", fontWeight: 600, letterSpacing: "1px", marginBottom: "20px", textTransform: "uppercase" }}>
          {flashpointData.ui_prompt || "Ask one question to reveal the missing variable"}
        </label>
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Enter question..."
          spellCheck={false}
          style={{ 
            width: "100%", 
            maxWidth: "600px",
            backgroundColor: "transparent", 
            border: "none", 
            borderBottom: "2px solid rgba(255,255,255,0.2)", 
            color: "#fff", 
            fontSize: "24px", 
            padding: "16px 0", 
            textAlign: "center",
            outline: "none", 
            marginBottom: "40px",
            fontFamily: "serif",
            transition: "border-color 0.3s"
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--info)"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.2)"}
        />

        <button
          disabled={input.trim().length === 0 || isLoading}
          onClick={() => {
            submitFlashpoint({ userInput: input, evaluationRubric: flashpointData.evaluation_rubric });
          }}
          style={{ 
            padding: "14px 40px", 
            background: input.trim().length === 0 || isLoading ? "transparent" : "var(--info)", 
            color: input.trim().length === 0 || isLoading ? "rgba(255,255,255,0.3)" : "#000",
            border: `1px solid ${input.trim().length === 0 || isLoading ? "rgba(255,255,255,0.3)" : "var(--info)"}`,
            borderRadius: "30px",
            cursor: input.trim().length === 0 || isLoading ? "not-allowed" : "pointer",
            fontWeight: 700,
            letterSpacing: "2px",
            fontSize: "13px",
            transition: "all 0.3s"
          }}
        >
          {isLoading ? "INTERROGATING..." : "REQUEST INTEL"}
        </button>
      </div>
    </div>
  );
}
