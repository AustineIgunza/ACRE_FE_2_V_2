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

      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-4">
        {/* Logo - only at start */}
        {showLogo && (
          <div className="mb-12 text-center animate-fadeIn">
            <h1 className="text-7xl font-black mb-4 tracking-tight">
              ARCÉ
            </h1>
            <p className="text-2xl font-light text-gray-600 mb-2">
              The Iteration Engine
            </p>
            <p className="text-lg text-gray-500">
              Convert passive learning into mastery through crisis scenarios
            </p>
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-white border-2 border-black rounded-lg p-8 shadow-lg"
        >
          <div className="mb-6">
            <label className="block text-sm font-bold text-black mb-2">
              Study Material
            </label>
            <textarea
              value={sourceContent}
              onChange={(e) => setSourceContent(e.target.value)}
              placeholder="Paste your study notes, lecture transcript, or learning material here. Minimum 100 characters."
              className="w-full h-64 p-4 border-2 border-black rounded-lg font-mono text-black focus:outline-none focus:ring-2 focus:ring-black"
              disabled={isLoading}
            />
            <div className="mt-2 text-sm text-gray-600">
              {sourceContent.length} / 100 characters minimum
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-black mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={sourceTitle}
              onChange={(e) => setSourceTitle(e.target.value)}
              placeholder="e.g., Biology Chapter 3, Economics Lecture"
              className="w-full p-4 border-2 border-black rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-400 rounded-lg text-red-700 font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="button-rainbow w-full py-4 px-6 text-lg font-bold rounded-lg border-2 border-black bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>Tip: The more detailed your material, the richer your learning experience.</p>
        </div>
      </div>
    </>
  );
}
