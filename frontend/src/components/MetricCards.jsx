const FIELDS = [
  ["mae", "Mean absolute error", "Typical size of a miss"],
  ["rmse", "RMSE", "Penalises large misses"],
  ["bias", "Bias", "+ over-forecast, − under-forecast"],
  ["p90", "P90 error", "9 in 10 misses are smaller"],
  ["p99", "P99 error", "Worst-case margin to hold"],
];

export default function MetricCards({ metrics }) {
  if (!metrics) return <p className="empty">No overlapping forecast and actual data for this selection.</p>;
  return (
    <>
      <dl className="kpis">
        {FIELDS.map(([key, label, hint]) => (
          <div key={key} className="kpi">
            <dt>{label}</dt>
            <dd>
              {key === "bias" && metrics[key] > 0 ? "+" : ""}
              {Math.round(metrics[key]).toLocaleString()}
              <small> MW</small>
            </dd>
            <span>{hint}</span>
          </div>
        ))}
      </dl>
      <p className="note">Based on {metrics.n.toLocaleString()} half-hours with both a forecast and an actual.</p>
    </>
  );
}
