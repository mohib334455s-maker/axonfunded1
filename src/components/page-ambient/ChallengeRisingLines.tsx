"use client";

import { useMemo } from "react";

const COUNT = 14;

/** Static diagonal accents (no motion) for challenge hero. */
export default function ChallengeRisingLines() {
  const lines = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        left: `${(i * 100) / COUNT + 2}%`,
        width: 0.6 + (i % 3) * 0.15,
        opacity: 0.05 + (i % 4) * 0.025,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black" aria-hidden>
      {lines.map((ln) => (
        <div
          key={ln.id}
          className="absolute rounded-full bg-gradient-to-t from-transparent via-amber-400/30 to-transparent"
          style={{
            left: ln.left,
            width: `${ln.width}px`,
            height: "140%",
            bottom: "-20%",
            transform: "rotate(-38deg)",
            transformOrigin: "50% 100%",
            opacity: ln.opacity,
          }}
        />
      ))}
    </div>
  );
}
