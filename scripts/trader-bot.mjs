#!/usr/bin/env node
/**
 * Axon trader sync bot — runs every 60s (configurable) and POSTs account metrics to your site.
 *
 * Security: broker / MT login & password stay ONLY in this process / .env.bot — they are NOT sent to Axon.
 * Only derived numbers (balance, equity, …) go to POST /api/trader/ingest.
 *
 * Setup:
 *   1. Set TRADER_INGEST_SECRET in the Next server (.env.local) and the same value in .env.bot here.
 *   2. Copy scripts/trader-bot.example.env → .env.bot and fill values.
 *   3. npm run trader-bot
 *
 * Implement fetchSnapshot() below to call your broker API or read MT5 exports, etc.
 */

import fs from "fs";
import pathMod from "path";
import { fileURLToPath } from "url";

const __dirname = pathMod.dirname(fileURLToPath(import.meta.url));
const root = pathMod.join(__dirname, "..");

function loadDotEnvFile(relPath) {
  const p = pathMod.join(root, relPath);
  const out = {};
  try {
    const text = fs.readFileSync(p, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      let val = t.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      out[key] = val;
    }
  } catch {
    /* missing file */
  }
  return out;
}

const fileEnv = loadDotEnvFile(".env.bot");
function env(name, fallback = "") {
  return process.env[name] ?? fileEnv[name] ?? fallback;
}

const SITE_URL = env("SITE_URL", "http://localhost:3000").replace(/\/$/, "");
const INGEST_SECRET = env("TRADER_INGEST_SECRET");
const ACCOUNT_ID = env("SYNC_ACCOUNT_ID", "demo-account");
const INTERVAL_MS = Math.max(10_000, Number(env("SYNC_INTERVAL_MS", "60000")) || 60_000);

/** Optional: used only inside fetchSnapshot — never sent to the website. */
const BROKER_USER = env("BROKER_USER");
const BROKER_PASSWORD = env("BROKER_PASSWORD");

async function fetchSnapshot() {
  // TODO: Replace with real broker / MT5 bridge. Example: REST API using BROKER_USER / BROKER_PASSWORD.
  void BROKER_USER;
  void BROKER_PASSWORD;

  const balance = Number(env("SIM_BALANCE", "10000"));
  const equity = Number(env("SIM_EQUITY", String(balance + 12.5)));
  return {
    metrics: {
      balance,
      equity,
      margin: Number(env("SIM_MARGIN", "0")),
      freeMargin: Number(env("SIM_FREE_MARGIN", String(balance))),
      profit: Number(env("SIM_PROFIT", String(equity - balance))),
      openPositions: Number(env("SIM_OPEN_POSITIONS", "0")),
      source: "trader-bot-stub",
    },
    meta: { note: env("SIM_NOTE", "stub until fetchSnapshot is implemented") },
  };
}

async function pushOnce() {
  if (!INGEST_SECRET) {
    console.error("[trader-bot] Missing TRADER_INGEST_SECRET (server .env and .env.bot).");
    process.exit(1);
  }

  const { metrics, meta } = await fetchSnapshot();
  const url = `${SITE_URL}/api/trader/ingest`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${INGEST_SECRET}`,
    },
    body: JSON.stringify({ accountId: ACCOUNT_ID, metrics, meta }),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    console.error("[trader-bot] Ingest failed", res.status, json);
    return;
  }
  console.log("[trader-bot]", new Date().toISOString(), "OK", json);
}

console.log(
  `[trader-bot] Starting — every ${INTERVAL_MS}ms → ${SITE_URL}/api/trader/ingest (account ${ACCOUNT_ID})`
);
await pushOnce();
setInterval(pushOnce, INTERVAL_MS);
