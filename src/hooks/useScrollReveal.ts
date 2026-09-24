"use client";

import { useEffect, useRef, useState } from "react";

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.15
) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export function useAnimatedCounter(
  target: number,
  duration = 1500,
  startWhenVisible = true
) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startWhenVisible);
  const { ref, visible } = useScrollReveal<HTMLSpanElement>(0.3);

  useEffect(() => {
    if (visible) setStarted(true);
  }, [visible]);

  useEffect(() => {
    if (!started) return;

    let frame: number;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, target, duration]);

  return { ref, count };
}
