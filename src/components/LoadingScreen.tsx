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
        return "⏳";
      default:
        return "⚙️";
    }
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Icon */}
        <div className="text-7xl mb-8 animate-pulse">{getIcon()}</div>

        {/* Message */}
        <h2 className="text-3xl font-black text-black mb-2">
          {getMessage()}
          <span className="inline-block w-8">
            {".".repeat(dotCount)}
          </span>
        </h2>

        {/* Subtext */}
        <p className="text-lg text-gray-600 mb-8">
          {phase === "extracting" &&
            "Breaking down your material into logical frameworks"}
          {phase === "evaluating" &&
            "Analyzing your response for causality depth"}
          {phase === "transitioning" &&
            "Setting up the next challenge"}
        </p>

        {/* Progress Bar */}
        <div className="w-80 h-3 bg-gray-200 rounded-full overflow-hidden mx-auto mb-6 border-2 border-black">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          ></div>
        </div>

        {/* Progress Text */}
        <p className="text-sm font-bold text-gray-600">{progress}%</p>

        {/* Tips */}
        <div className="mt-12 max-w-md mx-auto text-left">
          <p className="text-xs font-bold text-gray-600 uppercase mb-3">
            💡 While you wait:
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Think about the consequences of each move</li>
            <li>✓ Consider all stakeholders affected</li>
            <li>✓ Depth of reasoning matters more than speed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
