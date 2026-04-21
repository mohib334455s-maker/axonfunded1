Axon MetaTrader 5 telemetry (anti multi-account / shared device)

1) Server (.env.local on the Next.js host)
   MT_TELEMETRY_SECRET=<long random string>
   Optional: DISABLE_IP_INTEL=1  (skip ip-api.com lookup)

2) Deploy site with a writable folder: .data/
   Docker example: -v axon-data:/app/.data

3) MetaTrader 5
   - Compile AxonTelemetryExpert.mq5 in MetaEditor.
   - Attach EA to any chart (can minimize).
   - Tools -> Options -> Expert Advisors -> "Allow WebRequest for listed URL"
     Add: https://your-production-domain.com  (exact origin you use in AxonSiteBase)

4) EA inputs
   AxonSiteBase       = https://your-production-domain.com   (no trailing slash)
   AxonTelemetrySecret = same as MT_TELEMETRY_SECRET
   AxonTraderRef      = stable id for the human (email or internal user id). Two different people must use two different values.

5) Admin UI
   Log into /admin -> "MT monitor" to see events and auto-generated alerts:
   - SHARED_FINGERPRINT: same fingerprint, different AxonTraderRef
   - SHARED_IP: same public IP, different AxonTraderRef
   - VPN_OR_HOSTING: ip-api flagged proxy or datacenter

6) Fingerprint strength
   This EA hashes terminal path + server + login (MQL5-only). For stronger HWID,
   use a small Windows DLL and MQL5 import, or ship a sidecar bot (see scripts/trader-bot.mjs).

7) Legal / privacy
   Disclose collection in your terms; align with GDPR if EU users.
