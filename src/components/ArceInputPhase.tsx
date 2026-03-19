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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-black flex flex-col items-center justify-center px-4 relative">
        {/* Logo - only at start */}
        {showLogo && (
          <div className="mb-12 text-center animate-fadeIn">
            <h1 className="text-7xl font-black mb-4 tracking-tight bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              ARCÉ
            </h1>
            <p className="text-2xl font-light text-slate-700 mb-2">
              The Iteration Engine
            </p>
            <p className="text-lg text-slate-600">
              Convert passive learning into mastery through crisis scenarios
            </p>
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-white/80 backdrop-blur-md border-2 border-blue-200 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <div className="mb-6">
            <label className="block text-sm font-bold text-blue-900 mb-2">
              Study Material
            </label>
            <textarea
              value={sourceContent}
              onChange={(e) => setSourceContent(e.target.value)}
              placeholder="Paste your study notes, lecture transcript, or learning material here. Minimum 100 characters."
              className="w-full h-64 p-4 border-2 border-blue-300 rounded-xl font-mono text-slate-800 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <div className="mt-2 text-sm text-blue-700 font-semibold">
              {sourceContent.length} / 100 characters minimum
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-blue-900 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={sourceTitle}
              onChange={(e) => setSourceTitle(e.target.value)}
              placeholder="e.g., Biology Chapter 3, Economics Lecture"
              className="w-full p-4 border-2 border-blue-300 rounded-xl text-slate-800 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-700 font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="button-primary w-full py-4 px-6 text-lg font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="spinner"></span>
                Extracting Logic...
              </span>
            ) : (
              "Begin Crisis Scenario"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-600 text-sm max-w-xl">
          <p className="font-medium">Tip: The more detailed your material, the richer your learning experience.</p>
        </div>
      </div>
    </>
  );
}
