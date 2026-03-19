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
  autoCloseSeconds = 3.5,
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
          // Defer onClose to avoid setState-during-render conflict
          setTimeout(() => onClose(), 0);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, autoCloseSeconds, onClose]);

  if (!isOpen) return null;

  // Get thermal color and animation
  const getThermalStyles = () => {
    const styles: Record<string, { bg: string; border: string; animation: string; glow: string }> = {
      frost: {
        bg: "from-red-50 to-orange-50",
        border: "border-red-300",
        animation: "animate-shake",
        glow: "shadow-[0_0_30px_rgba(239,68,68,0.4)]",
      },
      warning: {
        bg: "from-yellow-50 to-orange-50",
        border: "border-yellow-300",
        animation: "animate-pulse",
        glow: "shadow-[0_0_30px_rgba(234,179,8,0.4)]",
      },
      ignition: {
        bg: "from-green-50 to-emerald-50",
        border: "border-green-300",
        animation: "animate-pulse",
        glow: "shadow-[0_0_30px_rgba(34,197,94,0.4)]",
      },
      neutral: {
        bg: "from-slate-50 to-blue-50",
        border: "border-blue-300",
        animation: "",
        glow: "",
      },
    };
    return styles[thermalState] || styles.neutral;
  };

  const styles = getThermalStyles();
  const progressPercent = (timeLeft / autoCloseSeconds) * 100;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />

      {/* Modal */}
      <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-3 ${styles.animation}`}>
        <div
          className={`
            bg-gradient-to-br ${styles.bg}
            border-2 ${styles.border}
            rounded-xl p-5 sm:p-6
            shadow-xl ${styles.glow}
            relative overflow-hidden
          `}
        >
          {/* Close Button - Positioned outside top-right */}
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 font-bold transition-all duration-200 hover:scale-110 flex items-center justify-center shadow-lg z-50 text-sm"
          >
            ✕
          </button>

          {/* Feedback Text - Adjusted for better wrapping */}
          <div className="text-center mb-3 px-1">
            <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug break-words">
              {feedback}
            </p>
          </div>

          {/* Keywords - Tighter spacing */}
          {keywords.length > 0 && (
            <div className="mb-3 px-1">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Concepts</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold line-clamp-1"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Formal Definition - Better padding */}
          <div className="mb-3 px-1">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Definition</p>
            <p className="text-xs text-slate-700 italic leading-relaxed bg-white/50 rounded-md p-2 max-h-20 overflow-y-auto">
              {formalDefinition}
            </p>
          </div>

          {/* Progress Bar - Compact */}
          <div className="mb-2.5">
            <div className="w-full h-1.5 bg-slate-300 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  thermalState === "frost"
                    ? "bg-red-500"
                    : thermalState === "warning"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Auto-close Timer - Smaller text */}
          <div className="text-center text-xs text-slate-600 font-medium">
            Proceeding in {timeLeft.toFixed(1)}s...
          </div>
        </div>
      </div>
    </>
  );
}
