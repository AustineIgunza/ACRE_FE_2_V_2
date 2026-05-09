"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useArceStore } from "@/store/arceStore";
import Navbar from "@/components/Navbar";

type ReviewPhase = "phase-1" | "phase-2" | "phase-3";

interface ReviewContent {
  crisis_scenario: string;
  options?: { id: string; label: string }[];
  guidance_text?: string;
  missing_variable?: string;
}

export default function FlashpointReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, authInitialized, initAuth } = useArceStore();

  const conceptId = params.conceptId as string;
  const [reviewPhase, setReviewPhase] = useState<ReviewPhase>("phase-1");
  const [content, setContent] = useState<ReviewContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (authInitialized && !user) {
      router.push("/signin");
    }
  }, [authInitialized, user, router]);

  useEffect(() => {
    if (!user) return;

    // Fetch review content
    const fetchReviewContent = async () => {
      try {
        const response = await fetch(
          `/api/flashpoint/get-review?userId=${user.id}&conceptId=${conceptId}`
        );
        const data = await response.json();
        setReviewPhase(data.review_phase);
        setContent(data.content);
      } catch (error) {
        console.error("Failed to fetch review content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviewContent();
  }, [user, conceptId]);

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      let userResponse = "";
      let quality = 0;

      if (reviewPhase === "phase-1" && selectedOption) {
        userResponse = selectedOption;
        // You'd validate against the correct answer from backend
        quality = 4; // Placeholder
      } else if ((reviewPhase === "phase-2" || reviewPhase === "phase-3") && textInput) {
        userResponse = textInput;
        // You'd send to LLM for evaluation
        quality = 3; // Placeholder
      } else {
        setFeedback("Please provide a response before submitting.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/flashpoint/submit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          conceptId,
          quality,
          userResponse,
          reviewPhase,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setFeedback("Review submitted! Returning to dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setFeedback("Failed to submit review. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setFeedback("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authInitialized || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--p-surface)" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid var(--p-border)", borderTopColor: "var(--snap)", animation: "spin 0.6s linear infinite" }} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ backgroundColor: "var(--p-surface)", minHeight: "100vh", color: "var(--t-mid)" }}>
        <Navbar />
        <main style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid var(--p-border)", borderTopColor: "var(--snap)", animation: "spin 0.6s linear infinite", margin: "0 auto" }} />
        </main>
      </div>
    );
  }

  const phaseConfig: Record<ReviewPhase, { title: string; subtitle: string; difficulty: string }> = {
    "phase-1": { title: "Foundation Recognition", subtitle: "Days 1-3", difficulty: "Multiple Choice" },
    "phase-2": { title: "Application Challenge", subtitle: "Days 7-14", difficulty: "Text Analysis" },
    "phase-3": { title: "Blindspot Mastery", subtitle: "Days 30-90", difficulty: "Critical Thinking" },
  };

  const config = phaseConfig[reviewPhase];

  return (
    <div style={{ backgroundColor: "var(--p-surface)", minHeight: "100vh", color: "var(--t-mid)" }}>
      <Navbar />

      <main
        style={{
          padding: "48px 24px",
          maxWidth: "900px",
          margin: "0 auto",
          animation: "slideUp 0.4s ease-out",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--snap)", textTransform: "uppercase" }}>
              {config.subtitle}
            </span>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--t-muted)", textTransform: "uppercase" }}>
              {config.difficulty}
            </span>
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: 700, color: "var(--t-primary)", marginBottom: "8px" }}>
            {config.title}
          </h1>
          <p style={{ fontSize: "16px", color: "var(--t-secondary)" }}>
            {reviewPhase === "phase-1" && "Rapidly identify the correct first-principles response."}
            {reviewPhase === "phase-2" && "Correct the flawed proposal and explain the right approach."}
            {reviewPhase === "phase-3" && "Ask one critical question to solve this crisis safely."}
          </p>
        </div>

        {/* Scenario */}
        <div
          className="folio-card"
          style={{
            padding: "32px",
            marginBottom: "32px",
            backgroundColor: "var(--p-frost)",
            borderLeft: "4px solid var(--ignition)",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--ignition)", textTransform: "uppercase", marginBottom: "12px" }}>
            🚨 CRISIS ALERT
          </div>
          <p style={{ fontSize: "18px", lineHeight: 1.8, color: "var(--t-primary)" }}>
            {content?.crisis_scenario}
          </p>
        </div>

        {/* Phase-specific content */}
        <div className="folio-card" style={{ padding: "32px" }}>
          {reviewPhase === "phase-1" && content?.options ? (
            <div>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--t-deep)", marginBottom: "24px" }}>
                Choose one:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {content.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    style={{
                      padding: "16px",
                      textAlign: "left",
                      border: `2px solid ${selectedOption === option.id ? "var(--snap)" : "var(--p-border)"}`,
                      borderRadius: "8px",
                      backgroundColor: selectedOption === option.id ? "var(--snap-tint)" : "transparent",
                      color: "var(--t-primary)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      fontSize: "16px",
                      fontWeight: 500,
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : reviewPhase === "phase-2" ? (
            <div>
              <p style={{ fontSize: "14px", color: "var(--t-secondary)", marginBottom: "12px" }}>
                Minister's Proposal:
              </p>
              <div style={{ padding: "16px", backgroundColor: "var(--p-surface)", borderRadius: "8px", marginBottom: "24px", borderLeft: "4px solid var(--warning)" }}>
                <p style={{ fontSize: "16px", color: "var(--t-primary)", fontStyle: "italic" }}>
                  "{content?.guidance_text}"
                </p>
              </div>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--t-deep)", display: "block", marginBottom: "12px" }}>
                Your Override:
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Explain the flaw and propose the correct action..."
                style={{
                  width: "100%",
                  padding: "16px",
                  border: "1px solid var(--p-border)",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontFamily: "inherit",
                  minHeight: "120px",
                  color: "var(--t-primary)",
                }}
              />
            </div>
          ) : (
            <div>
              <p style={{ fontSize: "14px", color: "var(--t-secondary)", marginBottom: "12px" }}>
                Missing Variable Hint:
              </p>
              <div style={{ padding: "16px", backgroundColor: "var(--p-surface)", borderRadius: "8px", marginBottom: "24px", borderLeft: "4px solid var(--snap)" }}>
                <p style={{ fontSize: "16px", color: "var(--t-primary)", fontStyle: "italic" }}>
                  "{content?.missing_variable}"
                </p>
              </div>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--t-deep)", display: "block", marginBottom: "12px" }}>
                Ask Your Question:
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="What critical data do you need to decide safely?"
                style={{
                  width: "100%",
                  padding: "16px",
                  border: "1px solid var(--p-border)",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontFamily: "inherit",
                  minHeight: "100px",
                  color: "var(--t-primary)",
                }}
              />
            </div>
          )}
        </div>

        {/* Feedback message */}
        {feedback && (
          <div style={{ marginTop: "24px", padding: "16px", borderRadius: "8px", backgroundColor: feedback.includes("successfully") ? "var(--success)" : "var(--error)", color: "white", textAlign: "center", fontSize: "14px", fontWeight: 600 }}>
            {feedback}
          </div>
        )}

        {/* Submit button */}
        <div style={{ marginTop: "32px", display: "flex", gap: "16px", justifyContent: "flex-end" }}>
          <button
            onClick={() => router.back()}
            className="btn-ghost"
            style={{ padding: "12px 24px" }}
            disabled={isSubmitting}
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            style={{ padding: "12px 32px" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </main>
    </div>
  );
}
