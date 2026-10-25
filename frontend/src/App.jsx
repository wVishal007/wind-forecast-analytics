import { useState } from "react";
import MetricCards from "./components/MetricCards.jsx";
import SeriesChart from "./components/SeriesChart.jsx";
import useApi from "./hooks/useApi.js";

const MIN_DAY = "2026-01-01";
const MAX_DAY = "2026-01-31";
const DAY_MS = 86_400_000;
const HORIZON_PRESETS = [4, 12, 24, 48];
const TABS = [
  ["day", "Day-ahead view"],
  ["explore", "Forecast explorer"],
  ["accuracy", "Accuracy"],
];
const LONDON = { timeZone: "Europe/London" };

const formatTime = (iso) =>
  new Date(iso).toLocaleString("en-GB", { ...LONDON, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const formatClock = (iso) => new Date(iso).toLocaleTimeString("en-GB", { ...LONDON, hour: "2-digit", minute: "2-digit" });
const formatHorizon = (h) => `${h}h`;
const formatDay = (day) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const shiftDay = (day, n) => new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
const mw = (v) => `${Math.round(v).toLocaleString()} MW`;

const SERIES_LINES = [
  { key: "actual", name: "Actual", color: "#2f6fed" },
  { key: "forecast", name: "Forecast", color: "#0d9488", dashed: true },
];

function Status({ state, children }) {
  if (state.error) return <p className="error" role="alert">Could not load data: {state.error}</p>;
  if (!state.data) return <div className="skeleton" aria-busy="true" />;
  return <div className={state.loading ? "dim" : undefined}>{children(state.data)}</div>;
}

export default function App() {
  const [tab, setTab] = useState("day");
  const [day, setDay] = useState("2026-01-15");
  const [range, setRange] = useState({ start: "2026-01-10", end: "2026-01-16" });
  const [horizon, setHorizon] = useState(24);

  const accuracy = useApi("/api/accuracy");
  const dayAhead = useApi(`/api/day-ahead?day=${day}`);
  const endExclusive = new Date(Date.parse(`${range.end}T00:00:00Z`) + DAY_MS).toISOString();
  const explorer = useApi(`/api/series?${new URLSearchParams({ start: `${range.start}T00:00:00Z`, end: endExclusive, horizon })}`);

  const headline = accuracy.data?.dayAhead;
  const p90 = headline?.p90;

  return (
    <>
      <header className="top">
        <div className="wrap">
          <div className="brand">
            <span className="mark" aria-hidden="true">💨</span>
            <div>
              <h1>Wind forecast monitor</h1>
              <p>GB national wind · January 2026 · Elexon FUELHH and WINDFOR</p>
            </div>
          </div>
          {headline && (
            <p className="headline">
              Day-ahead forecasts missed by <strong>{mw(headline.mae)}</strong> on average. Nine in ten half-hours were within{" "}
              <strong>{mw(headline.p90)}</strong>.
            </p>
          )}
        </div>
      </header>

      <main className="wrap">
        <div className="tabs" role="tablist" aria-label="Views">
          {TABS.map(([id, label]) => (
            <button key={id} role="tab" id={`tab-${id}`} aria-selected={tab === id} aria-controls="panel" onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        <section className="panel" id="panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          {tab === "day" && (
            <>
              <h2>What was known when the decision was made</h2>
              <p className="lede">
                The forecast a buyer could see at day-ahead gate closure (09:30 the day before), against what the wind actually did.
              </p>
              <div className="controls">
                <div className="stepper">
                  <button aria-label="Previous day" disabled={day <= MIN_DAY} onClick={() => setDay(shiftDay(day, -1))}>‹</button>
                  <input type="date" aria-label="Delivery day" min={MIN_DAY} max={MAX_DAY} value={day} onChange={(e) => e.target.value && setDay(e.target.value)} />
                  <button aria-label="Next day" disabled={day >= MAX_DAY} onClick={() => setDay(shiftDay(day, 1))}>›</button>
                </div>
                <strong className="day-title">{formatDay(day)}</strong>
              </div>
              <Status state={dayAhead}>
                {(d) => {
                  const known = d.series.filter((r) => r.forecast != null);
                  const peak = known.reduce((a, r) => (r.forecast > a.forecast ? r : a), known[0]);
                  const low = known.reduce((a, r) => (r.forecast < a.forecast ? r : a), known[0]);
                  const data = d.series.map((r) => ({ ...r, band: r.forecast == null || p90 == null ? null : [Math.max(0, r.forecast - p90), r.forecast + p90] }));
                  return (
                    <>
                      <ul className="facts">
                        <li>Decision deadline <b>{formatTime(d.gateClosure)}</b></li>
                        <li>Forecast published <b>{d.series[0].publishTime ? formatTime(d.series[0].publishTime) : "n/a"}</b></li>
                        {peak && <li>Forecast peak <b>{mw(peak.forecast)}</b> at {formatClock(peak.time)}</li>}
                        {low && <li>Forecast low <b>{mw(low.forecast)}</b> at {formatClock(low.time)}</li>}
                      </ul>
                      <SeriesChart data={data} xKey="time" lines={SERIES_LINES} formatX={formatClock} band={p90 != null && "Forecast ± P90 error"} />
                      <h3>Accuracy for this day</h3>
                      <MetricCards metrics={d.metrics} />
                    </>
                  );
                }}
              </Status>
            </>
          )}

          {tab === "explore" && (
            <>
              <h2>Explore any period and forecast horizon</h2>
              <p className="lede">For each half-hour, the chart uses the latest forecast published at least this long before it.</p>
              <div className="controls">
                <label>From <input type="date" min={MIN_DAY} max={range.end} value={range.start} onChange={(e) => e.target.value && setRange({ ...range, start: e.target.value })} /></label>
                <label>To <input type="date" min={range.start} max={MAX_DAY} value={range.end} onChange={(e) => e.target.value && setRange({ ...range, end: e.target.value })} /></label>
                <label className="grow">
                  Horizon: <b>{horizon}h</b> before target
                  <input type="range" min="0" max="48" value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} />
                </label>
                <div className="chips" aria-label="Horizon presets">
                  {HORIZON_PRESETS.map((h) => (
                    <button key={h} aria-pressed={horizon === h} onClick={() => setHorizon(h)}>{h}h</button>
                  ))}
                </div>
              </div>
              <Status state={explorer}>
                {(d) => (
                  <>
                    <SeriesChart data={d.series} xKey="time" lines={SERIES_LINES} formatX={formatTime} />
                    <h3>Accuracy for this selection</h3>
                    <MetricCards metrics={d.metrics} />
                  </>
                )}
              </Status>
            </>
          )}

          {tab === "accuracy" && (
            <>
              <h2>How accurate were the forecasts in January?</h2>
              <p className="lede">Day-ahead decision rule, every half-hour of the month.</p>
              <Status state={accuracy}>
                {(d) => (
                  <>
                    <MetricCards metrics={d.dayAhead} />
                    <h3>Error by forecast horizon</h3>
                    <p className="lede">The further ahead a forecast was made, the larger its typical miss.</p>
                    <SeriesChart
                      data={d.byHorizon}
                      xKey="horizon"
                      formatX={formatHorizon}
                      lines={[
                        { key: "mae", name: "Mean absolute error", color: "#0d9488" },
                        { key: "p90", name: "P90 error", color: "#d97706" },
                      ]}
                    />
                  </>
                )}
              </Status>
              <div className="guide">
                <h3>Reading the numbers</h3>
                <p><b>Bias</b> is forecast minus actual. A positive value means wind was over-forecast, so less thermal power was bought than needed and the gap is settled at imbalance prices.</p>
                <p><b>P90 and P99</b> are margins: how large a miss to plan for in 9 and 99 half-hours out of 100.</p>
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="wrap">Data: Elexon BMRS (FUELHH wind actuals, WINDFOR forecasts). Day-ahead gate closure assumed at 09:30 London time.</footer>
    </>
  );
}
