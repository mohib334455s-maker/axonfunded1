"use client";

import { useMemo, useState } from "react";
import type { EquityDataPoint } from "@/types";

type Candle = { i: number; date: string; o: number; h: number; l: number; c: number; up: boolean };

function buildCandles(data: EquityDataPoint[]): Candle[] {
  return data.map((d, i, arr) => {
    const prev = i === 0 ? d.equity : arr[i - 1].equity;
    const o = prev;
    const c = d.equity;
    const bodyTop = Math.max(o, c);
    const bodyBot = Math.min(o, c);
    const wickTop = bodyTop * 1.0015;
    const wickBot = bodyBot * 0.9985;
    return {
      i,
      date: d.date,
      o,
      h: wickTop,
      l: wickBot,
      c,
      up: c >= o,
    };
  });
}

export default function SvgCandlestickChart({ data, height = 220 }: { data: EquityDataPoint[]; height?: number }) {
  const candles = useMemo(() => buildCandles(data), [data]);
  const [hover, setHover] = useState<number | null>(null);

  const pad = 12;
  const w = 560;
  const innerW = w - pad * 2;
  const h = height;
  const innerH = h - pad * 2;

  const { minY, maxY } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    candles.forEach((c) => {
      min = Math.min(min, c.l);
      max = Math.max(max, c.h);
    });
    const padY = (max - min) * 0.08 || 1;
    return { minY: min - padY, maxY: max + padY };
  }, [candles]);

  const step = innerW / Math.max(1, candles.length);
  const barW = Math.max(2, Math.min(8, step * 0.55));

  const yScale = (y: number) => pad + innerH - ((y - minY) / (maxY - minY || 1)) * innerH;
  const xCenter = (i: number) => pad + i * step + step / 2;

  const active = hover != null ? candles[hover] : null;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-auto select-none"
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="candleUp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="candleDown" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = pad + innerH * t;
          return (
            <line key={t} x1={pad} x2={w - pad} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          );
        })}
        {candles.map((c) => {
          const xc = xCenter(c.i);
          const yHigh = yScale(c.h);
          const yLow = yScale(c.l);
          const yOpen = yScale(c.o);
          const yClose = yScale(c.c);
          const top = Math.min(yOpen, yClose);
          const bot = Math.max(yOpen, yClose);
          const fill = c.up ? "url(#candleUp)" : "url(#candleDown)";
          const dim = hover != null && hover !== c.i ? 0.35 : 1;
          return (
            <g
              key={c.i}
              opacity={dim}
              onMouseEnter={() => setHover(c.i)}
              style={{ cursor: "crosshair" }}
            >
              <line x1={xc} x2={xc} y1={yHigh} y2={yLow} stroke="rgba(226,232,240,0.45)" strokeWidth={1.2} />
              <rect
                x={xc - barW / 2}
                y={top}
                width={barW}
                height={Math.max(1, bot - top)}
                rx={1}
                fill={fill}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={0.5}
              />
            </g>
          );
        })}
      </svg>
      {active ? (
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-white/10 bg-[rgba(4,8,16,0.88)] px-3 py-2 text-[11px] backdrop-blur-sm">
          <p className="font-semibold text-neutral-400">{active.date}</p>
          <p className="mt-1 font-mono tabular-nums text-neutral-200">
            O {Math.round(active.o).toLocaleString()} · H {Math.round(active.h).toLocaleString()}
          </p>
          <p className="font-mono tabular-nums text-neutral-200">
            L {Math.round(active.l).toLocaleString()} · C {Math.round(active.c).toLocaleString()}
          </p>
        </div>
      ) : null}
    </div>
  );
}
