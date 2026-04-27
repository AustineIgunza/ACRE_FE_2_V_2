"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ── Sample data ──────────────────────────────────────────────────────────────
const SAMPLE_NODES = [
  {
    id: "corporate-veil-doctrine",
    title: "The Corporate Veil Doctrine",
    crisisText: "A CEO is sued personally for £2M in company debts. His lawyer says the corporate veil protects him — but he's been paying his mortgage from the company account. Does the veil hold?",
    dominoQuestion: "You are the plaintiff's attorney. The CEO has been paying personal expenses from company accounts for 2 years. Walk me through the Domino Effect — what legal doctrine is triggered, what evidence matters, and what happens to the CEO's personal assets?",
    formalMechanism: "A company is a separate legal person from its owners. However, when this separation masks fraud or abuse, courts will pierce the veil and hold owners personally liable.",
    soWhat: "The corporate veil is a shield, not a cloak — the moment you use it to hide wrongdoing, it becomes a window.",
    latexFormula: "\\text{Fraud/Abuse} \\implies \\text{Veil Pierced} \\implies \\text{Personal Liability}",
    heatScore: 88,
    thermalState: "ignition" as const,
  },
  {
    id: "shadow-director-liability",
    title: "Shadow Director Liability",
    crisisText: "The real decision-maker never appears on company documents — but everyone in the firm follows his instructions. Can he hide from liability?",
    dominoQuestion: "You are a creditor. The person who really ran the company was never officially appointed. Walk through how you prove shadow directorship and what liabilities it triggers.",
    formalMechanism: "A person who controls a company's decisions without formal appointment is a shadow director and bears the same duties and liabilities as a registered director.",
    soWhat: "Real power attracts real liability — if you act like a director, the law treats you like one.",
    latexFormula: "\\text{Control} \\implies \\text{Shadow Director} \\implies \\text{Full Liability}",
    heatScore: 54,
    thermalState: "warning" as const,
  },
  {
    id: "ultra-vires-doctrine",
    title: "Ultra Vires & Objects Clauses",
    crisisText: "A company enters a £5M software contract — but its constitution only permits real estate. Is the contract void?",
    dominoQuestion: "You are legal counsel for the counterparty. The company claims the contract is void — it acted outside its objects clause. Does the doctrine protect them, or does it protect you?",
    formalMechanism: "Acts beyond a company's constitutional objects are void against the company, but third parties dealing in good faith are protected under modern company law.",
    soWhat: "The objects clause traps the company, not its innocent counterparties.",
    latexFormula: "\\text{Ultra Vires} \\implies \\text{Void (Internal)} \\implies \\text{Protected (External)}",
    heatScore: 21,
    thermalState: "frost" as const,
  },
];

const FLASHPOINT_CARD = {
  question: "A director routes company revenue through a personal account for 18 months, then claims bankruptcy. Which doctrine is most directly triggered?",
  options: [
    { id: "A", text: "The Ultra Vires doctrine — the act exceeded company powers", correct: false },
    { id: "B", text: "Piercing the corporate veil — separation used to commit fraud", correct: true },
    { id: "C", text: "Shadow director liability — no formal appointment", correct: false },
  ],
  dueIn: "Due today",
  interval: "Day 7 review",
};

const PHASES = [
  { icon: "📥", label: "Drop Material", desc: "Paste notes, upload a PDF, YouTube link, or doc URL" },
  { icon: "💬", label: "Clarify", desc: "Ask the AI tutor anything before the challenge starts" },
  { icon: "⚡", label: "Challenge", desc: "Predict the domino effect — no hints, no multiple choice" },
  { icon: "🧠", label: "Intel Card", desc: "The core mechanism revealed with a symbolic formula" },
  { icon: "🗺️", label: "Logic Mesh", desc: "Cross-node synthesis — your understanding connected" },
  { icon: "🔥", label: "Flashpoint", desc: "SM-2 spaced repetition resurfaces what you're forgetting" },
];

// ── Formula renderer (LaTeX → visual chain) ───────────────────────────────────
function FormulaChain({ latex }: { latex: string }) {
  const parts = latex
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\implies/g, '→')
    .split('→')
    .map((s: string) => s.trim())
    .filter(Boolean);
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
      {parts.map((part: string, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            padding: "5px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: 600,
            backgroundColor: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
            color: "#d8b4fe",
          }}>{part}</span>
          {i < parts.length - 1 && (
            <span style={{ color: "#7c3aed", fontSize: "16px", fontWeight: 700 }}>→</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Thermal helpers ────────────────────────────────────────────────────────────
const thermalColor = (s: string) => s === "ignition" ? "#22c55e" : s === "warning" ? "#f59e0b" : "#ef4444";
const thermalBg = (s: string) => s === "ignition" ? "rgba(34,197,94,0.10)" : s === "warning" ? "rgba(245,158,11,0.10)" : "rgba(239,68,68,0.10)";
const thermalBorder = (s: string) => s === "ignition" ? "rgba(34,197,94,0.25)" : s === "warning" ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)";
const thermalLabel = (s: string) => s === "ignition" ? "IGNITION" : s === "warning" ? "WARNING" : "FROST";
const thermalEmoji = (s: string) => s === "ignition" ? "🔥" : s === "warning" ? "⚠️" : "❄️";

// ── Simple keyword scorer for demo challenge ───────────────────────────────────
function scoreDemoAnswer(answer: string): { score: number; state: "ignition" | "warning" | "frost"; feedback: string } {
  const a = answer.toLowerCase();
  const keywords = ["pierce", "veil", "personal liability", "fraud", "commingling", "separate", "abuse", "holding", "court", "creditor", "mortgage", "personal account", "legal person"];
  const hits = keywords.filter((k) => a.includes(k)).length;
  if (a.length < 30) {
    return { score: 15, state: "frost", feedback: "Too brief. The domino chain requires specific steps — what legal doctrine is triggered, and what happens to the CEO's personal assets?" };
  }
  if (hits >= 5) {
    return { score: 92, state: "ignition", feedback: "Deep causality detected. You traced the veil-piercing doctrine correctly: commingling funds + fraud = court ignores the corporate veil = personal liability for company debts. This is the weapon." };
  }
  if (hits >= 2) {
    return { score: 61, state: "warning", feedback: "You're on the right track — the veil is at risk. But the chain is incomplete: name the specific doctrine triggered, what evidence the court needs, and what the CEO now personally owes." };
  }
  return { score: 28, state: "frost", feedback: "The logic is shallow here. Start with the invariant: a company is a separate person. Then ask — what happens when that separation is used as a mask? Trace from doctrine → evidence → consequence." };
}

type DemoTab = "nodes" | "challenge" | "feedback" | "intel" | "flashpoint";

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<DemoTab>("nodes");
  const [selectedNode, setSelectedNode] = useState(SAMPLE_NODES[0]);
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [evalResult, setEvalResult] = useState<ReturnType<typeof scoreDemoAnswer> | null>(null);
  const [flashpointAnswer, setFlashpointAnswer] = useState<string | null>(null);

  const handleStartChallenge = (node: typeof SAMPLE_NODES[0]) => {
    setSelectedNode(node);
    setChallengeAnswer("");
    setEvalResult(null);
    setActiveTab("challenge");
  };

  const handleEvaluate = () => {
    if (!challengeAnswer.trim()) return;
    setEvalResult(scoreDemoAnswer(challengeAnswer));
    setActiveTab("feedback");
  };

  const handleRevealIntel = () => setActiveTab("intel");
  const handleReset = () => { setActiveTab("nodes"); setChallengeAnswer(""); setEvalResult(null); };

  return (
    <div style={{ backgroundColor: "#0a0a0c", color: "#e8e6e0", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backgroundColor: "rgba(10,10,12,0.92)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "28px", height: "28px", backgroundColor: "#ff5c35", borderRadius: "6px" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 400, color: "#f0f2ec", letterSpacing: "-0.5px" }}>ARCÉ</span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/signin" style={{ padding: "8px 16px", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.5)", textDecoration: "none", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
            Sign in
          </Link>
          <Link href="/signup" style={{ padding: "8px 16px", fontSize: "13px", fontWeight: 700, color: "#fff", textDecoration: "none", borderRadius: "8px", backgroundColor: "#ff5c35" }}>
            Start Free →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: "80px 24px 64px", textAlign: "center", maxWidth: "760px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: "inline-block", padding: "6px 14px", borderRadius: "20px", border: "1px solid rgba(255,92,53,0.3)", backgroundColor: "rgba(255,92,53,0.08)", fontSize: "11px", letterSpacing: "2px", color: "#ff8860", fontWeight: 700, marginBottom: "24px" }}>
            LIVE DEMO — COMPANY LAW SESSION
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 400, letterSpacing: "-2px", lineHeight: 1.1, color: "#f0f2ec", marginBottom: "20px" }}>
            Don&apos;t study.<br />
            <span style={{ color: "#ff5c35" }}>Fight.</span>
          </h1>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.55)", lineHeight: 1.75, maxWidth: "560px", margin: "0 auto 36px" }}>
            ARCÉ strips your material down to atomic logic nodes and forces you to predict the domino effect — under pressure, without hints. See how it works below.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#demo" style={{ padding: "14px 28px", fontSize: "14px", fontWeight: 700, letterSpacing: "0.5px", color: "#fff", backgroundColor: "#ff5c35", border: "none", borderRadius: "10px", cursor: "pointer", textDecoration: "none" }}>
              See the demo ↓
            </a>
            <Link href="/learn" style={{ padding: "14px 28px", fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.6)", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", textDecoration: "none" }}>
              Try with your own material
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── 6-PHASE FLOW ── */}
      <section style={{ padding: "48px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.015)" }}>
        <p style={{ textAlign: "center", fontSize: "10px", letterSpacing: "3px", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: "32px", textTransform: "uppercase" }}>
          The ARCÉ Cycle
        </p>
        <div style={{ display: "flex", gap: "0", overflowX: "auto", maxWidth: "900px", margin: "0 auto", paddingBottom: "8px" }}>
          {PHASES.map((phase, i) => (
            <div key={phase.label} style={{ flex: 1, minWidth: "120px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "0 12px", position: "relative" }}>
              {i < PHASES.length - 1 && (
                <div style={{ position: "absolute", top: "20px", left: "calc(50% + 24px)", width: "calc(100% - 48px)", height: "1px", backgroundColor: "rgba(255,92,53,0.2)" }} />
              )}
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(255,92,53,0.1)", border: "1px solid rgba(255,92,53,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", position: "relative", zIndex: 1 }}>
                {phase.icon}
              </div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#ff8860", letterSpacing: "0.5px" }}>{phase.label}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textAlign: "center", lineHeight: 1.5 }}>{phase.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTERACTIVE DEMO ── */}
      <section id="demo" style={{ padding: "64px 24px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "3px", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: "12px", textTransform: "uppercase" }}>Interactive Demo</p>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 400, color: "#f0f2ec", letterSpacing: "-1px", marginBottom: "8px" }}>
            Company Law — Director Liability
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
            3 logic nodes extracted from a company law textbook. Try the challenge.
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
          {([
            { id: "nodes", label: "① Extracted Nodes" },
            { id: "challenge", label: "② Challenge" },
            { id: "feedback", label: "③ Feedback" },
            { id: "intel", label: "④ Intel Card" },
            { id: "flashpoint", label: "⑤ Flashpoint Review" },
          ] as { id: DemoTab; label: string }[]).map(({ id, label }) => {
            const isActive = activeTab === id;
            const reachable = id === "nodes" || (id === "challenge") || (id === "feedback" && evalResult !== null) || (id === "intel" && evalResult !== null) || (id === "flashpoint");
            return (
              <button
                key={id}
                onClick={() => reachable && setActiveTab(id)}
                style={{
                  padding: "8px 14px", fontSize: "12px", fontWeight: 600,
                  borderRadius: "8px", border: isActive ? "1px solid rgba(255,92,53,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: isActive ? "rgba(255,92,53,0.12)" : "rgba(255,255,255,0.03)",
                  color: isActive ? "#ff8860" : reachable ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                  cursor: reachable ? "pointer" : "not-allowed",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">

          {/* ── TAB: NODES ── */}
          {activeTab === "nodes" && (
            <motion.div key="nodes" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {SAMPLE_NODES.map((node, i) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      padding: "24px 28px", borderRadius: "12px",
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", gap: "24px",
                    }}
                  >
                    {/* Thermal indicator */}
                    <div style={{
                      width: "48px", height: "48px", borderRadius: "10px", flexShrink: 0,
                      backgroundColor: thermalBg(node.thermalState),
                      border: `1px solid ${thermalBorder(node.thermalState)}`,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px",
                    }}>
                      <span style={{ fontSize: "16px" }}>{thermalEmoji(node.thermalState)}</span>
                      <span style={{ fontSize: "9px", fontWeight: 700, color: thermalColor(node.thermalState), letterSpacing: "0.5px" }}>{node.heatScore}</span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "10px", letterSpacing: "2px", color: thermalColor(node.thermalState), fontWeight: 700, marginBottom: "4px", textTransform: "uppercase" }}>
                        {thermalLabel(node.thermalState)}
                      </p>
                      <h3 style={{ fontSize: "16px", color: "#f0f2ec", fontWeight: 600, marginBottom: "6px" }}>{node.title}</h3>
                      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: 0 }}>
                        {node.crisisText}
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleStartChallenge(node)}
                      style={{
                        padding: "10px 18px", fontSize: "12px", fontWeight: 700,
                        letterSpacing: "0.5px", color: "#fff", backgroundColor: "#ff5c35",
                        border: "none", borderRadius: "8px", cursor: "pointer", flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Challenge →
                    </motion.button>
                  </motion.div>
                ))}
              </div>
              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "12px", marginTop: "20px" }}>
                Click "Challenge →" on any node to enter the Challenge Zone
              </p>
            </motion.div>
          )}

          {/* ── TAB: CHALLENGE ── */}
          {activeTab === "challenge" && (
            <motion.div key="challenge" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
              <div style={{ padding: "8px 0 24px", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ff5c35", boxShadow: "0 0 10px rgba(255,92,53,0.6)" }} />
                <span style={{ fontSize: "11px", letterSpacing: "3px", color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase" }}>CHALLENGE ZONE — DOMINO PREDICTION</span>
              </div>

              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 400, color: "#f0f2ec", marginBottom: "8px", letterSpacing: "-0.5px" }}>
                {selectedNode.title}
              </h2>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: "28px" }}>
                {selectedNode.crisisText}
              </p>

              <div style={{ padding: "20px 24px", borderRadius: "12px", backgroundColor: "rgba(255,92,53,0.07)", border: "1px solid rgba(255,92,53,0.2)", marginBottom: "24px" }}>
                <p style={{ fontSize: "12px", color: "#ff8860", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
                  DOMINO EFFECT PREDICTION
                </p>
                <p style={{ fontSize: "15px", color: "#f0f2ec", lineHeight: 1.65, margin: 0 }}>
                  {selectedNode.dominoQuestion}
                </p>
              </div>

              <textarea
                value={challengeAnswer}
                onChange={(e) => setChallengeAnswer(e.target.value)}
                placeholder="Trace the chain of consequences... What doctrine is triggered? What evidence is needed? What happens to the CEO personally?"
                style={{
                  width: "100%", minHeight: "140px", padding: "16px 20px",
                  fontSize: "14px", lineHeight: 1.65, fontFamily: "inherit",
                  borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)",
                  backgroundColor: "rgba(255,255,255,0.04)", color: "#f0f2ec",
                  resize: "vertical", boxSizing: "border-box", outline: "none",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,92,53,0.4)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                <button onClick={handleReset} style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}>
                  ← Back to nodes
                </button>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(255,92,53,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEvaluate}
                  disabled={!challengeAnswer.trim()}
                  style={{
                    padding: "14px 28px", fontSize: "13px", fontWeight: 700,
                    letterSpacing: "1px", color: "#fff",
                    backgroundColor: challengeAnswer.trim() ? "#ff5c35" : "rgba(255,92,53,0.3)",
                    border: "none", borderRadius: "10px",
                    cursor: challengeAnswer.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  EVALUATE PREDICTION →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── TAB: FEEDBACK ── */}
          {activeTab === "feedback" && evalResult && (
            <motion.div key="feedback" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div style={{
                padding: "28px", borderRadius: "14px",
                backgroundColor: thermalBg(evalResult.state),
                border: `1px solid ${thermalBorder(evalResult.state)}`,
                marginBottom: "24px", textAlign: "center",
              }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>{thermalEmoji(evalResult.state)}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: thermalColor(evalResult.state), letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
                  {thermalLabel(evalResult.state)}
                </div>
                <div style={{ fontSize: "42px", fontWeight: 700, color: thermalColor(evalResult.state), marginBottom: "4px" }}>
                  {evalResult.score}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>HEAT SCORE / 100</div>
              </div>
              <div style={{ padding: "20px 24px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "24px" }}>
                <p style={{ fontSize: "13px", color: "#ff8860", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>AI FEEDBACK</p>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.75, margin: 0 }}>{evalResult.feedback}</p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => setActiveTab("challenge")} style={{ flex: 1, padding: "13px", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.5)", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", cursor: "pointer" }}>
                  ← Try again
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleRevealIntel}
                  style={{ flex: 2, padding: "13px", fontSize: "13px", fontWeight: 700, letterSpacing: "0.5px", color: "#fff", backgroundColor: "#22c55e", border: "none", borderRadius: "10px", cursor: "pointer" }}
                >
                  REVEAL INTEL CARD →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── TAB: INTEL CARD ── */}
          {activeTab === "intel" && (
            <motion.div key="intel" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div style={{ padding: "8px 0 24px", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e", boxShadow: "0 0 10px rgba(34,197,94,0.6)" }} />
                <span style={{ fontSize: "11px", letterSpacing: "3px", color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase" }}>INTEL CARD — THE WEAPON</span>
              </div>

              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 400, color: "#f0f2ec", marginBottom: "24px", letterSpacing: "-0.5px" }}>
                {selectedNode.title}
              </h2>

              <div style={{ padding: "24px", borderRadius: "12px", backgroundColor: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", marginBottom: "20px" }}>
                <p style={{ fontSize: "10px", color: "#22c55e", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>CORE MECHANISM</p>
                <p style={{ fontSize: "16px", color: "#f0f2ec", lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>{selectedNode.formalMechanism}</p>
              </div>

              <div style={{ padding: "20px 24px", borderRadius: "12px", backgroundColor: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", marginBottom: "20px" }}>
                <p style={{ fontSize: "10px", color: "#a78bfa", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "14px" }}>CAUSAL CHAIN</p>
                <FormulaChain latex={selectedNode.latexFormula} />
              </div>

              <div style={{ padding: "20px 24px", borderRadius: "12px", backgroundColor: "rgba(255,92,53,0.06)", border: "1px solid rgba(255,92,53,0.2)", marginBottom: "28px" }}>
                <p style={{ fontSize: "10px", color: "#ff8860", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>THE LEVERAGE</p>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.8)", lineHeight: 1.7, margin: 0 }}>{selectedNode.soWhat}</p>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={handleReset} style={{ flex: 1, padding: "13px", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.5)", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", cursor: "pointer" }}>
                  ← All nodes
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("flashpoint")}
                  style={{ flex: 2, padding: "13px", fontSize: "13px", fontWeight: 700, color: "#fff", backgroundColor: "#ff5c35", border: "none", borderRadius: "10px", cursor: "pointer" }}
                >
                  SEE FLASHPOINT REVIEW →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── TAB: FLASHPOINT REVIEW ── */}
          {activeTab === "flashpoint" && (
            <motion.div key="flashpoint" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div style={{ padding: "8px 0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f59e0b", boxShadow: "0 0 10px rgba(245,158,11,0.6)" }} />
                  <span style={{ fontSize: "11px", letterSpacing: "3px", color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase" }}>FLASHPOINT REVIEW — SM-2 SPACED REPETITION</span>
                </div>
                <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", backgroundColor: "rgba(245,158,11,0.1)", color: "#f59e0b", fontWeight: 700 }}>
                  {FLASHPOINT_CARD.dueIn}
                </span>
              </div>

              <div style={{ padding: "20px 24px", borderRadius: "12px", backgroundColor: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", marginBottom: "24px" }}>
                <p style={{ fontSize: "10px", color: "#f59e0b", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>
                  {FLASHPOINT_CARD.interval} — SIGNAL CHECK
                </p>
                <p style={{ fontSize: "16px", color: "#f0f2ec", lineHeight: 1.65, margin: 0 }}>
                  {FLASHPOINT_CARD.question}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                {FLASHPOINT_CARD.options.map((opt) => {
                  const isSelected = flashpointAnswer === opt.id;
                  const showResult = flashpointAnswer !== null;
                  const isCorrect = opt.correct;
                  let bg = "rgba(255,255,255,0.04)";
                  let border = "1px solid rgba(255,255,255,0.12)";
                  let color = "#f0f2ec";
                  if (showResult && isCorrect) { bg = "rgba(34,197,94,0.1)"; border = "1px solid rgba(34,197,94,0.3)"; color = "#86efac"; }
                  else if (showResult && isSelected && !isCorrect) { bg = "rgba(239,68,68,0.1)"; border = "1px solid rgba(239,68,68,0.3)"; color = "#fca5a5"; }
                  return (
                    <motion.button
                      key={opt.id}
                      whileHover={!flashpointAnswer ? { scale: 1.01 } : {}}
                      onClick={() => !flashpointAnswer && setFlashpointAnswer(opt.id)}
                      style={{
                        padding: "16px 20px", borderRadius: "10px",
                        border, backgroundColor: bg, color,
                        fontSize: "14px", textAlign: "left",
                        cursor: flashpointAnswer ? "default" : "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <span style={{ fontWeight: 700, marginRight: "12px", color: showResult && isCorrect ? "#22c55e" : "rgba(255,255,255,0.35)" }}>{opt.id}.</span>
                      {opt.text}
                      {showResult && isCorrect && <span style={{ float: "right", color: "#22c55e", fontWeight: 700 }}>✓ Correct</span>}
                      {showResult && isSelected && !isCorrect && <span style={{ float: "right", color: "#ef4444", fontWeight: 700 }}>✗ Incorrect</span>}
                    </motion.button>
                  );
                })}
              </div>

              {flashpointAnswer && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "16px 20px", borderRadius: "10px", backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", marginBottom: "20px" }}>
                  <p style={{ fontSize: "13px", color: "#86efac", lineHeight: 1.7, margin: 0 }}>
                    {FLASHPOINT_CARD.options.find(o => o.correct)?.id === flashpointAnswer
                      ? "🔥 Correct. The SM-2 algorithm now pushes this card to a longer interval — you've proven retention. Next review: +14 days."
                      : "❄️ Incorrect. ARCÉ will resurface this card in 2 days. The SM-2 algorithm detected a gap and shortened the interval to reinforce the concept."}
                  </p>
                </motion.div>
              )}

              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={handleReset} style={{ flex: 1, padding: "13px", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.5)", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", cursor: "pointer" }}>
                  ← Start over
                </button>
                <Link href="/signup" style={{ flex: 2, padding: "13px", fontSize: "13px", fontWeight: 700, color: "#fff", backgroundColor: "#ff5c35", borderRadius: "10px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  CREATE YOUR OWN SESSION →
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ padding: "64px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: "10px", letterSpacing: "3px", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: "12px", textTransform: "uppercase" }}>Why ARCÉ</p>
          <h2 style={{ textAlign: "center", fontFamily: "Georgia, serif", fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 400, color: "#f0f2ec", letterSpacing: "-1px", marginBottom: "40px" }}>
            Built different from the ground up
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            {[
              { icon: "⚡", title: "Force Prediction, Not Recognition", desc: "No multiple choice by default. ARCÉ forces open-ended domino predictions — the only way to test real understanding." },
              { icon: "🌡️", title: "Thermal State Feedback", desc: "Not just 'correct' or 'wrong'. IGNITION, WARNING, and FROST give you an honest picture of where your logic stands." },
              { icon: "📎", title: "Any Format", desc: "Paste text, upload a PDF or DOCX, drop a YouTube link, or paste a Google Docs URL. AI handles the extraction." },
              { icon: "🔍", title: "AI Topic Detection", desc: "No need to label your material. ARCÉ auto-detects the subject and topic from your content and organizes it accordingly." },
              { icon: "🧬", title: "SM-2 Spaced Repetition", desc: "Flashpoint reviews use the proven SM-2 algorithm to resurface exactly what you're forgetting, right before you forget it." },
              { icon: "🗺️", title: "Logic Mesh Analysis", desc: "After the challenge, the Logic Mesh phase tests your ability to connect concepts across nodes — not just understand them in isolation." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ padding: "24px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: "24px", marginBottom: "12px" }}>{icon}</div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#f0f2ec", marginBottom: "8px" }}>{title}</h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 400, color: "#f0f2ec", letterSpacing: "-1.5px", marginBottom: "16px" }}>
            Ready to fight your material?
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", marginBottom: "36px", maxWidth: "440px", margin: "0 auto 36px" }}>
            Drop your first source — notes, lecture slides, a YouTube video, anything. ARCÉ handles the rest.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{ padding: "16px 32px", fontSize: "15px", fontWeight: 700, color: "#fff", backgroundColor: "#ff5c35", borderRadius: "10px", textDecoration: "none", letterSpacing: "0.5px" }}>
              Start Free — No Card Required
            </Link>
            <Link href="/learn" style={{ padding: "16px 32px", fontSize: "15px", fontWeight: 600, color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", textDecoration: "none" }}>
              Try with my own material →
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
