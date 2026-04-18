"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

// ── Global event bus (simple pub-sub without React context) ──────────────────
type Listener = (t: ToastMessage) => void;
const listeners: Listener[] = [];

export function showToast(type: ToastType, title: string, message?: string) {
  const toast: ToastMessage = { id: crypto.randomUUID(), type, title, message };
  listeners.forEach((l) => l(toast));
}

// Convenience helpers
export const toast = {
  success: (title: string, msg?: string) => showToast("success", title, msg),
  error:   (title: string, msg?: string) => showToast("error",   title, msg),
  info:    (title: string, msg?: string) => showToast("info",    title, msg),
  warning: (title: string, msg?: string) => showToast("warning", title, msg),
};

// ── Colours ──────────────────────────────────────────────────────────────────
const cfg = {
  success: { icon: "✓", bg: "var(--success-bg)", border: "var(--success-border)", color: "var(--success)" },
  error:   { icon: "✕", bg: "var(--error-bg)",   border: "var(--error-border)",   color: "var(--error)"   },
  info:    { icon: "ℹ", bg: "var(--info-bg)",    border: "var(--info-border)",    color: "var(--info)"    },
  warning: { icon: "⚠", bg: "var(--warning-bg)", border: "var(--warning-border)", color: "var(--warning)" },
} as const;

// ── Single toast item ─────────────────────────────────────────────────────────
function ToastItem({ toast: t, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const c = cfg[t.type];

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4200);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 28, scale: 0.9 }}
      animate={{ opacity: 1, y: 0,  scale: 1   }}
      exit={{    opacity: 0, y: 10, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 460, damping: 38 }}
      onClick={onDismiss}
      style={{
        display: "flex", alignItems: "flex-start", gap: "12px",
        padding: "14px 16px", borderRadius: "14px",
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        boxShadow: "0 8px 32px rgba(22,20,16,0.14), 0 2px 8px rgba(22,20,16,0.08)",
        cursor: "pointer", minWidth: "280px", maxWidth: "360px",
        userSelect: "none",
      }}
    >
      {/* Icon bubble */}
      <div style={{
        width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
        backgroundColor: c.color + "20",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "13px", fontWeight: 700, color: c.color,
      }}>
        {c.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--t-primary)", lineHeight: 1.3 }}>
          {t.title}
        </div>
        {t.message && (
          <div style={{ fontSize: "12px", color: "var(--t-secondary)", marginTop: "3px", lineHeight: 1.5 }}>
            {t.message}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4.2, ease: "linear" }}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "3px",
          backgroundColor: c.color, borderRadius: "0 0 14px 14px",
          transformOrigin: "left",
        }}
      />
    </motion.div>
  );
}

// ── Toast container (mount once in layout/page) ───────────────────────────────
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (t: ToastMessage) => setToasts((prev) => [...prev, t]);
    listeners.push(handler);
    return () => {
      const i = listeners.indexOf(handler);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px",
      zIndex: 9999, display: "flex", flexDirection: "column",
      gap: "10px", alignItems: "flex-end",
    }}>
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
