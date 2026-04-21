"use client";

import Link from "next/link";
import {
  PLAN_A_COLUMNS,
  PLAN_A_SHARED_ROWS,
  formatPerformanceRewardUsd,
  formatPlanFeeUsd,
} from "@/lib/plan-a-pricing";
import { useLandingDict } from "@/hooks/useLandingDict";

/**
 * Official 7-tier specification grid (same rows as product sheet):
 * dark header, champagne zebra body, gold fee row, footer purchase per tier.
 */
/** Axon dark + gold (replaces legacy blue/white spec sheet). */
const HEADER_BG = "bg-[#0a0906]";
const HEADER_BORDER = "border-gold-500/20";
const ZEBRA_A = "bg-[#10100c]";
const ZEBRA_B = "bg-[#0c0b09]";
const FEE_ROW_BG = "bg-[#1a160d]";
const FEE_TEXT = "text-gold-300";
const FOOTER_BG = "bg-[#0a0906]";

function bodyRowBg(rowIndex: number, isFeeRow: boolean): string {
  if (isFeeRow) return FEE_ROW_BG;
  return rowIndex % 2 === 1 ? ZEBRA_B : ZEBRA_A;
}

export default function OfficialLuxurySpecTable({ className = "" }: { className?: string }) {
  const { t } = useLandingDict();

  const rows: {
    labelKey: string;
    cells: (string | "allowed" | "yes")[];
    isFeeRow?: boolean;
  }[] = [
    {
      labelKey: "planAPricing.table.phase1",
      cells: PLAN_A_COLUMNS.map(() => PLAN_A_SHARED_ROWS.phase1ProfitTarget),
    },
    {
      labelKey: "planAPricing.table.phase2",
      cells: PLAN_A_COLUMNS.map(() => PLAN_A_SHARED_ROWS.phase2ProfitTarget),
    },
    {
      labelKey: "planAPricing.table.dailyDd",
      cells: PLAN_A_COLUMNS.map(() => `${PLAN_A_COLUMNS[0].dailyDrawdownPct}%`),
    },
    {
      labelKey: "planAPricing.table.totalDd",
      cells: PLAN_A_COLUMNS.map((c) => `${c.maxDrawdownPct}%`),
    },
    {
      labelKey: "planAPricing.table.minDaysChallenge",
      cells: PLAN_A_COLUMNS.map(() => PLAN_A_SHARED_ROWS.minimumTradingDaysChallenge),
    },
    {
      labelKey: "planAPricing.table.minDaysFunded",
      cells: PLAN_A_COLUMNS.map(() => PLAN_A_SHARED_ROWS.minimumTradingDaysFunded),
    },
    {
      labelKey: "planAPricing.table.news",
      cells: PLAN_A_COLUMNS.map(() => "allowed" as const),
    },
    {
      labelKey: "planAPricing.table.ea",
      cells: PLAN_A_COLUMNS.map(() => "allowed" as const),
    },
    {
      labelKey: "planAPricing.table.profitSplit",
      cells: PLAN_A_COLUMNS.map(() => PLAN_A_SHARED_ROWS.profitSplitDisplay),
    },
    {
      labelKey: "planAPricing.table.payoutType",
      cells: PLAN_A_COLUMNS.map(() => PLAN_A_SHARED_ROWS.payoutType),
    },
    {
      labelKey: "planAPricing.table.performanceReward20",
      cells: PLAN_A_COLUMNS.map((c) => formatPerformanceRewardUsd(c.performanceRewardFromChallengeUsd)),
    },
    {
      labelKey: "planAPricing.table.refundable",
      cells: PLAN_A_COLUMNS.map(() => "yes" as const),
    },
    {
      labelKey: "planAPricing.table.registrationFee",
      cells: PLAN_A_COLUMNS.map((c) => formatPlanFeeUsd(c.price)),
      isFeeRow: true,
    },
  ];

  return (
    <div
      className={`w-full overflow-x-auto rounded-lg border border-gold-500/20 bg-[#060605] shadow-[0_0_40px_rgba(255,215,0,0.06)] ${className}`.trim()}
    >
      <table className="w-full min-w-[920px] border-collapse text-left text-[11px] sm:text-xs">
        <thead>
          <tr className={`${HEADER_BG} text-white`}>
            <th
              scope="col"
              className={`sticky left-0 z-20 min-w-[148px] border ${HEADER_BORDER} ${HEADER_BG} px-3 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-white sm:min-w-[176px] sm:px-4 sm:py-4 sm:text-[11px]`}
            >
              {t("planAPricing.table.featureHeader")}
            </th>
            {PLAN_A_COLUMNS.map((c) => (
              <th
                key={c.checkoutSlug}
                scope="col"
                className={`border ${HEADER_BORDER} px-2 py-3.5 text-center align-bottom font-bold leading-tight text-white sm:px-3 sm:py-4`}
              >
                <span className="block text-[11px] tracking-tight text-white sm:text-xs">{c.tierName}</span>
                <span className="mt-1 block text-[10px] font-semibold tabular-nums text-gold-300/95 sm:text-[11px]">
                  {c.headerLabel}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const bg = bodyRowBg(ri, !!row.isFeeRow);
            return (
              <tr key={row.labelKey} className={`${bg} text-neutral-200`}>
                <th
                  scope="row"
                  className={`sticky left-0 z-10 border border-white/10 ${bg} px-3 py-2.5 text-left text-[10px] font-semibold text-neutral-200 sm:px-4 sm:text-[11px] ${
                    row.isFeeRow ? `${FEE_TEXT} font-bold` : ""
                  }`}
                >
                  {t(row.labelKey)}
                </th>
                {row.cells.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`border border-white/10 px-2 py-2.5 text-center font-medium tabular-nums sm:px-3 ${
                      cell === "allowed" ? "font-bold text-emerald-400/95" : ""
                    } ${cell === "yes" ? "font-semibold text-emerald-400" : ""} ${
                      row.isFeeRow ? `${FEE_TEXT} text-[11px] font-bold sm:text-xs` : "text-neutral-100"
                    }`}
                  >
                    {cell === "allowed" ? t("planAPricing.table.allowed") : cell === "yes" ? t("planAPricing.table.yes") : cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className={`${FOOTER_BG} text-white`}>
            <th
              scope="row"
              className={`sticky left-0 z-10 border ${HEADER_BORDER} ${FOOTER_BG} px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-white sm:px-4 sm:text-[11px]`}
            >
              {t("planAPricing.table.purchaseRow")}
            </th>
            {PLAN_A_COLUMNS.map((c) => (
              <td key={c.checkoutSlug} className={`border ${HEADER_BORDER} px-2 py-3 text-center sm:px-3`}>
                <Link
                  href={`/checkout/${c.checkoutSlug}`}
                  className="btn-gold mx-auto inline-flex min-h-0 w-full max-w-[132px] items-center justify-center rounded-md px-2 py-2 text-[10px] font-bold leading-tight sm:max-w-[150px] sm:px-3 sm:text-[11px]"
                >
                  {t("planAPricing.buyCta")}
                </Link>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
