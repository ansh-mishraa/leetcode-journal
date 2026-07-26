"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  stagger = 0,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-visible");
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "reveal",
        stagger > 0 && `stagger-${stagger}`,
        className,
      )}
    >
      {children}
    </div>
  );
}
