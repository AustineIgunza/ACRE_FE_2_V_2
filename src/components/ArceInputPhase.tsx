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

      <div className="min-h-screen bg-gradient-subtle flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20 relative">
        {/* Logo - only at start */}
        {showLogo && (
          <div className="mb-16 sm:mb-20 text-center animate-fadeIn max-w-3xl">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 tracking-tight bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent">
              ARCÉ
            </h1>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 sm:mb-4">
              The Iteration Engine
            </p>
            <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed px-2">
              Convert passive learning into mastery through crisis scenarios
            </p>
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-white/95 backdrop-blur-lg border-1.5 border-blue-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-300 space-y-6 sm:space-y-8"
        >
          <div className="space-y-3">
            <label className="block text-sm sm:text-base font-bold text-blue-900 text-center">
              Study Material
            </label>
            <p className="text-center text-sm text-slate-600 font-medium">
              Paste your notes, lecture transcript, or learning material
            </p>
            <textarea
              value={sourceContent}
              onChange={(e) => setSourceContent(e.target.value)}
              placeholder="Enter your study material here... (minimum 100 characters)"
              className="w-full h-40 sm:h-48 p-4 sm:p-5 border-1.5 border-blue-200 rounded-2xl font-medium text-slate-800 bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-blue-50 transition-all duration-250 placeholder-slate-400"
              disabled={isLoading}
            />
            <div className="text-center text-sm font-semibold text-blue-700">
              {sourceContent.length} / 100 characters minimum
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm sm:text-base font-bold text-blue-900 text-center">
              Title (Optional)
            </label>
            <input
              type="text"
              value={sourceTitle}
              onChange={(e) => setSourceTitle(e.target.value)}
              placeholder="e.g., Biology Chapter 3, Economics Lecture"
              className="w-full p-4 sm:p-5 border-1.5 border-blue-200 rounded-2xl text-slate-800 bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-blue-50 transition-all duration-250 placeholder-slate-400 text-center font-medium"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-4 sm:p-5 bg-gradient-to-r from-red-50 to-orange-50 border-1.5 border-red-300 rounded-2xl text-red-700 font-bold text-center text-sm sm:text-base">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full button-primary py-4 sm:py-5 px-6 text-base sm:text-lg font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg active:scale-95"
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
        <div className="mt-12 sm:mt-16 text-center text-slate-600 max-w-2xl px-4">
          <p className="font-medium text-sm sm:text-base leading-relaxed">
            💡 Tip: The more detailed your material, the richer your learning experience.
          </p>
        </div>
      </div>
    </>
  );
}
