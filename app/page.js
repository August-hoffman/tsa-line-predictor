"use client";

import { useEffect, useState } from "react";
import { AIRPORTS } from "../lib/airports";

const TONE = {
  green: { bar: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-800", text: "text-emerald-600" },
  amber: { bar: "bg-amber-500", chip: "bg-amber-100 text-amber-800", text: "text-amber-600" },
  red: { bar: "bg-rose-500", chip: "bg-rose-100 text-rose-800", text: "text-rose-600" },
};

function band(minutes) {
  if (minutes <= 10) return "green";
  if (minutes <= 25) return "amber";
  return "red";
}

function fmtHour(h) {
  const am = h < 12;
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}${am ? "am" : "pm"}`;
}

export default function Home() {
  const [code, setCode] = useState("SEA");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/wait?ap=${code}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  const maxFc = data ? Math.max(...data.forecast.map((f) => f.standard), 1) : 1;

  return (
    <main className="mx-auto max-w-md px-4 py-8 sm:py-12">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">TSA Line Predictor</h1>
        <p className="mt-1 text-sm text-slate-500">
          How long security will take — before you leave for the airport.
        </p>
      </header>

      <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
        Airport
      </label>
      <select
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      >
        {AIRPORTS.map((a) => (
          <option key={a.code} value={a.code}>
            {a.code} — {a.name}
          </option>
        ))}
      </select>

      {loading && (
        <div className="mt-6 animate-pulse rounded-2xl bg-white p-6 shadow-sm">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="mt-4 h-12 w-32 rounded bg-slate-200" />
        </div>
      )}

      {error && !loading && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Couldn’t load a prediction ({error}). Try another airport or reload.
        </div>
      )}

      {data && !loading && !error && (
        <>
          {/* Hero card */}
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Predicted wait now</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${TONE[band(data.standard)].chip}`}>
                {band(data.standard) === "green" ? "Short" : band(data.standard) === "amber" ? "Moderate" : "Long"}
              </span>
            </div>
            <div className="mt-3 flex items-end gap-6">
              <div>
                <div className={`text-5xl font-bold ${TONE[band(data.standard)].text}`}>
                  {data.standard}
                  <span className="ml-1 text-xl font-medium text-slate-400">min</span>
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">Standard lane</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-slate-700">
                  {data.precheck}
                  <span className="ml-1 text-base font-medium text-slate-400">min</span>
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">PreCheck</div>
              </div>
            </div>

            {data.liveStandard != null && (
              <p className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                Live MyTSA feed reporting ~{data.liveStandard} min recently. Shown prediction blends this with typical patterns.
              </p>
            )}
          </section>

          {/* Best time to arrive */}
          <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Best time to arrive (next 6 hrs)</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">{fmtHour(data.best.hour)}</span>
              <span className="text-sm text-slate-500">≈ {data.best.standard} min standard</span>
            </div>
          </section>

          {/* Forecast */}
          <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-3 text-sm font-medium text-slate-500">Next 12 hours</div>
            <div className="flex items-end gap-1.5" style={{ height: 120 }}>
              {data.forecast.map((f) => {
                const h = Math.max(6, Math.round((f.standard / maxFc) * 104));
                return (
                  <div key={f.time} className="flex flex-1 flex-col items-center gap-1">
                    <div className="text-[9px] font-semibold text-slate-400">{f.standard}</div>
                    <div className={`w-full rounded-t ${TONE[band(f.standard)].bar}`} style={{ height: h }} />
                    <div className="text-[9px] text-slate-400">{fmtHour(f.hour)}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-400">
            Prototype. Predictions are modeled from typical TSA wait patterns
            {data.source === "live+model" ? ", blended with the live MyTSA feed" : ""} — not yet
            trained on full historical data. Source: {data.source}.
          </p>
        </>
      )}
    </main>
  );
}
