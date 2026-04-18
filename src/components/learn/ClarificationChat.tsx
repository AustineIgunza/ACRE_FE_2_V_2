"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useArceStore } from "@/store/arceStore";

export default function ClarificationChat() {
  const {
    currentScenario,
    scenarios,
    clarificationHistory,
    addClarificationMessage,
    clearClarificationHistory,
  } = useArceStore();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!currentScenario) return null;

  const nodeId = currentScenario.nodeId || currentScenario.id;
  const history = clarificationHistory[nodeId] || [];

  const scenarioIndex = scenarios.findIndex((s) => s.id === currentScenario.id);
  const totalScenarios = scenarios.length;
  const progress = totalScenarios > 0 ? ((scenarioIndex + 1) / totalScenarios) * 100 : 0;
  const nodeTitle = nodeId.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  // Seed welcome message once
  useEffect(() => {
    if (history.length === 0) {
      clearClarificationHistory(nodeId);
      addClarificationMessage(
        nodeId,
        "ai",
        `I'm here to help you understand **${nodeTitle}** before the challenge. Ask me anything about the scenario or the mechanism — or just click "Start Challenge" when you're ready.`
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");
    addClarificationMessage(nodeId, "user", userMessage);
    setIsLoading(true);

    try {
      const res = await fetch("/api/clarification-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId,
          message: userMessage,
          nodeContext: {
            crisisText: currentScenario.crisisText,
            formalMechanism: currentScenario.formalMechanism || "",
            soWhat: (currentScenario as any).soWhat || "",
            dominoQuestion: currentScenario.dominoQuestion || "",
          },
          history,
        }),
      });
      const data = res.ok ? await res.json() : { response: "Something went wrong. Try again." };
      addClarificationMessage(nodeId, "ai", data.response);
    } catch {
      addClarificationMessage(nodeId, "ai", "I couldn't respond. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChallenge = () => {
    useArceStore.setState({ currentPhase: "challenge" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: "-100%" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
        position: "absolute", top: "-200px", left: "-200px",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Top Bar */}
      <div style={{
        padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            backgroundColor: "#8b5cf6", boxShadow: "0 0 12px rgba(139,92,246,0.6)",
          }} />
          <span style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            CLARIFICATION ZONE
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
              style={{ height: "100%", backgroundColor: "#8b5cf6", borderRadius: "2px" }}
            />
          </div>
        </div>
      </div>

      {/* Split layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* LEFT: Critical 20% content */}
        <div style={{
          width: "420px",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "32px 28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflow: "auto",
        }}>
          <div>
            <p style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#8b5cf6", fontWeight: 700, marginBottom: "8px" }}>
              THE SCENARIO
            </p>
            <div style={{
              padding: "20px", borderRadius: "10px",
              backgroundColor: "rgba(139,92,246,0.06)",
              border: "1px solid rgba(139,92,246,0.15)",
            }}>
              <p style={{ fontSize: "15px", color: "#f0f2ec", lineHeight: 1.75, margin: 0 }}>
                {currentScenario.crisisText}
              </p>
            </div>
          </div>

          {currentScenario.formalMechanism && (
            <div>
              <p style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#22c55e", fontWeight: 700, marginBottom: "8px" }}>
                CRITICAL 20% — THE MECHANISM
              </p>
              <div style={{
                padding: "20px", borderRadius: "10px",
                backgroundColor: "rgba(34,197,94,0.06)",
                border: "1px solid rgba(34,197,94,0.15)",
              }}>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>
                  {currentScenario.formalMechanism}
                </p>
              </div>
            </div>
          )}

          {(currentScenario as any).soWhat && (
            <div>
              <p style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#ff5c35", fontWeight: 700, marginBottom: "8px" }}>
                THE LEVERAGE
              </p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>
                {(currentScenario as any).soWhat}
              </p>
            </div>
          )}

          {/* Start Challenge CTA */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(34,197,94,0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartChallenge}
            style={{
              marginTop: "auto",
              padding: "16px 32px", fontSize: "14px", fontWeight: 700,
              letterSpacing: "1px", textTransform: "uppercase",
              color: "#fff", backgroundColor: "#22c55e",
              border: "none", borderRadius: "10px", cursor: "pointer",
            }}
          >
            I UNDERSTAND — START CHALLENGE →
          </motion.button>
        </div>

        {/* RIGHT: Chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0" }}>

          {/* Node title */}
          <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <h2 style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(18px, 2.5vw, 26px)",
              fontWeight: 400, letterSpacing: "-0.5px",
              color: "#f0f2ec", margin: 0,
            }}>
              {nodeTitle}
            </h2>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: "4px 0 0" }}>
              Ask anything before the challenge begins
            </p>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <AnimatePresence initial={false}>
              {history.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div style={{
                    maxWidth: "78%",
                    padding: "14px 18px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    backgroundColor: msg.role === "user"
                      ? "rgba(139,92,246,0.18)"
                      : "rgba(255,255,255,0.04)",
                    border: msg.role === "user"
                      ? "1px solid rgba(139,92,246,0.3)"
                      : "1px solid rgba(255,255,255,0.08)",
                    fontSize: "14px",
                    lineHeight: 1.65,
                    color: msg.role === "user" ? "#e8e6e0" : "rgba(255,255,255,0.85)",
                  }}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", justifyContent: "flex-start" }}
                >
                  <div style={{
                    padding: "14px 18px", borderRadius: "16px 16px 16px 4px",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", gap: "5px", alignItems: "center",
                  }}>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                        style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#8b5cf6" }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div style={{
            padding: "16px 28px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", gap: "12px",
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask about the scenario or mechanism..."
              style={{
                flex: 1, padding: "12px 16px",
                fontSize: "14px", fontFamily: "inherit",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.12)",
                backgroundColor: "rgba(255,255,255,0.04)",
                color: "#f0f2ec", outline: "none",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
            />
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                padding: "12px 20px", fontSize: "13px", fontWeight: 700,
                letterSpacing: "1px", textTransform: "uppercase",
                color: "#fff",
                backgroundColor: input.trim() ? "#8b5cf6" : "rgba(139,92,246,0.3)",
                border: "none", borderRadius: "8px",
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              ASK
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
