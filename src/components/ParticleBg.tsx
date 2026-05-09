"use client";

/**
 * ParticleBg — animated particle background.
 * Renders floating orbs + rising/drifting particles behind page content.
 * All elements are fixed + pointer-events:none so they never block interaction.
 *
 * Props:
 *   theme: "dark" (default, for dark pages) | "light" (for light/surface pages)
 *   accent: primary accent color (hex, default: "#ff5c35")
 *   secondary: secondary accent color (hex, default: "#5878f8")
 */

interface Props {
  theme?: "dark" | "light";
  accent?: string;
  secondary?: string;
}

function hex2rgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const PARTICLE_COUNT = 18;

// Deterministic "random" values so SSR matches client
function seeded(seed: number, min: number, max: number) {
  const val = Math.abs(Math.sin(seed * 9301 + 49297) * 233280) % 1;
  return min + val * (max - min);
}

export default function ParticleBg({
  theme = "dark",
  accent = "#ff5c35",
  secondary = "#5878f8",
}: Props) {
  const isDark = theme === "dark";
  const orbOpacity = isDark ? 0.07 : 0.045;
  const particleOpacity = isDark ? 0.22 : 0.13;

  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    left: seeded(i * 3 + 1, 2, 96),
    top: seeded(i * 3 + 2, 5, 92),
    size: seeded(i * 3 + 3, 2, 5),
    duration: seeded(i, 5, 14),
    delay: seeded(i * 2, 0, 8),
    color: i % 3 === 0 ? accent : i % 3 === 1 ? secondary : "#a855f7",
    animType: i % 3, // 0=drift, 1=rise, 2=drift
  }));

  const orbs = [
    { top: "4%",  left: "3%",   size: 520, color: accent,    delay: 0,  anim: "orb-a 26s ease-in-out infinite" },
    { top: "55%", right: "2%",  size: 440, color: secondary,  delay: 0,  anim: "orb-b 32s ease-in-out infinite" },
    { top: "30%", left: "45%",  size: 360, color: "#a855f7",  delay: 0,  anim: "orb-c 40s ease-in-out infinite" },
    { bottom: "5%", left: "25%", size: 280, color: secondary, delay: 0,  anim: "orb-a 36s ease-in-out infinite reverse" },
  ];

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Gradient orbs */}
      {orbs.map((orb, i) => (
        <div
          key={`orb-${i}`}
          style={{
            position: "absolute",
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${hex2rgba(orb.color, orbOpacity)} 0%, transparent 70%)`,
            animation: orb.anim,
            ...(orb.top !== undefined ? { top: orb.top } : {}),
            ...(orb.bottom !== undefined ? { bottom: (orb as any).bottom } : {}),
            ...(orb.left !== undefined ? { left: orb.left } : {}),
            ...(orb.right !== undefined ? { right: (orb as any).right } : {}),
          }}
        />
      ))}

      {/* Floating / rising particles */}
      {particles.map((p, i) => (
        <div
          key={`p-${i}`}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            backgroundColor: p.color,
            opacity: particleOpacity,
            animation: p.animType === 1
              ? `particle-rise ${p.duration}s ease-in infinite`
              : `particle-drift ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            boxShadow: p.size > 3.5 ? `0 0 ${p.size * 2}px ${p.color}60` : "none",
          }}
        />
      ))}

      {/* Subtle grid lines for depth */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: isDark
          ? "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)"
          : "linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />
    </div>
  );
}
