"use client";

import { useState, useRef } from "react";

interface MultimodalInputProps {
  onSubmit: (payload: { text?: string; url?: string; file?: File }, title: string) => void;
  isLoading: boolean;
  buttonText: string;
}

export default function MultimodalInput({ onSubmit, isLoading, buttonText }: MultimodalInputProps) {
  const [activeTab, setActiveTab] = useState<"text" | "file" | "url">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload: { text?: string; url?: string; file?: File } = {};

    if (activeTab === "text") {
      if (text.trim().length < 50) {
        setError("Please provide at least 50 characters of text.");
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
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        setError("File size must be under 15MB.");
        return;
      }
      payload.file = file;
    }

    onSubmit(payload, title);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setActiveTab("file");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="folio-card"
      style={{
        width: "100%",
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--p-border)", paddingBottom: "16px", gap: "16px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("text")}
          style={{
            background: "none", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer",
            color: activeTab === "text" ? "var(--snap)" : "var(--t-muted)",
            borderBottom: activeTab === "text" ? "2px solid var(--snap)" : "none",
            paddingBottom: "8px", marginBottom: "-17px"
          }}
        >
          Raw Text
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("file")}
          style={{
            background: "none", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer",
            color: activeTab === "file" ? "var(--snap)" : "var(--t-muted)",
            borderBottom: activeTab === "file" ? "2px solid var(--snap)" : "none",
            paddingBottom: "8px", marginBottom: "-17px"
          }}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("url")}
          style={{
            background: "none", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer",
            color: activeTab === "url" ? "var(--snap)" : "var(--t-muted)",
            borderBottom: activeTab === "url" ? "2px solid var(--snap)" : "none",
            paddingBottom: "8px", marginBottom: "-17px"
          }}
        >
          Link (YouTube/Web)
        </button>
      </div>

      {/* Input Areas */}
      <div style={{ minHeight: "160px" }}>
        {activeTab === "text" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", animation: "fadeIn 0.3s ease" }}>
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              width: "100%", minHeight: "160px",
              border: isDragging ? "2px dashed var(--snap)" : "2px dashed var(--p-border)",
              backgroundColor: isDragging ? "var(--snap-tint)" : "var(--p-surface)",
              borderRadius: "12px", cursor: "pointer", transition: "all 0.2s",
              animation: "fadeIn 0.3s ease"
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => { if (e.target.files?.length) setFile(e.target.files[0]); }}
              style={{ display: "none" }}
              disabled={isLoading}
            />
            {file ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📄</div>
                <div style={{ fontWeight: 600, color: "var(--t-deep)", fontSize: "14px" }}>{file.name}</div>
                <div style={{ color: "var(--t-muted)", fontSize: "12px", marginTop: "4px" }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  style={{ marginTop: "12px", fontSize: "12px", color: "var(--error)", background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "var(--t-secondary)" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📥</div>
                <p style={{ margin: "0", fontWeight: 600, fontSize: "14px" }}>Click or Drag & Drop to Upload</p>
                <p style={{ margin: "4px 0 0", fontSize: "12px" }}>PDF, DOCX, TXT, CSV, Code, Images, Audio, MP4</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "url" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", animation: "fadeIn 0.3s ease" }}>
            <p style={{ fontSize: "13px", color: "var(--t-secondary)", margin: 0 }}>Paste a link to a YouTube video, article, or public document.</p>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="folio-input"
              style={{ width: "100%", padding: "16px" }}
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label className="eyebrow" style={{ textAlign: "center" }}>Title (Optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Biology Final, Login Flow Logic"
          className="folio-input"
          style={{ width: "100%", textAlign: "center" }}
          disabled={isLoading}
        />
      </div>

      {error && (
        <div style={{
          padding: "16px", background: "var(--error-bg)", color: "var(--error)",
          fontWeight: 600, textAlign: "center", fontSize: "14px", borderRadius: "8px",
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary"
        style={{
          width: "100%", padding: "14px 24px", fontSize: "14px",
          opacity: isLoading ? 0.5 : 1, cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Ingesting Data..." : buttonText}
      </button>
    </form>
  );
}
