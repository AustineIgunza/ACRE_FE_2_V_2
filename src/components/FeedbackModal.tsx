"use client";

import { useState, useEffect } from "react";
import { ThermalState } from "@/types/arce";

interface FeedbackModalProps {
  isOpen: boolean;
  thermalState: ThermalState;
  feedback: string;
  keywords: string[];
  formalDefinition: string;
  onClose: () => void;
  autoCloseSeconds?: number;
}

export default function FeedbackModal({
  isOpen,
  thermalState,
  feedback,
  keywords,
  formalDefinition,
  onClose,
  autoCloseSeconds = 4.5,
}: FeedbackModalProps) {
  const [timeLeft, setTimeLeft] = useState(autoCloseSeconds);

  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(autoCloseSeconds);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 0.1;
        if (next <= 0) {
          clearInterval(interval);
          setTimeout(() => onClose(), 0);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, autoCloseSeconds, onClose]);

  if (!isOpen) return null;

  const isSuccess = thermalState === "ignition";
  const isWarning = thermalState === "warning";
  const isError = thermalState === "frost";

  const bannerClass = isSuccess || isWarning
    ? `feedback-banner-correct ${isSuccess ? 'animate-flash' : ''}`
    : `feedback-banner-wrong ${isError ? 'animate-glitch' : ''}`;

  const progressPercent = (timeLeft / autoCloseSeconds) * 100;

  return (
    <>
      <div 
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(22, 20, 16, 0.4)",
          backdropFilter: "blur(2px)",
          zIndex: 40,
        }} 
      />

      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        padding: "24px",
      }}>
        <div 
          className={bannerClass}
          style={{ 
            width: "100%", 
            maxWidth: "600px", 
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(22, 20, 16, 0.15)",
            padding: "24px",
            position: "relative",
            overflow: "hidden",
            backgroundColor: isWarning ? "var(--warning-bg)" : undefined,
            color: isWarning ? "var(--warning)" : undefined,
            borderTopColor: isWarning ? "var(--warning)" : undefined,
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "white",
              color: "var(--t-deep)",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ✕
          </button>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0,
            }}>
              {isSuccess ? "✓" : isWarning ? "!" : "✕"}
            </div>
            
            <div style={{ flex: 1, paddingRight: "32px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "8px", fontWeight: 700 }}>
                {isSuccess ? "Excellent Reasoning" : isWarning ? "Partial Understanding" : "Requires Review"}
              </h3>
              <p style={{ fontSize: "15px", lineHeight: 1.5, opacity: 0.9 }}>
                {feedback}
              </p>
            </div>
          </div>

          {(keywords.length > 0 || formalDefinition) && (
            <div style={{
              background: "rgba(255, 255, 255, 0.5)",
              borderRadius: "10px",
              padding: "16px",
              marginTop: "16px",
            }}>
              {keywords.length > 0 && (
                <div style={{ marginBottom: formalDefinition ? "12px" : 0 }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7, display: "block", marginBottom: "8px" }}>
                    Concepts
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {keywords.map((k, i) => (
                      <span key={i} style={{ background: "white", padding: "4px 10px", borderRadius: "100px", fontSize: "12px", fontWeight: 600 }}>
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {formalDefinition && (
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7, display: "block", marginBottom: "4px" }}>
                    Definition
                  </span>
                  <p style={{ fontSize: "13px", lineHeight: 1.6, fontStyle: "italic", margin: 0 }}>
                    {formalDefinition}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Progress Timer */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "rgba(0, 0, 0, 0.1)",
          }}>
            <div style={{
              height: "100%",
              background: "rgba(0, 0, 0, 0.2)",
              width: `${progressPercent}%`,
              transition: "width 100ms linear",
            }} />
          </div>
        </div>
      </div>
    </>
  );
}
