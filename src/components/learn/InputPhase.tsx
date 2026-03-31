"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useArceStore } from "@/store/arceStore";

export default function InputPhase() {
  const { extractLogic, isLoading, currentPhase } = useArceStore();
  const [activeTab, setActiveTab] = useState<"text" | "file" | "url">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload: { text?: string; url?: string; file?: File } = {};

    if (activeTab === "text") {
      if (text.trim().length < 50) {
        setError("Please provide at least 50 characters of material.");
        return;
      }
      payload.text = text;
    } else if (activeTab === "url") {
      if (!url.trim() || !url.startsWith("http")) {
        setError("Please provide a valid URL.");
        return;
      }
      payload.url = url;
    } else if (activeTab === "file") {
      if (!file) {
        setError("Please attach a file.");
        return;
      }
      payload.file = file;
    }

    await extractLogic(payload, title);
  };

  const isExtracting = currentPhase === "extracting";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      {/* Extracting Overlay */}
      {isExtracting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "3px solid rgba(255,92,53,0.3)",
              borderTopColor: "var(--snap)",
            }}
          />
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              color: "var(--snap)",
              fontWeight: 700,
              fontSize: "14px",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            STRIPPING ENTROPY...
          </motion.p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", maxWidth: "400px", textAlign: "center" }}>
            Identifying invariants and chunking into logic nodes
          </p>
        </motion.div>
      )}

      {/* Hero */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: "48px", textAlign: "center", maxWidth: "600px" }}
      >
        <div style={{
          width: "48px", height: "48px",
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
        <p style={{ fontSize: "20px", fontWeight: 600, color: "var(--t-deep)", marginBottom: "8px" }}>
          The Iteration Engine
        </p>
        <p style={{ color: "var(--t-secondary)", lineHeight: 1.75 }}>
          Drop your source material. We&apos;ll extract the atomic logic and forge your understanding through fire.
        </p>
      </motion.div>

      {/* Input Card */}
      <motion.form
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="folio-card"
        style={{ width: "100%", maxWidth: "640px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}
      >
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--p-border)", paddingBottom: "16px", gap: "16px" }}>
          {(["text", "file", "url"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer",
                color: activeTab === tab ? "var(--snap)" : "var(--t-muted)",
                borderBottom: activeTab === tab ? "2px solid var(--snap)" : "none",
                paddingBottom: "8px", marginBottom: "-17px"
              }}
            >
              {tab === "text" ? "Raw Text" : tab === "file" ? "Upload File" : "Link (YouTube/Web)"}
            </button>
          ))}
        </div>

        {/* Input Areas */}
        <div style={{ minHeight: "160px" }}>
          {activeTab === "text" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <p style={{ fontSize: "13px", color: "var(--t-secondary)", margin: 0 }}>Paste your notes, transcript, or source code directly.</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste content here..."
                className="folio-input"
                style={{ width: "100%", minHeight: "140px", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
                disabled={isLoading}
              />
            </div>
          )}

          {activeTab === "file" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={(e) => {
                e.preventDefault(); setIsDragging(false);
                if (e.dataTransfer.files?.length) { setFile(e.dataTransfer.files[0]); setActiveTab("file"); }
              }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                width: "100%", minHeight: "160px",
                border: isDragging ? "2px dashed var(--snap)" : "2px dashed var(--p-border)",
                backgroundColor: isDragging ? "var(--snap-tint)" : "var(--p-surface)",
                borderRadius: "12px", cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <input type="file" ref={fileInputRef} onChange={(e) => { if (e.target.files?.length) setFile(e.target.files[0]); }} style={{ display: "none" }} />
              {file ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>📄</div>
                  <div style={{ fontWeight: 600, color: "var(--t-deep)", fontSize: "14px" }}>{file.name}</div>
                  <div style={{ color: "var(--t-muted)", fontSize: "12px", marginTop: "4px" }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    style={{ marginTop: "12px", fontSize: "12px", color: "var(--error)", background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}>
                    Remove File
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "var(--t-secondary)" }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>📥</div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>Click or Drag & Drop to Upload</p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px" }}>PDF, DOCX, TXT, CSV, Code, Images, Audio, MP4</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "url" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <p style={{ fontSize: "13px", color: "var(--t-secondary)", margin: 0 }}>Paste a link to a YouTube video, article, or public document.</p>
              <input
                type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..." className="folio-input"
                style={{ width: "100%", padding: "16px" }} disabled={isLoading}
              />
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label className="eyebrow" style={{ textAlign: "center" }}>Title (Optional)</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Biology Final, Login Flow Logic" className="folio-input"
            style={{ width: "100%", textAlign: "center" }} disabled={isLoading} />
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: "16px", background: "var(--error-bg)", color: "var(--error)", fontWeight: 600, textAlign: "center", fontSize: "14px", borderRadius: "8px" }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={isLoading} className="btn-primary"
          style={{ width: "100%", padding: "14px 24px", fontSize: "14px", opacity: isLoading ? 0.5 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}>
          {isLoading ? "Extracting Atomic Logic..." : "Begin Iteration"}
        </button>
      </motion.form>
    </motion.div>
  );
}
