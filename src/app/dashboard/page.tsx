"use client";

import { useEffect, useState } from "react";
import { useArceStore } from "@/store/arceStore";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { FlashpointDashboardItem } from "@/types/arce";
import Link from "next/link";
import FlashpointTriageDashboard from "@/components/FlashpointTriageDashboard";
import FlashpointReview from "@/components/FlashpointReview";
import { motion, AnimatePresence } from "framer-motion";

interface DueReview {
  conceptId: string;
  conceptTitle: string;
  phase: "phase-1" | "phase-2" | "phase-3";
  difficulty: "multiple-choice" | "text-input" | "blindspot";
  daysOverdue: number;
  daysUntilDue: number;
  successRate: number;
  totalReviews: number;
}

export default function DashboardPage() {
  const { user, authInitialized, initAuth, nodeResults, scenarios } = useArceStore();
  const router = useRouter();
  const [dueReviews, setDueReviews] = useState<FlashpointDashboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<DueReview | null>(null);
  const [reviewData, setReviewData] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (authInitialized && !user) {
      router.push("/signin");
    }
  }, [user, authInitialized, router]);

  useEffect(() => {
    if (!user) return;

    // Fetch due reviews from backend
    const fetchDueReviews = async () => {
      try {
        const response = await fetch(`/api/flashpoint/due-reviews?userId=${user.id}`);
        const data = await response.json();
        setDueReviews(data.due_reviews || []);
      } catch (error) {
        console.error("Failed to fetch due reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDueReviews();
  }, [user]);

  // Handler when user selects a review from the triage dashboard
  const handleSelectReview = async (review: DueReview) => {
    setSelectedReview(review);
    setReviewLoading(true);

    try {
      let endpoint = "";
      if (review.phase === "phase-1") {
        endpoint = "/api/flashpoint/phase-1-crisis";
      } else if (review.phase === "phase-2") {
        endpoint = "/api/flashpoint/phase-2-diagnostic";
      } else if (review.phase === "phase-3") {
        endpoint = "/api/flashpoint/phase-3-blindspot";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptId: review.conceptId,
          difficulty: review.difficulty,
        }),
      });

      const data = await response.json();
      setReviewData(data);
    } catch (error) {
      console.error("Failed to load review scenario:", error);
    } finally {
      setReviewLoading(false);
    }
  };

  // Handler when review is submitted
  const handleSubmitReview = async (response: string | number) => {
    if (!selectedReview || !reviewData) return;

    try {
      const apiResponse = await fetch("/api/flashpoint/evaluate-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: selectedReview.phase,
          userResponse: response,
          evaluationRubric: reviewData._metadata?.evaluation_rubric,
          missingVariable: reviewData._metadata?.missing_variable,
          successCondition: reviewData._metadata?.success_condition,
        }),
      });

      const result = await apiResponse.json();
      return result;
    } catch (error) {
      console.error("Failed to evaluate response:", error);
      return { success: false, feedback: "Error evaluating response", score: 0 };
    }
  };

  // Handler to close review modal
  const handleCloseReview = () => {
    setSelectedReview(null);
    setReviewData(null);
  };

  if (!authInitialized || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--p-surface)" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          border: "3px solid var(--p-border)", borderTopColor: "var(--snap)",
          animation: "spin 0.6s linear infinite"
        }} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--p-surface)", minHeight: "100vh", color: "var(--t-mid)" }}>
      <Navbar />

      {/* Flashpoint Triage Dashboard - Main Content */}
      <FlashpointTriageDashboard 
        userId={user?.id} 
        onSelectReview={handleSelectReview}
      />

      {/* Review Modal */}
      <AnimatePresence mode="wait">
        {selectedReview && reviewData && (
          <FlashpointReview
            key="flashpoint-review"
            phase={selectedReview.phase}
            difficulty={selectedReview.difficulty}
            crisisAlert={reviewData.crisis_alert || reviewData.crisis_text || "Crisis Alert"}
            options={reviewData.options}
            flawedProposal={reviewData.flawed_proposal}
            uiPrompt={reviewData.ui_prompt}
            onSubmit={handleSubmitReview}
            onClose={handleCloseReview}
          />
        )}
      </AnimatePresence>

      {/* Action Grid - Below Triage */}
      <motion.div 
        style={{ 
          maxWidth: "1200px", 
          margin: "60px auto 40px", 
          padding: "0 20px",
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", 
          gap: "24px"
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Recent Progress Section */}
        {Object.keys(nodeResults || {}).length > 0 && (
          <motion.div style={{ gridColumn: "1 / -1", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--t-deep)", marginBottom: "16px" }}>
              📊 Recent Learning Progress
            </h2>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
              gap: "12px"
            }}>
              {Object.entries(nodeResults || {}).map(([nodeId, result]) => {
                const accuracyColor = result.accuracy === 'ignition' ? '#22c55e' : 
                                    result.accuracy === 'warning' ? '#f59e0b' : '#3b82f6';
                return (
                  <div 
                    key={nodeId}
                    className="folio-card" 
                    onClick={() => {
                      // Navigate to heatmap to allow retry
                      router.push(`/heatmap?nodeId=${nodeId}`);
                    }}
                    style={{ 
                      padding: "16px", 
                      textAlign: "center",
                      borderLeft: `4px solid ${accuracyColor}`,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 16px ${accuracyColor}20`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-muted)", marginBottom: "8px" }}>
                      {nodeId.replace(/^(node|scenario)[-_]?/i, '').toUpperCase()}
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--snap)", marginBottom: "4px" }}>
                      {result.heatScore}%
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--t-secondary)" }}>
                      {result.accuracy === 'ignition' ? '🔥 Mastered' : 
                       result.accuracy === 'warning' ? '⚠️ Progress' : '❄️ Learning'}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
        <Link href="/learn" style={{ textDecoration: "none" }}>
          <div className="folio-card" style={{ padding: "32px", height: "100%", display: "flex", flexDirection: "column", transition: "all 0.2s", cursor: "pointer" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--snap-tint)", color: "var(--snap)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "20px" }}>
              ⚡
            </div>
            <h3 style={{ fontSize: "20px", marginBottom: "8px", color: "var(--t-deep)" }}>New Learning Session</h3>
            <p style={{ color: "var(--t-mid)", lineHeight: 1.6, flexGrow: 1, fontSize: "14px" }}>
              Paste material and extract logic nodes for mastery learning.
            </p>
          </div>
        </Link>

        <Link href="/heatmap" style={{ textDecoration: "none" }}>
          <div className="folio-card" style={{ padding: "32px", height: "100%", display: "flex", flexDirection: "column", transition: "all 0.2s", cursor: "pointer" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--success-bg)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "20px" }}>
              🗺️
            </div>
            <h3 style={{ fontSize: "20px", marginBottom: "8px", color: "var(--t-deep)" }}>Heatmap</h3>
            <p style={{ color: "var(--t-mid)", lineHeight: 1.6, flexGrow: 1, fontSize: "14px" }}>
              Visualize all concepts and their mastery progress.
            </p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
