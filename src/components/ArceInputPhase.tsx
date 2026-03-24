"use client";

import { useState } from "react";
import { useArceStore } from "@/store/arceStore";
import LoadingScreen from "./LoadingScreen";
import MultimodalInput from "./MultimodalInput";

export default function InputPhase() {
  const { showLogo, startGame, isLoading, loadingProgress } = useArceStore();
  const [error, setError] = useState("");

  const handleSubmit = async (payload: { text?: string; url?: string; file?: File }, title: string) => {
    setError("");
    await startGame(payload, title);
  };

  return (
    <>
      {/* Loading Screen Overlay */}
      {isLoading && (
        <LoadingScreen phase="extracting" progress={loadingProgress} />
      )}

      <div style={{
        minHeight: "100vh",
        backgroundColor: "var(--p-surface)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}>
        {/* Logo - only at start */}
        {showLogo && (
          <div style={{
            marginBottom: "64px",
            textAlign: "center",
            maxWidth: "600px",
            animation: "fadeIn 0.5s ease-out",
          }}>
            {/* Logo accent square */}
            <div style={{
              width: "48px",
              height: "48px",
              backgroundColor: "var(--snap)",
              borderRadius: "10px",
              margin: "0 auto 24px",
            }} />
            <h1 style={{
              fontFamily: "Georgia, serif",
              fontWeight: 400,
              letterSpacing: "-1.3px",
              marginBottom: "12px",
            }}>
              ARCÉ
            </h1>
            <p style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "var(--t-deep)",
              marginBottom: "8px",
            }}>
              The Learning Engine
            </p>
            <p style={{
              color: "var(--t-secondary)",
              lineHeight: 1.75,
            }}>
              Convert passive learning into mastery through challenge scenarios
            </p>
          </div>
        )}

        {/* Input Form */}
        <div style={{ width: "100%", maxWidth: "640px" }}>
          <MultimodalInput onSubmit={handleSubmit} isLoading={isLoading} buttonText="Begin Learning Session" />
        </div>

        {/* Footer Tip */}
        <div style={{
          marginTop: "48px",
          textAlign: "center",
          color: "var(--t-secondary)",
          maxWidth: "480px",
        }}>
          <p style={{ fontSize: "13px", lineHeight: 1.6 }}>
            💡 Tip: The more detailed your material, the richer your learning experience.
          </p>
        </div>
      </div>
    </>
  );
}
