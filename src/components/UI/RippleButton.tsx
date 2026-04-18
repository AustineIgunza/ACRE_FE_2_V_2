"use client";

import { useRef, MouseEvent, CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  rippleColor?: string;
}

/**
 * Button with an Apple-style press ripple + spring scale animation.
 * Drop-in replacement for <button>.
 */
export default function RippleButton({
  children,
  onClick,
  className = "",
  style,
  disabled = false,
  type = "button",
  rippleColor = "rgba(255,255,255,0.3)",
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (disabled) return;

    // Spawn ripple
    const btn = ref.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.8;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top  - size / 2;

      const ripple = document.createElement("span");
      ripple.className = "ripple-wave";
      ripple.style.cssText = `
        width:${size}px; height:${size}px;
        left:${x}px; top:${y}px;
        background:${rippleColor};
      `;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    }

    onClick?.();
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      whileHover={disabled ? {} : { scale: 1.03, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 38 }}
      className={`ripple-wrap ${className}`}
      style={{
        position: "relative", overflow: "hidden",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}
