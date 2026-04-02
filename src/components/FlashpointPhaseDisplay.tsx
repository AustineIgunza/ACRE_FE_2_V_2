"use client";

import React from "react";

type ReviewPhase = "phase-1" | "phase-2" | "phase-3";

interface FlashpointPhaseDisplayProps {
  phase: ReviewPhase;
  size?: "small" | "medium" | "large";
}

export function FlashpointPhaseDisplay({
  phase,
  size = "medium",
}: FlashpointPhaseDisplayProps) {
  const phaseConfig: Record<
    ReviewPhase,
    {
      title: string;
      subtitle: string;
      description: string;
      icon: string;
      color: string;
    }
  > = {
    "phase-1": {
      title: "Foundation",
      subtitle: "Days 1-3",
      description: "Rapid Recognition",
      icon: "🚀",
      color: "var(--snap)",
    },
    "phase-2": {
      title: "Application",
      subtitle: "Days 7-14",
      description: "Diagnostic Reasoning",
      icon: "⚙️",
      color: "var(--warning)",
    },
    "phase-3": {
      title: "Mastery",
      subtitle: "Days 30-90",
      description: "Blindspot Navigation",
      icon: "🏔️",
      color: "var(--ignition)",
    },
  };

  const config = phaseConfig[phase];

  const sizes = {
    small: {
      fontSize: "12px",
      padding: "4px 8px",
      iconSize: "14px",
    },
    medium: {
      fontSize: "14px",
      padding: "8px 12px",
      iconSize: "18px",
    },
    large: {
      fontSize: "16px",
      padding: "12px 16px",
      iconSize: "24px",
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: sizeConfig.padding,
        borderRadius: "8px",
        backgroundColor: `${config.color}20`,
        border: `1px solid ${config.color}40`,
      }}
    >
      <span style={{ fontSize: sizeConfig.iconSize }}>{config.icon}</span>
      <div>
        <div style={{ fontSize: sizeConfig.fontSize, fontWeight: 700, color: config.color }}>
          {config.title}
        </div>
        {size !== "small" && (
          <div style={{ fontSize: "11px", color: config.color, opacity: 0.8 }}>
            {config.subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export default FlashpointPhaseDisplay;
