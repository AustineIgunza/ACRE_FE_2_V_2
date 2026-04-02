"use client";

import React from "react";

type Urgency = "critical" | "high" | "medium" | "low";

interface UrgencyBadgeProps {
  urgency: Urgency;
  compact?: boolean;
}

export function UrgencyBadge({ urgency, compact = false }: UrgencyBadgeProps) {
  const urgencyConfig: Record<
    Urgency,
    { label: string; color: string; icon: string; bg: string }
  > = {
    critical: {
      label: "CRITICAL",
      color: "var(--ignition)",
      icon: "🔴",
      bg: "var(--ignition)20",
    },
    high: {
      label: "HIGH",
      color: "var(--snap)",
      icon: "🟠",
      bg: "var(--snap)20",
    },
    medium: {
      label: "MEDIUM",
      color: "var(--warning)",
      icon: "🟡",
      bg: "var(--warning)20",
    },
    low: {
      label: "LOW",
      color: "var(--frost)",
      icon: "🟢",
      bg: "var(--frost)20",
    },
  };

  const config = urgencyConfig[urgency];

  if (compact) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 8px",
          borderRadius: "4px",
          backgroundColor: config.bg,
          fontSize: "12px",
          fontWeight: 600,
          color: config.color,
        }}
      >
        <span>{config.icon}</span>
        {config.label}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        borderRadius: "6px",
        backgroundColor: config.bg,
        border: `1px solid ${config.color}40`,
      }}
    >
      <span style={{ fontSize: "16px" }}>{config.icon}</span>
      <span style={{ fontSize: "12px", fontWeight: 600, color: config.color }}>
        {config.label}
      </span>
    </div>
  );
}

export default UrgencyBadge;
