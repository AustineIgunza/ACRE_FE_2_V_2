"use client";

import { useEffect, useState } from "react";
import { useArceStore } from "@/store/arceStore";
import { motion } from "framer-motion";
import Link from "next/link";

interface DueReview {
  concept_id: string;
  concept_name: string;
  core_principle: string;
  phase: 1 | 2 | 3;
  daysOverdue: number;
  successRate: number;
  totalAttempts: number;
  lastReviewedAt: string;
  current_interval: number;
  ease_multiplier: number;
}

interface TriageData {
  totalDue: number;
  urgentCount: number;
  phase1Count: number;
  phase2Count: number;
  phase3Count: number;
  dueReviews: DueReview[];
  summary: {
    totalNodes: number;
    masteryPercentage: number;
  };
}

const phaseColors = {
  1: { bg: "#1f2937", border: "#3b82f6", text: "#93c5fd", label: "Foundation" },
  2: { bg: "#1f2937", border: "#f59e0b", text: "#fbbf24", label: "Application" },
  3: { bg: "#1f2937", border: "#ef4444", text: "#fca5a5", label: "Blindspot" },
};

export default function FlashpointTriageView() {
  const { user, authInitialized, initAuth } = useArceStore();
  const [isLoading, setIsLoading] = useState(true);
  const [triageData, setTriageData] = useState<TriageData | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<1 | 2 | 3 | null>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!user) return;

    const fetchTriageData = async () => {
      try {
        const response = await fetch(`/api/flashpoint/triage?userId=${user.id}`);
        const data = await response.json();
        setTriageData(data);
      } catch (error) {
        console.error("Failed to fetch triage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTriageData();
  }, [user]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--p-surface)",
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "3px solid var(--p-border)",
          borderTopColor: "var(--snap)",
          animation: "spin 0.6s linear infinite",
        }} />
      </div>
    );
  }

  if (!triageData) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--p-surface)",
        color: "var(--t-mid)",
      }}>
        <p>Failed to load flashpoint data.</p>
      </div>
    );
  }

  const filteredReviews = selectedPhase
    ? triageData.dueReviews.filter((r) => r.phase === selectedPhase)
    : triageData.dueReviews;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--p-surface)",
      color: "var(--t-mid)",
      padding: "40px 20px",
    }}>
      <style>{`
        @keyframes glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.3); }
          50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.6); }
        }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: "40px" }}
        >
          <h1 style={{
            fontSize: "32px",
            fontWeight: 600,
            marginBottom: "10px",
            color: "var(--snap)",
          }}>
            Flashpoint Triage
          </h1>
          <p style={{ color: "var(--t-low)", fontSize: "14px" }}>
            {triageData.totalDue} concepts due for review today
          </p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {/* Overall Mastery */}
          <div style={{
            padding: "20px",
            backgroundColor: "var(--p-card)",
            border: "1px solid var(--p-border)",
            borderRadius: "8px",
            cursor: "pointer",
          }}>
            <div style={{ fontSize: "12px", color: "var(--t-low)", marginBottom: "8px" }}>
              Overall Mastery
            </div>
            <div style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "var(--snap)",
            }}>
              {triageData.summary.masteryPercentage.toFixed(1)}%
            </div>
            <div style={{ fontSize: "11px", color: "var(--t-low)", marginTop: "4px" }}>
              {triageData.summary.totalNodes} total concepts
            </div>
          </div>

          {/* Phase 1 */}
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            onClick={() => setSelectedPhase(selectedPhase === 1 ? null : 1)}
            style={{
              padding: "20px",
              backgroundColor: "var(--p-card)",
              border: `1px solid ${phaseColors[1].border}`,
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: selectedPhase === 1 ? `0 0 20px ${phaseColors[1].border}40` : "none",
            }}
          >
            <div style={{ fontSize: "12px", color: phaseColors[1].text, marginBottom: "8px" }}>
              {phaseColors[1].label}
            </div>
            <div style={{ fontSize: "28px", fontWeight: 600, color: phaseColors[1].text }}>
              {triageData.phase1Count}
            </div>
            <div style={{ fontSize: "11px", color: "var(--t-low)", marginTop: "4px" }}>
              Rapid recognition drills
            </div>
          </motion.div>

          {/* Phase 2 */}
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            onClick={() => setSelectedPhase(selectedPhase === 2 ? null : 2)}
            style={{
              padding: "20px",
              backgroundColor: "var(--p-card)",
              border: `1px solid ${phaseColors[2].border}`,
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: selectedPhase === 2 ? `0 0 20px ${phaseColors[2].border}40` : "none",
            }}
          >
            <div style={{ fontSize: "12px", color: phaseColors[2].text, marginBottom: "8px" }}>
              {phaseColors[2].label}
            </div>
            <div style={{ fontSize: "28px", fontWeight: 600, color: phaseColors[2].text }}>
              {triageData.phase2Count}
            </div>
            <div style={{ fontSize: "11px", color: "var(--t-low)", marginTop: "4px" }}>
              Proposal evaluation
            </div>
          </motion.div>

          {/* Phase 3 */}
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            onClick={() => setSelectedPhase(selectedPhase === 3 ? null : 3)}
            style={{
              padding: "20px",
              backgroundColor: "var(--p-card)",
              border: `1px solid ${phaseColors[3].border}`,
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: selectedPhase === 3 ? `0 0 20px ${phaseColors[3].border}40` : "none",
            }}
          >
            <div style={{ fontSize: "12px", color: phaseColors[3].text, marginBottom: "8px" }}>
              {phaseColors[3].label}
            </div>
            <div style={{ fontSize: "28px", fontWeight: 600, color: phaseColors[3].text }}>
              {triageData.phase3Count}
            </div>
            <div style={{ fontSize: "11px", color: "var(--t-low)", marginTop: "4px" }}>
              Blindspot detection
            </div>
          </motion.div>
        </motion.div>

        {/* Due Reviews List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 style={{
            fontSize: "18px",
            fontWeight: 600,
            marginBottom: "20px",
            color: "var(--t-high)",
          }}>
            {selectedPhase ? `${phaseColors[selectedPhase].label} Reviews` : "All Due Reviews"}
          </h2>

          {filteredReviews.length === 0 ? (
            <div style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--t-low)",
              backgroundColor: "var(--p-card)",
              borderRadius: "8px",
              border: "1px dashed var(--p-border)",
            }}>
              <p>No {selectedPhase ? `${phaseColors[selectedPhase].label.toLowerCase()}` : ""} reviews due today.</p>
              <p style={{ fontSize: "12px", marginTop: "8px" }}>
                Great job staying ahead! Check back tomorrow.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {filteredReviews.map((review, idx) => (
                <motion.div
                  key={review.concept_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    padding: "20px",
                    backgroundColor: "var(--p-card)",
                    border: `1px solid ${phaseColors[review.phase].border}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  whileHover={{ scale: 1.01, boxShadow: `0 0 20px ${phaseColors[review.phase].border}40` }}
                >
                  {/* Overdue Badge */}
                  {review.daysOverdue > 0 && (
                    <div style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      backgroundColor: "#ef4444",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}>
                      {review.daysOverdue}d overdue
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "var(--t-high)",
                        marginBottom: "4px",
                      }}>
                        {review.concept_name}
                      </h3>
                      <p style={{ fontSize: "13px", color: "var(--t-low)", lineHeight: 1.4 }}>
                        {review.core_principle}
                      </p>
                    </div>
                    <div style={{
                      padding: "6px 12px",
                      backgroundColor: phaseColors[review.phase].bg,
                      border: `1px solid ${phaseColors[review.phase].border}`,
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: phaseColors[review.phase].text,
                    }}>
                      {phaseColors[review.phase].label}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "12px",
                    fontSize: "12px",
                    color: "var(--t-low)",
                    borderTop: "1px solid var(--p-border)",
                    paddingTop: "12px",
                  }}>
                    <div>
                      <div style={{ fontSize: "10px", marginBottom: "2px" }}>Success Rate</div>
                      <div style={{ color: phaseColors[review.phase].text, fontWeight: 600 }}>
                        {(review.successRate * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", marginBottom: "2px" }}>Attempts</div>
                      <div style={{ color: phaseColors[review.phase].text, fontWeight: 600 }}>
                        {review.totalAttempts}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", marginBottom: "2px" }}>Interval</div>
                      <div style={{ color: phaseColors[review.phase].text, fontWeight: 600 }}>
                        {review.current_interval} days
                      </div>
                    </div>
                  </div>

                  {/* Review Button */}
                  <Link href={`/learn?conceptId=${review.concept_id}&phase=${review.phase}`}>
                    <button style={{
                      marginTop: "12px",
                      width: "100%",
                      padding: "10px",
                      backgroundColor: phaseColors[review.phase].border,
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "13px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.8";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    >
                      Begin Review
                    </button>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
