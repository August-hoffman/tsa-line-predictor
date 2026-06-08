// Prediction engine (prototype).
//
// HONEST NOTE: these curves are a hand-built heuristic that mirrors the shape of
// published TSA throughput patterns (early-morning rush, midday lull, afternoon
// peak, day-of-week effects). They are NOT yet trained on real historical data.
// The functions are structured so a real per-airport, per-hour historical table
// can drop straight in later without changing the UI.

import { getAirport } from "./airports";

const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// Hour (0–23) and weekday (0=Sun) for a Date as seen in a given IANA timezone.
// This makes predictions reflect the AIRPORT's local clock, not the server's.
function localParts(date, tz) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
  }).formatToParts(date);
  let hour = 0;
  let weekday = "Sun";
  for (const p of parts) {
    if (p.type === "hour") hour = parseInt(p.value, 10) % 24;
    if (p.type === "weekday") weekday = p.value;
  }
  return { hour, day: WEEKDAY_INDEX[weekday] ?? date.getDay() };
}

// Relative busyness by hour of day (0–23). 1.0 = an average moment.
const HOUR_CURVE = [
  0.25, 0.18, 0.15, 0.30, // 0–3  (overnight)
  0.85, 1.45, 1.70, 1.55, // 4–7  (early-morning bank — the big rush)
  1.20, 1.05, 0.95, 0.95, // 8–11
  1.00, 1.05, 1.10, 1.25, // 12–15
  1.45, 1.50, 1.35, 1.10, // 16–19 (afternoon/evening peak)
  0.90, 0.70, 0.50, 0.35, // 20–23
];

// Relative busyness by day of week. 0 = Sunday.
const DAY_CURVE = [1.15, 1.10, 0.95, 0.95, 1.10, 1.20, 0.85];
// Sun   Mon   Tue   Wed   Thu   Fri   Sat

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

// Predict standard + precheck wait (minutes) for a given airport at a Date.
export function predictAt(code, date) {
  const ap = getAirport(code);
  const { hour, day } = localParts(date, ap.tz);
  const hourMult = HOUR_CURVE[hour];
  const dayMult = DAY_CURVE[day];

  const standard = clamp(Math.round(ap.baseWait * hourMult * dayMult), 1, 90);
  const precheck = clamp(Math.round(standard * ap.precheckFactor), 1, 40);

  return { standard, precheck, hour, hourMult, dayMult };
}

export function band(minutes) {
  if (minutes <= 10) return { label: "Short", tone: "green" };
  if (minutes <= 25) return { label: "Moderate", tone: "amber" };
  return { label: "Long", tone: "red" };
}

// Forecast the next `hours` hours, on the hour, starting from `from`.
export function forecast(code, from, hours = 12) {
  const ap = getAirport(code);
  const out = [];
  const start = new Date(from);
  start.setMinutes(0, 0, 0);
  for (let i = 0; i <= hours; i++) {
    const t = new Date(start.getTime() + i * 3600 * 1000);
    const p = predictAt(code, t);
    out.push({ time: t.toISOString(), hour: localParts(t, ap.tz).hour, standard: p.standard, precheck: p.precheck });
  }
  return out;
}

// Within the next `windowHrs` hours, find the hour with the lowest predicted
// standard wait — the "best time to arrive."
export function bestWindow(code, from, windowHrs = 6) {
  const f = forecast(code, from, windowHrs);
  let best = f[0];
  for (const slot of f) if (slot.standard < best.standard) best = slot;
  return best;
}
