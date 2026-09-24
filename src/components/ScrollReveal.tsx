"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

type Direction = "up" | "left" | "right" | "scale";

const transforms: Record<Direction, string> = {
  up: "translateY(40px)",
  left: "translateX(-40px)",
  right: "translateX(40px)",
  scale: "scale(0.92)",
};

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>(0.12);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[direction],
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
