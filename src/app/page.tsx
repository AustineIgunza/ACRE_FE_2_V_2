"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useArceStore } from "@/store/arceStore";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const spring      = { type: "spring" as const, stiffness: 460, damping: 38 };
const smoothSpring = { type: "spring" as const, stiffness: 300, damping: 28 };

const FEATURES = [
  {
    icon: "🧠",
    iconBg: "var(--snap-tint)", iconColor: "var(--snap)",
    title: "Active Recall",
    body: "Stop re-reading notes. ARCÉ breaks your material into causal anchors and forces you to defend your logic in interactive scenarios.",
    delay: 0,
  },
  {
    icon: "🔥",
    iconBg: "var(--warning-bg)", iconColor: "var(--xp)",
    title: "Behavioral Hooks",
    body: "Leverage the psychology of streaks, progressive disclosure, and daily XP goals to make studying as addictive as a game.",
    delay: 80,
  },
  {
    icon: "✓",
    iconBg: "var(--success-bg)", iconColor: "var(--success)",
    title: "Immediate Feedback",
    body: "No more waiting for exam grades. Get instant, deep feedback on your logic structure with ARCÉ's thermal rating system.",
    delay: 160,
  },
];

const STATS = [
  { value: "5×", label: "Better retention vs passive reading" },
  { value: "80%", label: "Less study time for the same mastery" },
  { value: "3m", label: "Average session to encode a node" },
];

export default function LandingPage() {
  const { user, authInitialized } = useArceStore();
  const [scrolled, setScrolled] = useState(false);
  useScrollReveal();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ backgroundColor: "var(--p-white)", minHeight: "100vh", color: "var(--t-mid)", position: "relative", overflow: "hidden" }}>
      {/* Animated background */}
      <style>{`
        @keyframes drift1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.08)} 66%{transform:translate(-20px,20px) scale(0.96)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-50px,25px) scale(1.05)} 66%{transform:translate(30px,-40px) scale(0.94)} }
        @keyframes drift3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(25px,35px) scale(1.1)} }
        @keyframes floatDot { 0%,100%{opacity:0.35;transform:translateY(0)} 50%{opacity:0.7;transform:translateY(-18px)} }
      `}</style>
      {/* Soft gradient orbs */}
      <div aria-hidden style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-10%", left:"-5%", width:"55vw", height:"55vw", borderRadius:"50%", background:"radial-gradient(circle, rgba(255,92,53,0.07) 0%, transparent 65%)", animation:"drift1 18s ease-in-out infinite" }} />
        <div style={{ position:"absolute", bottom:"-15%", right:"-8%", width:"50vw", height:"50vw", borderRadius:"50%", background:"radial-gradient(circle, rgba(255,92,53,0.05) 0%, transparent 65%)", animation:"drift2 22s ease-in-out infinite" }} />
        <div style={{ position:"absolute", top:"40%", left:"55%", width:"35vw", height:"35vw", borderRadius:"50%", background:"radial-gradient(circle, rgba(46,91,232,0.04) 0%, transparent 65%)", animation:"drift3 28s ease-in-out infinite" }} />
        {/* Floating dots */}
        {[
          {top:"18%",left:"8%",size:5,delay:"0s"},{top:"65%",left:"4%",size:4,delay:"1.2s"},
          {top:"30%",left:"88%",size:6,delay:"0.7s"},{top:"75%",left:"82%",size:4,delay:"2s"},
          {top:"50%",left:"48%",size:3,delay:"1.8s"},{top:"12%",left:"60%",size:5,delay:"0.4s"},
        ].map((d,i)=>(
          <div key={i} aria-hidden style={{ position:"absolute", top:d.top, left:d.left, width:d.size, height:d.size, borderRadius:"50%", backgroundColor:"var(--snap)", opacity:0.35, animation:`floatDot ${3+i*0.4}s ease-in-out infinite`, animationDelay:d.delay }} />
        ))}
      </div>

      {/* ── TOP NAV ─────────────────────────────────────────────────────── */}
      <div style={{ position:"relative", zIndex:1 }}>
      <motion.nav
        role="navigation"
        className={`folio-nav sticky top-0 z-50 ${scrolled ? "nav-glass" : ""}`}
        style={{ justifyContent: "space-between", borderBottom: "1px solid var(--p-border)", padding: "16px 24px" }}
      >
        <Link href="/learn" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <motion.span whileHover={{ scale: 1.1, rotate: 4 }} whileTap={{ scale: 0.94 }} transition={spring}>
            <span className="nav-logo-accent" />
          </motion.span>
          <span style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 400, color: "var(--t-primary)", letterSpacing: "-0.5px" }}>
            ARCÉ
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {authInitialized && user ? (
            <Link href="/learn">
              <motion.button
                className="btn-primary ripple-wrap"
                whileHover={{ scale: 1.04, y: -1, boxShadow: "0 6px 22px rgba(255,92,53,0.32)" }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
                style={{ padding: "8px 20px", fontSize: "14px", borderRadius: "9px" }}
              >
                Learn
              </motion.button>
            </Link>
          ) : (
            <>
              <Link href="/signin" className="nav-link link-slide" style={{ fontWeight: 600, fontSize: "14px" }}>
                Sign In
              </Link>
              <Link href="/signup">
                <motion.button
                  className="btn-primary ripple-wrap"
                  whileHover={{ scale: 1.04, y: -1, boxShadow: "0 6px 22px rgba(255,92,53,0.32)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={spring}
                  style={{ padding: "8px 20px", fontSize: "14px", borderRadius: "9px" }}
                >
                  Get Started
                </motion.button>
              </Link>
            </>
          )}
        </div>
      </motion.nav>

      <main role="main">
        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <section style={{ padding: "120px 24px 80px", textAlign: "center", maxWidth: "840px", margin: "0 auto" }}>
          <motion.span
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothSpring, delay: 0.1 }}
            className="eyebrow"
            style={{ marginBottom: "24px", display: "inline-block" }}
          >
            THE LEARNING ENGINE
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothSpring, delay: 0.18 }}
            style={{ fontSize: "clamp(40px,7vw,68px)", letterSpacing: "-2px", lineHeight: 1.08, marginBottom: "28px", color: "var(--t-primary)", fontFamily: "Georgia, serif" }}
          >
            Mastery is a habit,<br />not a destination.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothSpring, delay: 0.26 }}
            style={{ fontSize: "20px", color: "var(--t-secondary)", lineHeight: 1.65, maxWidth: "600px", margin: "0 auto 44px" }}
          >
            ARCÉ uses behavioral engineering to convert your passive study material into engaging, retention-optimized challenge scenarios.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothSpring, delay: 0.34 }}
            style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}
          >
            {authInitialized && user ? (
              <Link href="/learn">
                <motion.button
                  className="btn-primary ripple-wrap"
                  whileHover={{ scale: 1.04, y: -2, boxShadow: "0 10px 32px rgba(255,92,53,0.36)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={spring}
                  style={{ padding: "16px 36px", fontSize: "17px", borderRadius: "12px" }}
                >
                  Go to Learn
                </motion.button>
              </Link>
            ) : (
              <Link href="/signup">
                <motion.button
                  className="btn-primary ripple-wrap"
                  whileHover={{ scale: 1.04, y: -2, boxShadow: "0 10px 32px rgba(255,92,53,0.36)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={spring}
                  style={{ padding: "16px 36px", fontSize: "17px", borderRadius: "12px" }}
                >
                  Start Learning Free
                </motion.button>
              </Link>
            )}
            <Link href="/demo">
              <motion.button
                className="btn-ghost ripple-wrap"
                whileHover={{ scale: 1.03, y: -2, borderColor: "var(--snap)", color: "var(--snap)", boxShadow: "0 6px 20px rgba(22,20,16,0.08)" }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
                style={{ padding: "16px 36px", fontSize: "17px", borderRadius: "12px" }}
              >
                View Demo
              </motion.button>
            </Link>
          </motion.div>
        </section>

        {/* ── STATS STRIP ─────────────────────────────────────────────────── */}
        <section style={{ padding: "0 24px 80px", maxWidth: "760px", margin: "0 auto" }}>
          <div className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2px" }}>
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`reveal reveal-d${i + 1}`}
                style={{
                  textAlign: "center", padding: "28px 16px",
                  borderTop: "1px solid var(--p-border)",
                  borderLeft: i > 0 ? "1px solid var(--p-border)" : "none",
                }}
              >
                <div style={{ fontSize: "36px", fontWeight: 700, color: "var(--snap)", letterSpacing: "-1px", lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "13px", color: "var(--t-muted)", marginTop: "6px", lineHeight: 1.4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES GRID ───────────────────────────────────────────────── */}
        <section style={{ padding: "40px 24px 120px", maxWidth: "1060px", margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: "52px" }}>
            <span className="eyebrow" style={{ marginBottom: "12px", display: "inline-block" }}>WHY ARCÉ</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-1px", color: "var(--t-primary)", fontFamily: "Georgia, serif" }}>
              Built on learning science
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "24px" }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className={`folio-card card-lift reveal reveal-d${i + 1}`}
                whileHover={{
                  y: -6,
                  boxShadow: "0 16px 48px rgba(22,20,16,0.13), 0 4px 16px rgba(22,20,16,0.07)",
                  borderColor: "var(--snap-border)",
                }}
                transition={smoothSpring}
                style={{ padding: "40px" }}
              >
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 4 }}
                  transition={spring}
                  style={{
                    width: "52px", height: "52px", borderRadius: "14px",
                    background: f.iconBg, color: f.iconColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "26px", marginBottom: "24px",
                  }}
                >
                  {f.icon}
                </motion.div>
                <h3 style={{ fontSize: "22px", marginBottom: "12px", color: "var(--t-deep)", letterSpacing: "-0.4px" }}>{f.title}</h3>
                <p style={{ color: "var(--t-mid)", lineHeight: 1.65, fontSize: "15px" }}>{f.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
        <section style={{ padding: "80px 24px 120px", backgroundColor: "var(--p-surface)", borderTop: "1px solid var(--p-border)" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <div className="reveal" style={{ textAlign: "center", marginBottom: "56px" }}>
              <span className="eyebrow" style={{ marginBottom: "12px", display: "inline-block" }}>THE ARCÉ CYCLE</span>
              <h2 style={{ fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-1px", color: "var(--t-primary)", fontFamily: "Georgia, serif" }}>
                Five steps to real mastery
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                { step: "01", title: "Deconstruct", desc: "Your material is broken into Logical Nodes — the 20% of concepts that drive 80% of understanding.", icon: "🔬" },
                { step: "02", title: "Challenge",   desc: "Face a high-stakes scenario. No hints. You defend the logic or you fail.", icon: "⚡" },
                { step: "03", title: "Encode",      desc: "The AI stress-tests your reasoning, exposing fallacies and shallow crutches.", icon: "🧠" },
                { step: "04", title: "Connect",     desc: "Once nodes are mastered, synthesise them into a unified mental model.", icon: "🔗" },
                { step: "05", title: "Review",      desc: "Spaced repetition surfaces the right node at the right time — forever.", icon: "🔁" },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  className={`reveal reveal-d${Math.min(i + 1, 6)}`}
                  whileHover={{ x: 6, backgroundColor: "var(--p-sheet)" }}
                  transition={smoothSpring}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: "20px",
                    padding: "24px 20px", borderRadius: "14px",
                    borderBottom: i < 4 ? "1px solid var(--p-border)" : "none",
                  }}
                >
                  <div style={{ fontSize: "22px", flexShrink: 0, marginTop: "2px" }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: "var(--snap)", textTransform: "uppercase" }}>Step {s.step}</span>
                      <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--t-primary)" }}>{s.title}</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--t-secondary)", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ──────────────────────────────────────────────────── */}
        <section style={{ padding: "120px 24px", textAlign: "center", borderTop: "1px solid var(--p-border)" }}>
          <div className="reveal" style={{ maxWidth: "560px", margin: "0 auto" }}>
            {authInitialized && user ? (
              <>
                <h2 style={{ fontSize: "clamp(28px,5vw,44px)", letterSpacing: "-1.2px", marginBottom: "28px", color: "var(--t-primary)", fontFamily: "Georgia, serif" }}>
                  Pick up where you left off
                </h2>
                <Link href="/dashboard">
                  <motion.button
                    className="btn-primary ripple-wrap"
                    whileHover={{ scale: 1.04, y: -2, boxShadow: "0 12px 36px rgba(255,92,53,0.36)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={spring}
                    style={{ padding: "18px 48px", fontSize: "18px", borderRadius: "14px" }}
                  >
                    Go to Dashboard
                  </motion.button>
                </Link>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: "clamp(28px,5vw,44px)", letterSpacing: "-1.2px", marginBottom: "28px", color: "var(--t-primary)", fontFamily: "Georgia, serif" }}>
                  Ready to build a streak?
                </h2>
                <Link href="/signup">
                  <motion.button
                    className="btn-primary ripple-wrap"
                    whileHover={{ scale: 1.04, y: -2, boxShadow: "0 12px 36px rgba(255,92,53,0.36)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={spring}
                    style={{ padding: "18px 48px", fontSize: "18px", borderRadius: "14px" }}
                  >
                    Create Your Account
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ padding: "40px 24px", textAlign: "center", borderTop: "1px solid var(--p-border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
          <span className="nav-logo-accent" style={{ width: "16px", height: "16px", borderRadius: "4px" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "var(--t-primary)" }}>ARCÉ</span>
        </div>
        <p style={{ fontSize: "13px", color: "var(--t-muted)" }}>
          © {new Date().getFullYear()} ARCÉ Learning System. All rights reserved.
        </p>
      </footer>
      </div>
    </div>
  );
}
