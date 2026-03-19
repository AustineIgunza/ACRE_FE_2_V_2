"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  phase: "extracting" | "evaluating" | "transitioning";
  progress?: number; // 0-100 for progress bars
}

export default function LoadingScreen({
  phase,
  progress = 0,
}: LoadingScreenProps) {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getMessage = () => {
    switch (phase) {
      case "extracting":
        return "Extracting causal anchors from your material";
      case "evaluating":
        return "Evaluating your logic depth";
      case "transitioning":
        return "Preparing next crisis";
      default:
        return "Processing";
    }
  };

  const getIcon = () => {
    switch (phase) {
      case "extracting":
        return "🧠";
      case "evaluating":
        return "⚖️";
      case "transitioning":
        return "⏱️";
      default:
        return "⚙️";
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-blue-white backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Animated Icon with Brain Effect */}
        <div className="mb-10 flex justify-center">
          <div 
            className="text-7xl sm:text-8xl animate-bounce"
            style={{ animationDuration: "2s" }}
          >
            {getIcon()}
          </div>
        </div>

        {/* Message with gradient text */}
        <h2 className="text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-tight animate-slideDown">
          {getMessage()}
          <span className="inline-block w-8">
            {".".repeat(dotCount)}
          </span>
        </h2>

        {/* Subtext */}
        <p className="text-base sm:text-lg text-slate-600 mb-10 font-medium animate-slideDown" style={{ animationDelay: "0.1s" }}>
          {phase === "extracting" &&
            "Breaking down your material into logical frameworks"}
          {phase === "evaluating" &&
            "Analyzing your response for causality depth"}
          {phase === "transitioning" &&
            "Setting up the next challenge"}
        </p>

        {/* Premium Gradient Progress Bar */}
        <div className="mb-8 animate-slideDown" style={{ animationDelay: "0.2s" }}>
          <div className="w-full sm:w-80 h-2.5 bg-slate-200 rounded-full overflow-hidden mx-auto mb-4 border-1.5 border-slate-300 shadow-sm">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${progress}%`,
                boxShadow: "0 0 20px rgba(37, 99, 235, 0.4)",
              }}
            ></div>
          </div>
          <p className="text-sm font-bold text-slate-700">{progress}%</p>
        </div>

        {/* Tips Section */}
        <div className="mt-12 max-w-md mx-auto text-left bg-gradient-to-br from-blue-50 to-slate-50 border-1.5 border-blue-200 p-6 rounded-xl shadow-sm animate-slideDown" style={{ animationDelay: "0.3s" }}>
          <p className="text-xs font-bold text-blue-900 uppercase mb-4 tracking-wide">
            💡 While you wait:
          </p>
          <ul className="space-y-2.5 text-sm text-slate-700 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Think about the consequences of each move</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Consider all stakeholders affected</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Depth of reasoning matters more than speed</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
