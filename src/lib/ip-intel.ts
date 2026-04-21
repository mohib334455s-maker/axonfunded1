import type { IpIntelSnapshot } from "./mt-telemetry-types";

/**
 * Optional IP enrichment (VPN / datacenter hints).
 * Default: ip-api.com (no API key; HTTP; ~45 req/min — fine for low-volume EA heartbeats).
 * Set DISABLE_IP_INTEL=1 to skip network calls.
 */
export async function enrichIpIntel(ip: string): Promise<IpIntelSnapshot | undefined> {
  const trimmed = ip.trim();
  if (!trimmed || trimmed === "127.0.0.1" || trimmed === "::1") return undefined;
  if (process.env.DISABLE_IP_INTEL === "1") return undefined;

  try {
    const url = `http://ip-api.com/json/${encodeURIComponent(trimmed)}?fields=status,message,country,regionName,isp,mobile,proxy,hosting`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4500);
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(t);
    if (!res.ok) return undefined;
    const j = (await res.json()) as Record<string, unknown>;
    if (j.status !== "success") return undefined;
    return {
      country: typeof j.country === "string" ? j.country : undefined,
      region: typeof j.regionName === "string" ? j.regionName : undefined,
      isp: typeof j.isp === "string" ? j.isp : undefined,
      mobile: j.mobile === true,
      proxy: j.proxy === true,
      hosting: j.hosting === true,
      source: "ip-api",
    };
  } catch {
    return undefined;
  }
}
