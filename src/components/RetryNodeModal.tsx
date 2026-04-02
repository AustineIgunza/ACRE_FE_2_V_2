"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useArceStore } from "@/store/arceStore";

interface RetryNodeModalProps {
  nodeId: string;
  nodeName: string;
  heatScore: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: any) => void;
}

export default function RetryNodeModal({
  nodeId,
  nodeName,
  heatScore,
  isOpen,
  onClose,
  onSuccess,
}: RetryNodeModalProps) {
  const { user } = useArceStore();
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const handleStartReview = async () => {
    setReviewLoading(true);
    try {
      // Fetch review scenario from API
      const response = await fetch("/api/flashpoint/get-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptId: nodeId,
          userId: user?.id || "demo-user",
        }),
      });

      const data = await response.json();
      if (data.scenario) {
        setReviewData(data.scenario);
        setIsReviewing(true);
      } else {
        console.error("Failed to load review scenario");
      }
    } catch (error) {
      console.error("Error fetching review scenario:", error);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleCompleteReview = async (result: any) => {
    setIsReviewing(false);
    if (onSuccess) {
      onSuccess(result);
    }
    // Keep modal open to show result, user can close it
  };

  const getHeatColor = (heat: number) => {
    if (heat >= 70) return "#22c55e"; // Green - Ignition
    if (heat > 45) return "#f59e0b"; // Orange - Warning
    if (heat > 0) return "#3b82f6"; // Blue - Frost
    return "#9ca3af"; // Gray - Inactive
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "90%",
              maxWidth: "600px",
              backgroundColor: "var(--p-white)",
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              overflow: "hidden",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {!isReviewing ? (
              // Node Info & Options
              <div style={{ padding: "40px 32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "32px" }}>
                  <div>
                    <h2 style={{
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "var(--t-primary)",
                      margin: 0,
                      marginBottom: "8px",
                    }}>
                      {nodeName}
                    </h2>
                    <p style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: "var(--t-muted)",
                      margin: 0,
                    }}>
                      Node ID: {nodeId}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: "1px solid var(--p-border)",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      fontSize: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--t-muted)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--p-surface)";
                      e.currentTarget.style.color = "var(--t-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--t-muted)";
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Heat Score Display */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    backgroundColor: "var(--p-surface)",
                    marginBottom: "24px",
                    border: `2px solid ${getHeatColor(heatScore)}`,
                  }}
                >
                  <p style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "var(--t-muted)",
                    margin: "0 0 8px 0",
                  }}>
                    Current Heat Score
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      fontSize: "32px",
                      fontWeight: 700,
                      color: getHeatColor(heatScore),
                    }}>
                      {heatScore}%
                    </div>
                    <div style={{ fontSize: "24px" }}>
                      {heatScore >= 70 ? "🔥" : heatScore > 45 ? "⚠️" : heatScore > 0 ? "❄️" : "○"}
                    </div>
                  </div>
                </motion.div>

                {/* Info Boxes */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "32px",
                  }}
                >
                  <div style={{
                    padding: "16px",
                    borderRadius: "8px",
                    backgroundColor: "var(--p-surface)",
                    border: "1px solid var(--p-border)",
                  }}>
                    <p style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "var(--t-muted)",
                      margin: 0,
                    }}>
                      Status
                    </p>
                    <p style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "var(--t-primary)",
                      margin: "4px 0 0 0",
                    }}>
                      {heatScore >= 70 ? "Mastered" : heatScore > 45 ? "Progress" : "Learning"}
                    </p>
                  </div>
                  <div style={{
                    padding: "16px",
                    borderRadius: "8px",
                    backgroundColor: "var(--p-surface)",
                    border: "1px solid var(--p-border)",
                  }}>
                    <p style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "var(--t-muted)",
                      margin: 0,
                    }}>
                      Action
                    </p>
                    <p style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#ff5c35",
                      margin: "4px 0 0 0",
                    }}>
                      {heatScore >= 70 ? "Refresh" : "Review"}
                    </p>
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <button
                    onClick={onClose}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      borderRadius: "10px",
                      border: "1px solid var(--p-border)",
                      backgroundColor: "transparent",
                      color: "var(--t-primary)",
                      fontWeight: 700,
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--p-surface)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartReview}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      borderRadius: "10px",
                      border: "none",
                      backgroundColor: "#ff5c35",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      cursor: "pointer",
                    }}
                  >
                    {heatScore >= 70 ? "Refresh Memory" : "Review Now"}
                  </motion.button>
                </motion.div>
              </div>
            ) : (
              // Review Component - Show result or loading
              <div style={{ padding: "32px 24px" }}>
                <button
                  onClick={() => setIsReviewing(false)}
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: "1px solid var(--p-border)",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--t-muted)",
                    transition: "all 0.2s ease",
                    zIndex: 10,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--p-surface)";
                    e.currentTarget.style.color = "var(--t-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--t-muted)";
                  }}
                >
                  ✕
                </button>
                
                {reviewLoading || !reviewData ? (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "3px solid var(--p-border)",
                      borderTopColor: "#ff5c35",
                      animation: "spin 0.6s linear infinite",
                      margin: "0 auto 20px",
                    }} />
                    <p style={{ color: "var(--t-muted)", fontWeight: 600 }}>Loading review scenario...</p>
                  </div>
                ) : (
                  <div>
                    <h3 style={{ color: "var(--t-primary)", marginBottom: "20px" }}>
                      Review Session for: {nodeName}
                    </h3>
                    <p style={{ color: "var(--t-muted)", marginBottom: "20px" }}>
                      Review component will be embedded here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
