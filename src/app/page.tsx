"use client";

import Link from "next/link";
import { useArceStore } from "@/store/arceStore";

export default function LandingPage() {
  const { user, authInitialized } = useArceStore();
  return (
    <div style={{ backgroundColor: "var(--p-white)", minHeight: "100vh", color: "var(--t-mid)" }}>
      {/* ── TOP NAV ── */}
      <nav role="navigation" className="folio-nav sticky top-0 z-50" style={{ justifyContent: "space-between", borderBottom: "1px solid var(--p-border)", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="nav-logo-accent" />
          <span style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 400, color: "var(--t-primary)", letterSpacing: "-0.5px" }}>
            Learn Forge
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {authInitialized && user ? (
            <Link href="/dashboard">
              <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "14px" }}>
                Dashboard
              </button>
            </Link>
          ) : (
            <>
              <Link href="/signin" className="nav-link" style={{ fontWeight: 600 }}>Sign In</Link>
              <Link href="/signup">
                <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "14px" }}>
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      <main role="main">
        {/* ── HERO SECTION ── */}
        <section style={{ 
          padding: "120px 24px 80px", 
          textAlign: "center", 
          maxWidth: "800px", 
          margin: "0 auto",
          animation: "slideUp 0.6s ease-out" 
        }}>
          <span className="eyebrow" style={{ marginBottom: "24px", display: "inline-block" }}>
            THE LEARNING ENGINE
          </span>
          <h1 style={{ 
            fontSize: "64px", 
            letterSpacing: "-1.5px", 
            lineHeight: 1.1, 
            marginBottom: "24px",
            color: "var(--t-primary)"
          }}>
            Mastery is a habit,<br />not a destination.
          </h1>
          <p style={{ 
            fontSize: "20px", 
            color: "var(--t-secondary)", 
            lineHeight: 1.6, 
            maxWidth: "600px", 
            margin: "0 auto 40px" 
          }}>
            Learn Forge uses behavioral engineering to convert your passive study material into engaging, retention-optimized challenge scenarios.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            {authInitialized && user ? (
              <Link href="/dashboard">
                <button className="btn-primary" style={{ padding: "16px 32px", fontSize: "16px" }}>
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              <Link href="/signup">
                <button className="btn-primary" style={{ padding: "16px 32px", fontSize: "16px" }}>
                  Start Learning Free
                </button>
              </Link>
            )}
            <Link href="/demo">
              <button className="btn-ghost" style={{ padding: "16px 32px", fontSize: "16px" }}>
                View Interactive Demo
              </button>
            </Link>
          </div>
        </section>

        {/* ── FEATURES GRID ── */}
        <section style={{ padding: "80px 24px 120px", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px" }}>
            
            {/* Feature 1 */}
            <div className="folio-card" style={{ padding: "40px", animation: "slideUp 0.8s ease-out" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--snap-tint)", color: "var(--snap)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "24px" }}>
                🧠
              </div>
              <h3 style={{ fontSize: "24px", marginBottom: "12px", color: "var(--t-deep)" }}>Active Recall</h3>
              <p style={{ color: "var(--t-mid)", lineHeight: 1.6 }}>
                Stop re-reading notes. Learn Forge breaks your material into causal anchors and forces you to defend your logic in interactive scenarios.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="folio-card" style={{ padding: "40px", animation: "slideUp 1s ease-out" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--warning-bg)", color: "var(--xp)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "24px" }}>
                🔥
              </div>
              <h3 style={{ fontSize: "24px", marginBottom: "12px", color: "var(--t-deep)" }}>Behavioral Hooks</h3>
              <p style={{ color: "var(--t-mid)", lineHeight: 1.6 }}>
                Leverage the psychology of streaks, progressive disclosure, and daily XP goals to make studying as addictive as a game.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="folio-card" style={{ padding: "40px", animation: "slideUp 1.2s ease-out" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--success-bg)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "24px" }}>
                ✓
              </div>
              <h3 style={{ fontSize: "24px", marginBottom: "12px", color: "var(--t-deep)" }}>Immediate Feedback</h3>
              <p style={{ color: "var(--t-mid)", lineHeight: 1.6 }}>
                No more waiting for exam grades. Get instant, deep feedback on your logic structure with Learn Forge&apos;s thermal rating system.
              </p>
            </div>

          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section style={{ 
          padding: "100px 24px", 
          textAlign: "center", 
          borderTop: "1px solid var(--p-border)",
          backgroundColor: "var(--p-surface)" 
        }}>
          {authInitialized && user ? (
            <>
              <h2 style={{ fontSize: "40px", letterSpacing: "-1px", marginBottom: "24px", color: "var(--t-primary)" }}>
                Pick up where you left off
              </h2>
              <Link href="/dashboard">
                <button className="btn-primary" style={{ padding: "16px 40px", fontSize: "18px" }}>
                  Go to Dashboard
                </button>
              </Link>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: "40px", letterSpacing: "-1px", marginBottom: "24px", color: "var(--t-primary)" }}>
                Ready to build a streak?
              </h2>
              <Link href="/signup">
                <button className="btn-primary" style={{ padding: "16px 40px", fontSize: "18px" }}>
                  Create Your Account
                </button>
              </Link>
            </>
          )}
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "40px 24px", textAlign: "center", borderTop: "1px solid var(--p-border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
          <span className="nav-logo-accent" style={{ width: "16px", height: "16px", borderRadius: "4px" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "var(--t-primary)" }}>Learn Forge</span>
        </div>
        <p style={{ fontSize: "13px", color: "var(--t-muted)" }}>
          © {new Date().getFullYear()} Learn Forge Learning System. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
