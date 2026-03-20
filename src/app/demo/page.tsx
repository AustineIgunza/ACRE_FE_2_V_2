"use client";

import { useState } from "react";

export default function DemoPage() {
  const [showDefense, setShowDefense] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [answeredQuestion, setAnsweredQuestion] = useState<string | null>(null);
  const [xpCount, setXpCount] = useState(245);
  const [streakDays, setStreakDays] = useState(5);
  const [dailyProgress, setDailyProgress] = useState(65);

  const handleAnswer = (answer: string, correct: boolean) => {
    setAnsweredQuestion(answer);
    if (correct) {
      setXpCount((prev) => prev + 10);
      setDailyProgress((prev) => Math.min(prev + 12, 100));
    }
  };

  return (
    <div style={{ backgroundColor: "var(--p-white)", color: "var(--t-mid)", minHeight: "100vh" }}>
      {/* ── NAV ── */}
      <nav role="navigation" className="folio-nav sticky top-0 z-50" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="nav-logo-accent" />
          <span style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 400, color: "var(--t-primary)", letterSpacing: "-0.5px" }}>
            Folio
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <a href="#" className="nav-link">Learn</a>
          <a href="#" className="nav-link">Review</a>
          <a href="#" className="nav-link">Leagues</a>
          {/* XP Counter */}
          <span style={{ color: "var(--xp)", fontWeight: 700, fontSize: "14px" }}>
            ⚡ {xpCount} XP
          </span>
          {/* Streak Counter */}
          <span style={{ color: "var(--xp)", fontWeight: 700, fontSize: "14px" }}>
            🔥 {streakDays}
          </span>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main role="main" className="max-w-3xl mx-auto" style={{ padding: "48px 24px 80px" }}>

        {/* ── HERO / HEADLINE ── */}
        <section style={{ marginBottom: "80px", textAlign: "center" }}>
          <span className="eyebrow" style={{ marginBottom: "16px" }}>Design System</span>
          <h1 style={{ marginBottom: "16px" }}>
            Folio Component Demo
          </h1>
          <p style={{ maxWidth: "520px", margin: "0 auto", lineHeight: 1.75 }}>
            Editorial restraint meets behavioral engineering. Every element below follows the Folio design system — warm surfaces, a single coral accent, and gamification built as infrastructure.
          </p>
        </section>

        {/* ── COLOR PALETTE ── */}
        <section style={{ marginBottom: "80px" }}>
          <span className="eyebrow" style={{ marginBottom: "12px" }}>Palette</span>
          <h2 style={{ marginBottom: "32px" }}>Color Palette</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" }}>
            {[
              { name: "Snap", color: "var(--snap)", hex: "#ff5c35" },
              { name: "Focus Blue", color: "var(--focus)", hex: "#2e5be8" },
              { name: "XP Gold", color: "var(--xp)", hex: "#e8a800" },
              { name: "Sheet", color: "var(--p-sheet)", hex: "#f4f3ef", border: true },
              { name: "Surface", color: "var(--p-surface)", hex: "#eceae4", border: true },
              { name: "Border", color: "var(--p-border)", hex: "#c8c4b8", border: true },
              { name: "Success Green", color: "var(--success)", hex: "#1a7828" },
              { name: "Error Red", color: "var(--error)", hex: "#a02818" },
            ].map(({ name, color, hex, border }) => (
              <div key={name} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "100%",
                    height: "80px",
                    borderRadius: "10px",
                    backgroundColor: color,
                    border: border ? "1px solid var(--p-border)" : "none",
                    marginBottom: "8px",
                  }}
                />
                <p style={{ fontWeight: 600, color: "var(--t-deep)", fontSize: "13px", marginBottom: "2px" }}>{name}</p>
                <p style={{ color: "var(--t-secondary)", fontSize: "11px" }}>{hex}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BUTTONS ── */}
        <section style={{ marginBottom: "80px" }}>
          <span className="eyebrow" style={{ marginBottom: "12px" }}>Components</span>
          <h2 style={{ marginBottom: "32px" }}>Buttons</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "flex-start" }}>
            <div>
              <span className="eyebrow" style={{ marginBottom: "8px", fontSize: "9px" }}>Primary</span>
              <button type="button" className="btn-primary">Begin Crisis Scenario</button>
            </div>
            <div>
              <span className="eyebrow" style={{ marginBottom: "8px", fontSize: "9px" }}>Ghost</span>
              <button type="button" className="btn-ghost">View Results</button>
            </div>
            <div>
              <span className="eyebrow" style={{ marginBottom: "8px", fontSize: "9px" }}>Ghost</span>
              <button type="button" className="btn-ghost">Start New Session</button>
            </div>
            <div>
              <span className="eyebrow" style={{ marginBottom: "8px", fontSize: "9px" }}>Disabled</span>
              <button type="button" className="btn-primary" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>Loading...</button>
            </div>
          </div>
        </section>

        {/* ── ACTION BUTTONS (Answer Options) ── */}
        <section style={{ marginBottom: "80px" }}>
          <span className="eyebrow" style={{ marginBottom: "12px" }}>Interactive</span>
          <h2 style={{ marginBottom: "32px" }}>Action Buttons (Touch-Friendly)</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {["Option A", "Option B", "Option C"].map((option, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedAction(option)}
                className={`answer-option ${selectedAction === option ? "selected" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  textAlign: "left",
                  padding: "16px 20px",
                  borderColor: selectedAction === option ? "var(--snap)" : undefined,
                  borderWidth: selectedAction === option ? "1.5px" : undefined,
                  background: selectedAction === option ? "var(--snap-tint)" : undefined,
                  fontWeight: selectedAction === option ? 600 : 400,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: selectedAction === option ? "var(--snap)" : "var(--p-surface)",
                    color: selectedAction === option ? "var(--p-white)" : "var(--t-secondary)",
                    fontWeight: 700,
                    fontSize: "13px",
                    flexShrink: 0,
                  }}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span style={{ flex: 1 }}>{option}</span>
                <span style={{ color: "var(--t-muted)", fontSize: "12px" }}>Click to select</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── CARD COMPONENTS ── */}
        <section style={{ marginBottom: "80px" }}>
          <span className="eyebrow" style={{ marginBottom: "12px" }}>Surfaces</span>
          <h2 style={{ marginBottom: "32px" }}>Card Components</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="folio-card">
                <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid var(--p-border)" }}>
                  <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>Learning Node {i}</h3>
                  <p style={{ color: "var(--t-secondary)", fontSize: "13px", marginBottom: 0 }}>Mastery Level: Intermediate</p>
                </div>
                <p style={{ fontSize: "14px", marginBottom: "16px" }}>
                  This is a learning node that demonstrates card hover effects and smooth transitions.
                </p>
                <div className="progress-container">
                  <div className="progress-fill" style={{ width: `${i * 30 + 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── STATISTICS DISPLAY ── */}
        <section style={{ marginBottom: "80px" }}>
          <span className="eyebrow" style={{ marginBottom: "12px" }}>Data</span>
          <h2 style={{ marginBottom: "32px" }}>Statistics Display</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
            {[
              { label: "Final Heat", value: "72", unit: "percent", accent: "snap" },
              { label: "Integrity", value: "85", unit: "percent", accent: "focus" },
              { label: "Responses", value: "8", unit: "total", accent: "snap" },
              { label: "Mastery Cards", value: "5", unit: "unlocked", accent: "xp" },
            ].map(({ label, value, unit, accent }) => (
              <div key={label} className="folio-card" style={{ textAlign: "center", padding: "24px 16px" }}>
                <span className="eyebrow" style={{ marginBottom: "8px", fontSize: "9px" }}>{label}</span>
                <div className={`stat-${accent === "focus" ? "secondary" : accent === "xp" ? "xp" : "primary"}`} style={{ marginBottom: "4px" }}>
                  {value}
                </div>
                <p style={{ color: "var(--t-secondary)", fontSize: "12px", marginBottom: 0 }}>{unit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FORM ELEMENTS ── */}
        <section style={{ marginBottom: "80px" }}>
          <span className="eyebrow" style={{ marginBottom: "12px" }}>Inputs</span>
          <h2 style={{ marginBottom: "32px" }}>Form Elements</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "var(--t-deep)", fontSize: "14px" }}>Text Input</label>
              <input
                type="text"
                placeholder="Enter your text here..."
                className="folio-input"
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "var(--t-deep)", fontSize: "14px" }}>Textarea</label>
              <textarea
                placeholder="Enter your defense here... The app will analyze your response and provide thermal feedback based on the depth of your analysis."
                className="folio-input"
                style={{ width: "100%", minHeight: "120px", resize: "vertical", fontFamily: "inherit" }}
              />
            </div>
          </div>
        </section>

        {/* ── QUESTION CARD (Learning System UI) ── */}
        <section style={{ marginBottom: "80px" }}>
          <span className="eyebrow" style={{ marginBottom: "12px" }}>Learning UI</span>
          <h2 style={{ marginBottom: "32px" }}>Question Card</h2>

          {/* Progress bar for lesson */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span className="question-eyebrow">Question 3 of 8</span>
              <span className="points-badge">+10 XP</span>
            </div>
            <div className="progress-container">
              <div className="progress-fill" style={{ width: "37.5%" }} />
            </div>
          </div>

          <div className="question-card">
            <p className="question-text" style={{ marginBottom: "24px" }}>
              What is the primary purpose of loss aversion in behavioral design?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { text: "To punish users who miss sessions", correct: false },
                { text: "To create emotional investment that increases retention", correct: true },
                { text: "To add gamification badges to profiles", correct: false },
                { text: "To make the interface more colorful", correct: false },
              ].map(({ text, correct }, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswer(text, correct)}
                  className={`answer-option ${
                    answeredQuestion === text
                      ? correct
                        ? "correct"
                        : "wrong"
                      : ""
                  } ${answeredQuestion === text && !correct ? "shake-animation" : ""}`}
                  style={{ textAlign: "left", width: "100%" }}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Banners */}
          {answeredQuestion && (
            <div
              className={
                answeredQuestion === "To create emotional investment that increases retention"
                  ? "feedback-banner-correct"
                  : "feedback-banner-wrong"
              }
              style={{ marginTop: "16px", borderRadius: "8px" }}
            >
              {answeredQuestion === "To create emotional investment that increases retention"
                ? "✓ Correct! Loss aversion drives commitment."
                : "✗ Not quite — try again."}
            </div>
          )}
        </section>

        {/* ── FOCUS MODE STRIP ── */}
        <section style={{ marginBottom: "80px" }}>
          <span className="eyebrow" style={{ marginBottom: "12px" }}>Concentration</span>
          <h2 style={{ marginBottom: "32px" }}>Focus Mode Strip</h2>
          <div className="focus-strip">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="focus-icon">
                <span style={{ color: "var(--p-white)", fontSize: "14px" }}>◉</span>
              </div>
              <div>
                <p style={{ fontWeight: 600, color: "var(--focus-deep)", fontSize: "14px", marginBottom: "2px" }}>Deep Focus Mode</p>
                <p style={{ color: "var(--t-secondary)", fontSize: "12px", marginBottom: 0 }}>45 minutes remaining</p>
              </div>
            </div>
            <button type="button" className="focus-btn">Enter Focus</button>
          </div>
        </section>

        {/* ── STREAK & DAILY GOAL ── */}
        <section style={{ marginBottom: "80px" }}>
          <span className="eyebrow" style={{ marginBottom: "12px" }}>Gamification</span>
          <h2 style={{ marginBottom: "32px" }}>Streak & Daily Goal</h2>

          {/* Weekly streak row */}
          <div className="folio-card" style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ color: "var(--xp)", fontWeight: 700, fontSize: "22px", letterSpacing: "-0.5px" }}>
                🔥 {streakDays} day streak
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                <div key={day} style={{ textAlign: "center", flex: 1 }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      margin: "0 auto 4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 600,
                      ...(idx < streakDays
                        ? { backgroundColor: "var(--snap)", color: "var(--p-white)" }
                        : idx === streakDays
                        ? { border: "2px solid var(--snap)", color: "var(--snap)", animation: "pulse 2s infinite" }
                        : { backgroundColor: "var(--p-tint)", color: "var(--t-muted)" }),
                    }}
                  >
                    {idx < streakDays ? "✓" : ""}
                  </div>
                  <span style={{ fontSize: "10px", color: "var(--t-muted)" }}>{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily XP Goal */}
          <div className="folio-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontWeight: 600, color: "var(--t-deep)", fontSize: "14px" }}>Daily Goal</span>
              <span style={{ color: "var(--xp)", fontWeight: 700, fontSize: "14px" }}>{dailyProgress}%</span>
            </div>
            <div className="progress-container" style={{ height: "8px" }}>
              <div className="progress-fill" style={{ width: `${dailyProgress}%` }} />
            </div>
            <p style={{ marginTop: "8px", color: "var(--t-secondary)", fontSize: "12px", marginBottom: 0 }}>
              Complete today&apos;s goal — earn 50 XP bonus
            </p>
          </div>
        </section>

        {/* ── FEEDBACK STATES ── */}
        <section style={{ marginBottom: "80px" }}>
          <span className="eyebrow" style={{ marginBottom: "12px" }}>Feedback</span>
          <h2 style={{ marginBottom: "32px" }}>Feedback States</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: "10px", padding: "16px", color: "var(--error)", fontWeight: 600 }}>
              [FROST] Your logic is shallow. This exposes a critical gap in your reasoning about causality.
            </div>
            <div style={{ background: "var(--warning-bg)", border: "1px solid var(--warning-border)", borderRadius: "10px", padding: "16px", color: "var(--warning)", fontWeight: 600 }}>
              [WARNING] You are on the right track, but your defense is incomplete. Consider other perspectives.
            </div>
            <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-border)", borderRadius: "10px", padding: "16px", color: "var(--success)", fontWeight: 600 }}>
              [IGNITION] Deep causality detected! You have grasped the leverage point in this system.
            </div>
          </div>
        </section>

        {/* ── ANIMATIONS ── */}
        <section style={{ marginBottom: "80px" }}>
          <span className="eyebrow" style={{ marginBottom: "12px" }}>Motion</span>
          <h2 style={{ marginBottom: "32px" }}>Animations</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
            <div className="folio-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "120px" }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%",
                border: "3px solid var(--p-border)", borderTopColor: "var(--snap)",
                animation: "spin 0.8s linear infinite",
              }} />
              <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-secondary)", marginTop: "12px", marginBottom: 0 }}>Loading</p>
            </div>
            <div className="folio-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "120px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px", background: "var(--snap)",
                animation: "bounce-light 1.5s infinite",
              }} />
              <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-secondary)", marginTop: "12px", marginBottom: 0 }}>Bounce</p>
            </div>
            <div className="folio-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "120px" }}>
              <div style={{ fontSize: "28px", color: "var(--success)", animation: "pulse 1.5s infinite" }}>✓</div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-secondary)", marginTop: "12px", marginBottom: 0 }}>Success</p>
            </div>
          </div>
        </section>

        {/* ── DEFENSE TEXTBOX (Slide-up) ── */}
        <section style={{ marginBottom: "80px" }}>
          <span className="eyebrow" style={{ marginBottom: "12px" }}>Interactive</span>
          <h2 style={{ marginBottom: "32px" }}>Defense Textbox (Slide-Up)</h2>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <button
              type="button"
              onClick={() => setShowDefense(!showDefense)}
              className="btn-primary"
            >
              {showDefense ? "Hide Defense Box" : "Show Defense Box"}
            </button>
          </div>
          {showDefense && (
            <div className="folio-card" style={{ animation: "slideUp 0.3s ease-out" }}>
              <label className="eyebrow" style={{ marginBottom: "12px" }}>Type Your Defense</label>
              <textarea
                className="folio-input"
                placeholder="Explain your choice and reasoning... Min 20 characters required."
                style={{ width: "100%", minHeight: "100px", resize: "vertical", fontFamily: "inherit", marginBottom: "12px" }}
              />
              <button type="button" className="btn-primary" style={{ width: "100%" }}>Submit Defense</button>
            </div>
          )}
        </section>

        {/* ── MVC ARCHITECTURE ── */}
        <section style={{ borderTop: "1px solid var(--p-border)", paddingTop: "48px" }}>
          <span className="eyebrow" style={{ marginBottom: "12px" }}>Architecture</span>
          <h2 style={{ marginBottom: "32px" }}>MVC Architecture</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {[
              { title: "Model Layer", file: "GameModel.ts", desc: "handles business logic, validation, and thermal state calculations." },
              { title: "Controller Layer", file: "GameController.ts", desc: "orchestrates user interactions and routes actions to the model." },
              { title: "View Layer", file: "React Components", desc: "display state from Zustand store with interactive UI." },
            ].map(({ title, file, desc }) => (
              <div key={title} className="folio-card" style={{ textAlign: "center" }}>
                <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid var(--p-border)" }}>
                  <h3 style={{ fontSize: "16px" }}>{title}</h3>
                </div>
                <p style={{ fontSize: "13px", color: "var(--t-secondary)", marginBottom: 0 }}>
                  <strong>{file}</strong> {desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
