import type { NextRequest } from "next/server";
import { TRADER_COOKIES } from "@/lib/trader-access";

export function getTraderIdFromRequest(req: NextRequest): string | null {
  const v = req.cookies.get(TRADER_COOKIES.traderId)?.value;
  if (!v || v.length < 8) return null;
  return decodeURIComponent(v);
}
