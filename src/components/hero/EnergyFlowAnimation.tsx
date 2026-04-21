"use client";

/** Static decorative rings for the home hero (no looping motion). */
export default function EnergyFlowAnimation() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute inset-0 rounded-full border border-gold-500/12 bg-black" />
      <div className="absolute inset-[12%] rounded-full border border-amber-400/15 bg-black" />
      <div className="absolute inset-[22%] rounded-full border border-white/8 bg-black" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-24 w-24 rounded-full border border-gold-500/10 bg-gold-500/[0.04]" />
      </div>
    </div>
  );
}
