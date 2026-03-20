"use client";

import { useState } from "react";
import { useArceStore } from "@/store/arceStore";
import LoadingScreen from "./LoadingScreen";

export default function InputPhase() {
  const { showLogo, startGame, isLoading } = useArceStore();
  const [sourceContent, setSourceContent] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (sourceContent.trim().length < 100) {
      setError("Please provide at least 100 characters of study material.");
      return;
    }

    await startGame(sourceContent, sourceTitle || "Learning Session");
  };

  return (
    <>
      {/* Loading Screen Overlay */}
      {isLoading && (
        <LoadingScreen phase="extracting" progress={Math.random() * 70 + 30} />
      )}

      <div style={{
        minHeight: "100vh",
        backgroundColor: "var(--p-white)",
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
              Learn Forge
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
        <form
          onSubmit={handleSubmit}
          className="folio-card"
          style={{
            width: "100%",
            maxWidth: "640px",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label className="eyebrow" style={{ textAlign: "center" }}>
              Study Material
            </label>
            <p style={{ textAlign: "center", fontSize: "14px", color: "var(--t-secondary)", marginBottom: "8px" }}>
              Paste your notes, lecture transcript, or learning material
            </p>
            <textarea
              value={sourceContent}
              onChange={(e) => setSourceContent(e.target.value)}
              placeholder="Enter your study material here... (minimum 100 characters)"
              className="folio-input"
              style={{
                width: "100%",
                minHeight: "160px",
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: 1.6,
              }}
              disabled={isLoading}
            />
            <div style={{
              textAlign: "center",
              fontSize: "13px",
              fontWeight: 600,
              color: sourceContent.length >= 100 ? "var(--success)" : "var(--t-secondary)",
            }}>
              {sourceContent.length} / 100 characters minimum
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label className="eyebrow" style={{ textAlign: "center" }}>
              Title (Optional)
            </label>
            <input
              type="text"
              value={sourceTitle}
              onChange={(e) => setSourceTitle(e.target.value)}
              placeholder="e.g., Biology Chapter 3, Economics Lecture"
              className="folio-input"
              style={{ width: "100%", textAlign: "center" }}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div style={{
              padding: "16px",
              background: "var(--error-bg)",
              border: "1px solid var(--error-border)",
              borderRadius: "8px",
              color: "var(--error)",
              fontWeight: 600,
              textAlign: "center",
              fontSize: "14px",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              width: "100%",
              padding: "14px 24px",
              fontSize: "14px",
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span style={{
                  width: "16px", height: "16px", borderRadius: "50%",
                  border: "2px solid var(--p-border)", borderTopColor: "var(--p-white)",
                  animation: "spin 0.6s linear infinite", display: "inline-block",
                }} />
                Extracting Logic...
              </span>
            ) : (
              "Begin Learning Session"
            )}
          </button>
        </form>

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
