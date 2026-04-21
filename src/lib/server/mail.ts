import nodemailer from "nodemailer";
import type { OrderRecord, TradingAccountRecord } from "@/lib/server/trader-store";

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASSWORD?.trim()
  );
}

/** Resend API (HTTPS) or SMTP — at least one for outbound mail. */
export function isOutboundEmailConfigured(): boolean {
  return isResendConfigured() || isSmtpConfigured();
}

export function appBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

type SendResult = { ok: true } | { ok: false; error: string };

async function sendViaResend(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY!.trim();
  const from =
    process.env.RESEND_FROM?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    "Axon <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, error: errText.slice(0, 280) || `resend_http_${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "resend_fetch_failed";
    return { ok: false, error: msg };
  }
}

async function sendViaSmtp(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<SendResult> {
  const from = process.env.EMAIL_FROM?.trim() || `Axon <${process.env.SMTP_USER}>`;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "1" || process.env.SMTP_SECURE === "true";

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!.trim(),
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER!.trim(),
      pass: process.env.SMTP_PASSWORD!.trim(),
    },
  });

  try {
    await transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "send_failed";
    console.error("[mail] smtp failed", msg);
    return { ok: false, error: msg };
  }
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<SendResult> {
  if (isResendConfigured()) {
    return sendViaResend(opts);
  }
  if (isSmtpConfigured()) {
    return sendViaSmtp(opts);
  }
  console.warn("[mail] Set RESEND_API_KEY or SMTP_* to send email.");
  return { ok: false, error: "not_configured" };
}

/** Order confirmation after checkout (demo or Stripe webhook can reuse this). */
export async function sendOrderReceiptEmail(input: {
  to: string;
  order: OrderRecord;
  account: TradingAccountRecord;
}): Promise<SendResult> {
  const base = appBaseUrl();
  const plan = escapeHtml(input.order.tierName);
  const receipt = escapeHtml(input.order.receiptId);
  const oid = escapeHtml(input.order.id);
  const size = `$${input.order.accountSizeUsd.toLocaleString("en-US")}`;
  const channel = escapeHtml(input.order.paymentChannel);

  const subject = `Axon — Order confirmed (${receipt})`;
  const text = [
    `Thank you — your challenge order is recorded.`,
    ``,
    `Receipt: ${input.order.receiptId}`,
    `Order ID: ${input.order.id}`,
    `Plan: ${input.order.tierName} (${size})`,
    `Amount: $${input.order.amountUsd} ${input.order.currency}`,
    `Payment channel (record): ${input.order.paymentChannel}`,
    ``,
    `MT5 credentials are issued by operations, typically within 24 business hours.`,
    `Track status: ${base}/dashboard/accounts`,
    `Need help: ${base}/dashboard/support`,
    `Next steps: ${base}/get-started`,
    ``,
    `— Axon`,
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:24px;">
  <table width="100%" style="max-width:560px;margin:0 auto;background:#111;border:1px solid #333;border-radius:12px;padding:24px;">
    <tr><td>
      <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#c9a227;">Order confirmed</p>
      <h1 style="margin:0 0 16px;font-size:20px;color:#fff;">Your ${plan} challenge is on file</h1>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#a3a3a3;">
        Receipt <strong style="color:#fff;font-family:monospace;">${receipt}</strong><br/>
        Order <span style="font-family:monospace;color:#d4d4d4;">${oid}</span><br/>
        Size <strong style="color:#fff;">${escapeHtml(size)}</strong> — paid <strong style="color:#fff;">$${input.order.amountUsd}</strong> ${escapeHtml(input.order.currency)}<br/>
        <span style="font-size:12px;color:#737373;">Recorded payment: ${channel}</span>
      </p>
      <p style="margin:0 0 20px;font-size:14px;line-height:1.55;color:#a3a3a3;">
        MT5 server and login are assigned by operations, usually within <strong style="color:#fef3c7;">24 business hours</strong>.
        If nothing updates after that, open a support ticket from your dashboard.
      </p>
      <p style="margin:0 0 12px;">
        <a href="${base}/dashboard/accounts" style="display:inline-block;background:linear-gradient(90deg,#ffe57f,#ffd700);color:#000;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:10px;font-size:13px;">Trading accounts</a>
        &nbsp;
        <a href="${base}/dashboard/support" style="display:inline-block;border:1px solid #444;color:#e5e5e5;text-decoration:none;font-weight:600;padding:10px 16px;border-radius:10px;font-size:13px;">Tickets</a>
      </p>
      <p style="margin:16px 0 0;font-size:12px;color:#737373;">
        <a href="${base}/get-started" style="color:#c9a227;">Get started checklist</a>
        · <a href="${base}/rules" style="color:#c9a227;">Trading rules</a>
      </p>
    </td></tr>
  </table>
</body></html>`;

  return sendMail({ to: input.to, subject, text, html });
}
