"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useArceStore } from "@/store/arceStore";

export default function ChallengeZone() {
  const { currentScenario, scenarios, isLoading, error, submitDominoPrediction } = useArceStore();
  const [dominoResponse, setDominoResponse] = useState<string>("");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<"domino" | "multiple-choice">("domino");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!currentScenario) return null;

  const scenarioIndex = scenarios.findIndex((s) => s.id === currentScenario.id);
  const totalScenarios = scenarios.length;
  const progress = totalScenarios > 0 ? ((scenarioIndex + 1) / totalScenarios) * 100 : 0;

  // Determine question type based on index (alternate between domino and MC)
  const effectiveQuestionType = scenarioIndex % 2 === 0 ? "domino" : "multiple-choice";
  const mcOptions = (currentScenario as any)?.multiple_choice_options || [];
  const mcQuestion = (currentScenario as any)?.multiple_choice_question || "";

  const handleSubmit = async () => {
    if (effectiveQuestionType === "domino") {
      if (!dominoResponse.trim()) return;
      console.log("Submitting domino prediction:", dominoResponse);
      await submitDominoPrediction(dominoResponse);
    } else {
      if (!selectedChoice) return;
      console.log("Submitting multiple choice:", selectedChoice);
      // For MC, find the correct answer from options
      const correctOption = mcOptions.find((opt: any) => opt.is_correct === true);
      const correctAnswer = correctOption?.id || "A"; // Default to "A" if not marked
      
      // Pass MC-specific evaluation data
      const evalResponse = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId: currentScenario.nodeId,
          prediction: selectedChoice,
          isMultipleChoice: true,
          correctAnswer: correctAnswer,
          question: mcQuestion,
        }),
      });

      if (evalResponse.ok) {
        const result = await evalResponse.json();
        // Call submitDominoPrediction with the MC result
        // This will handle the state update properly
        const nodeId = currentScenario.nodeId || currentScenario.id;
        
        // Update node results in store manually
        const state = useArceStore.getState();
        const updatedNodeResults = {
          ...state.nodeResults,
          [nodeId]: { 
            accuracy: result.accuracy, 
            heatScore: result.score, 
            feedback: result.feedback,
            thermalState: result.thermalState
          }
        };
        
        useArceStore.setState({
          isLoading: false,
          currentPhase: "transition",
          nodeResults: updatedNodeResults,
        });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0c",
        color: "#e8e6e0",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient Glow */}
      <div style={{
        position: "absolute", top: "-200px", right: "-200px",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(255,92,53,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Top Bar: Progress + Scenario Counter */}
      <div style={{
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            backgroundColor: "#ff5c35",
            boxShadow: "0 0 12px rgba(255,92,53,0.6)",
          }} />
          <span style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            CHALLENGE ZONE
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
            CONCEPT {scenarioIndex + 1} / {totalScenarios}
          </span>
          <div style={{ width: "120px", height: "3px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6 }}
              style={{ height: "100%", backgroundColor: "#ff5c35", borderRadius: "2px" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        maxWidth: "800px",
        margin: "0 auto",
        width: "100%",
      }}>
        {/* Scenario Alert */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            backgroundColor: "rgba(255,92,53,0.08)",
            border: "1px solid rgba(255,92,53,0.15)",
            marginBottom: "32px",
            display: "flex", alignItems: "center", gap: "10px",
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ef4444" }}
          />
          <span style={{ fontSize: "13px", color: "#ff8860", fontWeight: 600, fontFamily: "monospace" }}>
            {effectiveQuestionType === "multiple-choice" ? "MULTIPLE CHOICE" : "LEARNING CHALLENGE"}
          </span>
        </motion.div>

        {/* Scenario Title */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 400,
            letterSpacing: "-0.8px",
            color: "#f0f2ec",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          {currentScenario.nodeId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </motion.h2>

        {/* Scenario Context */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: "15px",
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            marginBottom: "32px",
            maxWidth: "650px",
          }}
        >
          {currentScenario.crisisText}
        </motion.p>

        {effectiveQuestionType === "domino" ? (
          <>
            {/* Domino Question */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                width: "100%",
                padding: "20px 24px",
                borderRadius: "12px",
                backgroundColor: "rgba(255,92,53,0.08)",
                border: "1px solid rgba(255,92,53,0.2)",
                marginBottom: "24px",
              }}
            >
              <p style={{ fontSize: "13px", color: "#ff8860", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                DOMINO EFFECT PREDICTION
              </p>
              <p style={{ fontSize: "15px", color: "#f0f2ec", fontWeight: 500, lineHeight: 1.6 }}>
                {currentScenario.dominoQuestion || "Predict what happens next in this chain of events."}
              </p>
            </motion.div>

            {/* Free-text Input Textarea */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 }}
              style={{ width: "100%" }}
            >
              <textarea
                ref={textareaRef}
                value={dominoResponse}
                onChange={(e) => setDominoResponse(e.target.value)}
                placeholder="Enter your prediction... What chains of consequences do you foresee?"
                style={{
                  width: "100%",
                  height: "140px",
                  padding: "16px 20px",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  fontFamily: "inherit",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  color: "#f0f2ec",
                  resize: "vertical",
                  boxSizing: "border-box",
                  transition: "all 0.2s",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,92,53,0.4)";
                  e.currentTarget.style.backgroundColor = "rgba(255,92,53,0.06)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                <span>{dominoResponse.length} characters</span>
                <span>{dominoResponse.trim().split(/\s+/).filter(w => w).length} words</span>
              </div>
            </motion.div>
          </>
        ) : (
          <>
            {/* Multiple Choice Question */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                width: "100%",
                padding: "20px 24px",
                borderRadius: "12px",
                backgroundColor: "rgba(255,92,53,0.08)",
                border: "1px solid rgba(255,92,53,0.2)",
                marginBottom: "24px",
              }}
            >
              <p style={{ fontSize: "15px", color: "#f0f2ec", fontWeight: 500, lineHeight: 1.6 }}>
                {mcQuestion || "Select the best answer:"}
              </p>
            </motion.div>

            {/* Multiple Choice Options */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 }}
              style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {mcOptions.map((option: any, index: number) => (
                <motion.button
                  key={option.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.55 + index * 0.1 }}
                  onClick={() => setSelectedChoice(option.id)}
                  style={{
                    padding: "16px 20px",
                    borderRadius: "10px",
                    border: selectedChoice === option.id 
                      ? "2px solid #ff5c35" 
                      : "1px solid rgba(255,255,255,0.15)",
                    backgroundColor: selectedChoice === option.id
                      ? "rgba(255,92,53,0.15)"
                      : "rgba(255,255,255,0.04)",
                    color: "#f0f2ec",
                    fontSize: "14px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontWeight: selectedChoice === option.id ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (selectedChoice !== option.id) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,92,53,0.08)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,92,53,0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedChoice !== option.id) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                    }
                  }}
                >
                  <span style={{ fontWeight: 700, marginRight: "12px", color: "#ff5c35" }}>
                    {option.id}.
                  </span>
                  {option.text}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ marginTop: "16px", padding: "12px 20px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "14px", width: "100%", textAlign: "center" }}>
            {error}
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,92,53,0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isLoading || (effectiveQuestionType === "domino" ? !dominoResponse.trim() : !selectedChoice)}
          style={{
            marginTop: "32px",
            width: "100%",
            maxWidth: "300px",
            padding: "16px 32px",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#fff",
            backgroundColor: (effectiveQuestionType === "domino" ? dominoResponse.trim() : selectedChoice) ? "#ff5c35" : "rgba(255,92,53,0.3)",
            border: "none",
            borderRadius: "10px",
            cursor: isLoading || (effectiveQuestionType === "domino" ? !dominoResponse.trim() : !selectedChoice) ? "not-allowed" : "pointer",
            transition: "all 0.3s",
          }}
        >
          {isLoading ? "ANALYZING..." : "SUBMIT ANSWER"}
        </motion.button>
      </div>
    </motion.div>
  );
}
