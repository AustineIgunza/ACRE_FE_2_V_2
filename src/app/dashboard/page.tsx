"use client";

import { useEffect } from "react";
import { useArceStore } from "@/store/arceStore";
import { useFlashpointStore } from "@/store/flashpointStore";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import FlashpointRenderer from "@/components/dashboard/FlashpointRenderer";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const { user, authInitialized, initAuth } = useArceStore();
  const { triageQueue, fetchTriage, isLoading, currentNodeId, startReview } = useFlashpointStore();
  const router = useRouter();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (authInitialized && !user) {
      router.push("/signin");
    }
  }, [user, authInitialized, router]);

  useEffect(() => {
    if (user) {
      fetchTriage();
    }
  }, [user, fetchTriage]);

  if (!authInitialized || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--p-surface)" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid var(--p-border)", borderTopColor: "var(--snap)", animation: "spin 0.6s linear infinite" }} />
      </div>
    );
  }

  // If we are reviewing a node, hijack the screen
  if (currentNodeId) {
    return <FlashpointRenderer />;
  }

  return (
    <div style={{ backgroundColor: "var(--p-surface)", minHeight: "100vh", color: "var(--t-mid)" }}>
      <Navbar />

      <main role="main" style={{ padding: "48px 24px 80px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px", animation: "slideUp 0.4s ease-out" }}>
          <span className="eyebrow" style={{ marginBottom: "12px", display: "inline-block", color: "var(--snap)" }}>
            FLASHPOINT TARGETS
          </span>
          <h1 style={{ fontSize: "36px", letterSpacing: "-1px", color: "var(--t-primary)", marginBottom: "8px" }}>
            Triage Dashboard
          </h1>
          <p style={{ fontSize: "17px", color: "var(--t-secondary)" }}>
            Review strictly prioritized interventions based on predictive decay models.
          </p>
        </div>

        {isLoading && triageQueue.length === 0 ? (
           <div style={{ textAlign: "center", padding: "40px", color: "var(--t-muted)" }}>Scanning vectors...</div>
        ) : triageQueue.length === 0 ? (
          <div style={{ 
            textAlign: "center", padding: "80px 24px", color: "var(--success)", 
            border: "1px dashed var(--p-border)", borderRadius: "12px" 
          }}>
            <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>All Clear</h2>
            <p style={{ color: "var(--t-secondary)" }}>No concepts are mathematically decaying today. You are at full situational awareness.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {triageQueue.map((node: any, index: number) => (
              <motion.div
                key={node.node_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => startReview(node.node_id)}
                style={{
                  padding: "24px",
                  backgroundColor: "var(--p-white)",
                  border: "1px solid var(--p-border)",
                  borderLeft: "4px solid var(--snap)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s"
                }}
                whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
              >
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--t-primary)", marginBottom: "4px" }}>
                    {node.title}
                  </h3>
                  <div style={{ fontSize: "13px", color: "var(--t-muted)" }}>
                    Interval Phase: {node.current_interval} Days • Heat Integrity: {node.heat_score}%
                  </div>
                </div>
                <button className="button-primary" style={{ padding: "8px 24px" }}>
                  INTERVENE
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
