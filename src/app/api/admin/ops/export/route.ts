import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listAllOrdersForAdmin, listAllPayoutsForAdmin, listAuditLog } from "@/lib/server/trader-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(v: unknown) {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const type = req.nextUrl.searchParams.get("type") || "orders";

  if (type === "payouts") {
    const rows = listAllPayoutsForAdmin();
    const header = ["payoutId", "traderId", "traderEmail", "amount", "currency", "status", "method", "requestedAt", "processedAt", "rejectionReason", "accountId"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.id,
          r.traderId,
          r.traderEmail,
          r.amount,
          r.currency,
          r.status,
          r.method,
          r.requestedAt,
          r.processedAt ?? "",
          r.rejectionReason ?? "",
          r.accountId,
        ]
          .map(csvEscape)
          .join(",")
      ),
    ];
    return new NextResponse(lines.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="axon-payouts-${Date.now()}.csv"`,
      },
    });
  }

  if (type === "audit") {
    const rows = listAuditLog(5000);
    const header = ["id", "at", "action", "entityType", "entityId", "traderId", "actor", "detail"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [r.id, r.at, r.action, r.entityType, r.entityId, r.traderId ?? "", r.actor, r.detail ?? ""].map(csvEscape).join(",")
      ),
    ];
    return new NextResponse(lines.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="axon-audit-${Date.now()}.csv"`,
      },
    });
  }

  const orders = listAllOrdersForAdmin();
  const header = [
    "orderId",
    "traderId",
    "receiptId",
    "tierName",
    "accountSizeUsd",
    "amountUsd",
    "currency",
    "paymentMethod",
    "paymentChannel",
    "stripeSessionId",
    "usdtTxHash",
    "status",
    "paidAt",
  ];
  const lines = [
    header.join(","),
    ...orders.map((o) =>
      [
        o.id,
        o.traderId,
        o.receiptId,
        o.tierName,
        o.accountSizeUsd,
        o.amountUsd,
        o.currency,
        o.paymentMethod,
        o.paymentChannel,
        o.stripeSessionId ?? "",
        o.usdtTxHash ?? "",
        o.status,
        o.paidAt,
      ]
        .map(csvEscape)
        .join(",")
    ),
  ];
  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="axon-orders-${Date.now()}.csv"`,
    },
  });
}
