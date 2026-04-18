"use client";

import { useEffect, useRef, CSSProperties } from "react";

interface Props {
  children: React.ReactNode;
  delay?: number;                                       // ms
  direction?: "up" | "left" | "right" | "scale";
  className?: string;
  style?: CSSProperties;
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * Wraps children in an element that fades + slides in when it enters the viewport.
 * Powered by IntersectionObserver + CSS (no JS animation loop).
 */
export default function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
  style,
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -36px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const directionClass =
    direction === "left"  ? "reveal-left"  :
    direction === "right" ? "reveal-right" :
    direction === "scale" ? "reveal-scale" : "";

  const props = {
    ref,
    className: `reveal ${directionClass} ${className}`,
    style: { transitionDelay: delay ? `${delay}ms` : undefined, ...style },
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag {...(props as any)}>
      {children}
    </Tag>
  );
}
