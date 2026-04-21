"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type AssetId = "btc" | "eth" | "usdt" | "gold";

/** Metallic rim (subtle milling) + inner face gradients — reads closer to struck metal than flat “button” fills */
const ASSETS: Record<
  AssetId,
  {
    label: string;
    symbol: string;
    rim: string;
    face: string;
    symbolColor: string;
    symbolShadow: string;
  }
> = {
  btc: {
    label: "Bitcoin",
    symbol: "₿",
    rim: `conic-gradient(
      from 0deg,
      #6a3b12 0deg, #b8732e 8deg, #4a2808 16deg, #c9883a 24deg, #5c3410 32deg,
      #d9a05a 40deg, #4a2808 48deg, #c9883a 56deg, #6a3b12 64deg, #e8b870 72deg,
      #5c3410 80deg, #c9883a 88deg, #4a2808 96deg, #d9a05a 104deg, #6a3b12 112deg,
      #b8732e 120deg, #4a2808 128deg, #e8b870 136deg, #5c3410 144deg, #c9883a 152deg,
      #6a3b12 160deg, #d9a05a 168deg, #4a2808 176deg, #b8732e 184deg, #6a3b12 192deg,
      #c9883a 200deg, #5c3410 208deg, #e8b870 216deg, #6a3b12 224deg, #b8732e 232deg,
      #4a2808 240deg, #d9a05a 248deg, #6a3b12 256deg, #c9883a 264deg, #5c3410 272deg,
      #e8b870 280deg, #4a2808 288deg, #b8732e 296deg, #6a3b12 304deg, #d9a05a 312deg,
      #5c3410 320deg, #c9883a 328deg, #6a3b12 336deg, #b8732e 344deg, #4a2808 352deg, #6a3b12 360deg
    )`,
    face: `radial-gradient(ellipse 95% 75% at 50% 38%, #f0d4a8 0%, #c99545 18%, #a66f28 42%, #7a4a18 68%, #3d240c 100%)`,
    symbolColor: "rgba(28, 18, 8, 0.92)",
    symbolShadow: "0 1px 0 rgba(255,255,255,0.22), 0 -1px 2px rgba(0,0,0,0.45)",
  },
  eth: {
    label: "Ethereum",
    symbol: "Ξ",
    rim: `conic-gradient(
      from 0deg,
      #1e2d4a 0deg, #3d5a8a 10deg, #162238 20deg, #5a7bc0 30deg, #1e2d4a 40deg,
      #7a9bd8 50deg, #243552 60deg, #4a6aa8 70deg, #1a2438 80deg, #5a7bc0 90deg,
      #2c4068 100deg, #6d8cc8 110deg, #1e2d4a 120deg, #4a6aa8 130deg, #162238 140deg,
      #5a7bc0 150deg, #243552 160deg, #7a9bd8 170deg, #1e2d4a 180deg, #4a6aa8 190deg,
      #2c4068 200deg, #5a7bc0 210deg, #1a2438 220deg, #6d8cc8 230deg, #243552 240deg,
      #4a6aa8 250deg, #1e2d4a 260deg, #5a7bc0 270deg, #162238 280deg, #7a9bd8 290deg,
      #2c4068 300deg, #4a6aa8 310deg, #1e2d4a 320deg, #5a7bc0 330deg, #243552 340deg, #3d5a8a 350deg, #1e2d4a 360deg
    )`,
    face: `radial-gradient(ellipse 100% 78% at 48% 32%, #d8e4ff 0%, #8faee8 22%, #4d6ba8 48%, #2a3f68 72%, #141c2e 100%)`,
    symbolColor: "rgba(12, 20, 38, 0.9)",
    symbolShadow: "0 1px 0 rgba(255,255,255,0.35), 0 -1px 2px rgba(0,0,0,0.35)",
  },
  usdt: {
    label: "Tether",
    symbol: "₮",
    rim: `conic-gradient(
      from 0deg,
      #0a3d32 0deg, #1a6b56 12deg, #062822 24deg, #2a8f72 36deg, #0a3d32 48deg,
      #3daf8e 60deg, #062822 72deg, #1a6b56 84deg, #0a3d32 96deg, #2a8f72 108deg,
      #144a3e 120deg, #3daf8e 132deg, #0a3d32 144deg, #1a6b56 156deg, #062822 168deg,
      #2a8f72 180deg, #144a3e 192deg, #3daf8e 204deg, #0a3d32 216deg, #1a6b56 228deg,
      #062822 240deg, #2a8f72 252deg, #0a3d32 264deg, #3daf8e 276deg, #144a3e 288deg,
      #1a6b56 300deg, #062822 312deg, #2a8f72 324deg, #0a3d32 336deg, #1a6b56 348deg, #0a3d32 360deg
    )`,
    face: `radial-gradient(ellipse 98% 76% at 50% 34%, #b8f0e0 0%, #4ec4a2 24%, #1e8a6e 52%, #0d4d3c 78%, #051f18 100%)`,
    symbolColor: "rgba(6, 32, 26, 0.92)",
    symbolShadow: "0 1px 0 rgba(255,255,255,0.28), 0 -1px 2px rgba(0,0,0,0.4)",
  },
  gold: {
    label: "Gold",
    symbol: "Au",
    rim: `conic-gradient(
      from 0deg,
      #5c4818 0deg, #a8893a 10deg, #3d2f0c 20deg, #d4b968 30deg, #5c4818 40deg,
      #e8d090 50deg, #3d2f0c 60deg, #b89a48 70deg, #4a3a10 80deg, #d4b968 90deg,
      #6a5420 100deg, #e8d090 110deg, #5c4818 120deg, #a8893a 130deg, #3d2f0c 140deg,
      #d4b968 150deg, #5c4818 160deg, #e8d090 170deg, #4a3a10 180deg, #b89a48 190deg,
      #3d2f0c 200deg, #d4b968 210deg, #5c4818 220deg, #a8893a 230deg, #6a5420 240deg,
      #e8d090 250deg, #4a3a10 260deg, #d4b968 270deg, #5c4818 280deg, #b89a48 290deg,
      #3d2f0c 300deg, #e8d090 310deg, #5c4818 320deg, #a8893a 330deg, #6a5420 340deg, #5c4818 350deg, #5c4818 360deg
    )`,
    face: `radial-gradient(ellipse 96% 74% at 48% 30%, #fff8e4 0%, #e8cc7a 20%, #c9a040 45%, #8a6a1e 72%, #3d2f0c 100%)`,
    symbolColor: "rgba(42, 32, 8, 0.9)",
    symbolShadow: "0 1px 0 rgba(255,255,255,0.35), 0 -1px 2px rgba(0,0,0,0.4)",
  },
};

const ORDER: AssetId[] = ["btc", "eth", "usdt", "gold"];

const FADE_MS = 520;
const FLOAT_MS = 3200;

function CoinDisc({ asset, diameterPx }: { asset: (typeof ASSETS)[AssetId]; diameterPx: number }) {
  const inset = Math.round(diameterPx * 0.055);
  const fontSize = Math.round(diameterPx * 0.34);
  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{
        width: diameterPx,
        height: diameterPx,
        perspective: "900px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Drop shadow under coin */}
      <div
        className="absolute rounded-full left-1/2 -translate-x-1/2"
        style={{
          bottom: -diameterPx * 0.08,
          width: diameterPx * 0.72,
          height: diameterPx * 0.14,
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, transparent 70%)",
          filter: "blur(6px)",
        }}
      />
      <div
        className="relative h-full w-full rounded-full"
        style={{
          transform: "rotateX(10deg)",
          boxShadow: `
            0 ${Math.max(8, diameterPx * 0.06)}px ${Math.round(diameterPx * 0.18)}px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.12)
          `,
        }}
      >
        {/* Milled rim */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: asset.rim,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.35)",
          }}
        />
        {/* Struck face */}
        <div
          className="absolute overflow-hidden rounded-full"
          style={{
            inset,
            background: asset.face,
            boxShadow: `
              inset 0 ${inset * 0.4}px ${inset * 0.9}px rgba(0,0,0,0.42),
              inset 0 -${inset * 0.25}px ${inset * 0.5}px rgba(255,255,255,0.06)
            `,
          }}
        >
          {/* Specular highlight */}
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              inset: "4% 8% 38% 8%",
              background:
                "radial-gradient(ellipse 70% 55% at 38% 28%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 45%, transparent 62%)",
            }}
          />
          {/* Micro texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center font-semibold tabular-nums tracking-tight"
            style={{
              fontSize,
              color: asset.symbolColor,
              textShadow: asset.symbolShadow,
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            {asset.symbol}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * One coin at a time in the right-hand frame: fade → float → fade → next. Infinite loop.
 * Timers: all IDs tracked so unmount clears every nested timeout (fixes leak).
 */
export default function HomeSequentialCoins() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "float" | "out">("in");
  const timersRef = useRef<number[]>([]);

  const current = useMemo(() => ASSETS[ORDER[index % ORDER.length]], [index]);

  useEffect(() => {
    if (reduceMotion) return;
    let cancelled = false;

    const clearTimers = () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };

    const later = (ms: number, fn: () => void) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timersRef.current.push(id);
    };

    const cycle = () => {
      if (cancelled) return;
      setPhase("in");
      later(FADE_MS, () => {
        setPhase("float");
        later(FLOAT_MS, () => {
          setPhase("out");
          later(FADE_MS, () => {
            setIndex((i) => (i + 1) % ORDER.length);
            cycle();
          });
        });
      });
    };

    cycle();
    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] hidden md:block [clip-path:inset(4rem_0_0_0)] lg:[clip-path:inset(5rem_0_0_0)]"
      aria-hidden
    >
      {/* Column aligned with hero max-width: content sits left; this strip is the reserved right animation lane */}
      <div className="absolute inset-y-0 left-0 right-0 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="absolute top-0 bottom-0 right-0 flex w-[min(42%,min(420px,44vw))] min-w-[220px] max-w-[440px] items-center justify-center">
          <div className="relative flex h-[min(58vh,520px)] w-full max-w-[min(100%,380px)] flex-col items-center justify-center">
            {/* Frame */}
            <div
              className="absolute inset-[2%] rounded-[2.25rem] border border-white/[0.06]"
              style={{
                background: "linear-gradient(165deg, rgba(255,255,255,0.045) 0%, rgba(0,0,0,0.12) 45%, transparent 100%)",
                boxShadow: "inset 0 0 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,215,0,0.04)",
              }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 22, scale: 0.94 }}
                animate={{
                  opacity: phase === "out" ? 0 : 1,
                  scale: phase === "float" ? [1, 1.018, 1] : 1,
                }}
                exit={{ opacity: 0, y: -18, scale: 0.95 }}
                transition={{
                  opacity: { duration: FADE_MS / 1000, ease: [0.4, 0, 0.2, 1] },
                  scale: phase === "float" ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.45 },
                }}
                className="relative z-10 flex flex-col items-center justify-center px-2"
              >
                <motion.div
                  animate={{ y: phase === "float" ? [0, -14, 0] : 0 }}
                  transition={
                    phase === "float"
                      ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
                  }
                  className="flex flex-col items-center"
                >
                  <div className="md:block lg:hidden">
                    <CoinDisc asset={current} diameterPx={196} />
                  </div>
                  <div className="hidden lg:block">
                    <CoinDisc asset={current} diameterPx={224} />
                  </div>
                  <p className="mt-6 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500/90">
                    {current.label}
                  </p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
