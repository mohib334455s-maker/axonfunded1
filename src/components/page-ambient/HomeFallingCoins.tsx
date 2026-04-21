"use client";

import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";

type CryptoId = "btc" | "eth" | "sol" | "xrp" | "bnb";

const CRYPTO: Record<
  CryptoId,
  { symbol: string; bg: string; border: string; color: string; fontFamily?: string }
> = {
  btc: {
    symbol: "₿",
    bg: "linear-gradient(165deg, #ffb347 0%, #f7931a 42%, #c45a00 100%)",
    border: "1.5px solid rgba(255,220,160,0.55)",
    color: "#fff",
  },
  eth: {
    symbol: "Ξ",
    bg: "linear-gradient(165deg, #8fa7ff 0%, #627eea 45%, #2f3f8f 100%)",
    border: "1.5px solid rgba(200,210,255,0.45)",
    color: "#fff",
  },
  sol: {
    symbol: "◎",
    bg: "linear-gradient(135deg, #9945ff 0%, #14f195 100%)",
    border: "1.5px solid rgba(180,255,220,0.4)",
    color: "#0b1f17",
  },
  xrp: {
    symbol: "✕",
    bg: "linear-gradient(180deg, #2b3542 0%, #1a222c 100%)",
    border: "1.5px solid rgba(56,166,255,0.55)",
    color: "#38a6ff",
  },
  bnb: {
    symbol: "B",
    bg: "linear-gradient(180deg, #ffe566 0%, #f0b90b 55%, #a67c00 100%)",
    border: "1.5px solid rgba(255,230,150,0.5)",
    color: "#1a1406",
  },
};

/**
 * Flat 2D token: brand colour + symbol. Entire coin stays opacity-0 until late in the fall (see globals
 * `.home-coin-fall-vertical`) so shapes are not readable at the top of the hero.
 */
function CryptoCoin2D({ size, id }: { size: number; id: CryptoId }) {
  const c = CRYPTO[id];
  const fontSize = Math.round(size * 0.4);
  return (
    <div
      className="rounded-full shrink-0 flex items-center justify-center font-bold tabular-nums select-none"
      style={{
        width: size,
        height: size,
        background: c.bg,
        border: c.border,
        color: c.color,
        fontSize,
        fontFamily: c.fontFamily ?? "system-ui, 'Segoe UI', sans-serif",
        boxShadow: "inset 0 2px 6px rgba(255,255,255,0.35), inset 0 -4px 10px rgba(0,0,0,0.25), 0 2px 0 rgba(0,0,0,0.2)",
        letterSpacing: id === "eth" ? "-0.04em" : undefined,
      }}
    >
      {c.symbol}
    </div>
  );
}

const ORDER: CryptoId[] = ["btc", "eth", "sol", "xrp", "bnb", "btc", "eth", "sol"];

export default function HomeFallingCoins() {
  const reduceMotion = useReducedMotion();

  const specs = useMemo(() => {
    const n = ORDER.length;
    return Array.from({ length: n }, (_, i) => {
      const lane = 12 + ((i * 29) % 78);
      const sizePx = 104 + (i % 4) * 14;
      return {
        id: i,
        crypto: ORDER[i % ORDER.length],
        lanePct: lane,
        delaySec: i * 0.55,
        durationSec: 8.5 + (i % 5) * 0.9,
        sizePx: Math.min(152, sizePx),
      };
    });
  }, []);

  if (reduceMotion) return null;

  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 z-[1] hidden w-[min(52vw,640px)] min-w-[200px] max-w-[680px] overflow-hidden md:block [clip-path:inset(4rem_0_0_0)] md:[clip-path:inset(5rem_0_0_0)]"
      aria-hidden
    >
      <div className="relative h-full w-full">
        {specs.map((c) => (
          <div
            key={c.id}
            className="absolute flex justify-center"
            style={{ left: `${c.lanePct}%`, width: `${c.sizePx}px`, marginLeft: `-${c.sizePx / 2}px`, top: 0 }}
          >
            <div
              className="home-coin-fall-vertical flex justify-center"
              style={
                {
                  animationDuration: `${c.durationSec}s`,
                  animationDelay: `${c.delaySec}s`,
                } as React.CSSProperties
              }
            >
              <CryptoCoin2D id={c.crypto} size={c.sizePx} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
