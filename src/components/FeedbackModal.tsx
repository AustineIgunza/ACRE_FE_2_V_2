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
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 0.1;
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
      <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 ${styles.animation}`}>
        <div
          className={`
            bg-gradient-to-br ${styles.bg}
            border-2 ${styles.border}
            rounded-3xl p-8 sm:p-12
            shadow-2xl ${styles.glow}
            relative overflow-hidden
          `}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-600 font-bold transition-all duration-200 hover:scale-110 flex items-center justify-center"
          >
            ✕
          </button>

          {/* Feedback Text */}
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
              {feedback}
            </p>
          </div>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-widest mb-3">Key Concepts</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Formal Definition */}
          <div className="mb-8 sm:mb-10">
            <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-widest mb-3">Definition</p>
            <p className="text-sm sm:text-base text-slate-700 italic leading-relaxed bg-white/50 rounded-xl p-4">
              {formalDefinition}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
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

          {/* Auto-close Timer */}
          <div className="text-center text-xs sm:text-sm text-slate-600 font-medium">
            Proceeding in {timeLeft.toFixed(1)}s...
          </div>
        </div>
      </div>
    </>
  );
}
