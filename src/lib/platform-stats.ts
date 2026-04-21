/**
 * Public platform statistics — leave at zero until wired to a real analytics source.
 * UI shows placeholders (em dash) when unpublished.
 */

export const PLATFORM_STATS = {
  fundedTraders: 0,
  totalPayoutsM: 0,
  challengePassRate: 0,
  avgWinRate: 0,
  avgPayoutHours: 0,
  trustpilotRating: 0,
  avgDaysToFund: 0,
  countriesRepresented: 0,
  sampleTotalProfit: 0,
  avgProfitFactor: 0,
} as const;

export const PLATFORM_STATS_PUBLISHED =
  PLATFORM_STATS.fundedTraders > 0 || PLATFORM_STATS.totalPayoutsM > 0;
