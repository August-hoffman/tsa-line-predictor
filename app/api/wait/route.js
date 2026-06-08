import { NextResponse } from "next/server";
import { predictAt, forecast, bestWindow } from "../../../lib/predict";
import { getAirport } from "../../../lib/airports";

export const dynamic = "force-dynamic";

// Attempt the official (crowd-sourced, HTTP-only) MyTSA feed. It is frequently
// stale or unreachable, so we time out fast and let the caller fall back to the
// model. Returns the most recent reported wait in minutes, or null.
async function tryLiveMyTSA(code) {
  const url = `http://apps.tsa.dhs.gov/MyTSAWebService/GetTSOWaitTimes.ashx?ap=${code}&output=json`;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const rows = data?.WaitTimes || data?.waitTimes;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const latest = rows[rows.length - 1];
    const code10 = Number(latest?.WaitTime ?? latest?.waitTime);
    if (!Number.isFinite(code10)) return null;
    // MyTSA reports 10-minute buckets: 0 => no wait, 1 => 1–10 min, etc.
    return code10 * 10;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("ap") || "SEA").toUpperCase();
  const ap = getAirport(code);
  const now = new Date();

  const model = predictAt(ap.code, now);
  const live = await tryLiveMyTSA(ap.code);

  return NextResponse.json({
    airport: ap,
    now: now.toISOString(),
    source: live != null ? "live+model" : "model",
    standard: model.standard,
    precheck: model.precheck,
    liveStandard: live, // minutes from MyTSA, or null
    forecast: forecast(ap.code, now, 12),
    best: bestWindow(ap.code, now, 6),
  });
}
