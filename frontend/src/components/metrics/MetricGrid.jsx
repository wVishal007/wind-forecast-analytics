import { AnimatedMetricCard as MetricCard } from "./MetricCard";

const FIELDS = [
  { key: "mae", label: "MAE", desc: "Typical miss size", unit: "MW" },
  { key: "rmse", label: "RMSE", desc: "Large misses weigh more", unit: "MW" },
  { key: "bias", label: "Bias", desc: "Over-forecast (+) / Under-forecast (−)", unit: "MW", badge: true },
  { key: "p90", label: "P90", desc: "90% of errors below this", unit: "MW" },
  { key: "p99", label: "P99", desc: "99% of errors below this", unit: "MW" },
];

export default function MetricGrid({ metrics, className = "", animate = true }) {
  if (!metrics) return null;

  return (
    <div className={`metric-grid ${className}`} role="region" aria-label="Forecast accuracy metrics">
      {FIELDS.map((field, index) => (
        <MetricCard
          key={field.key}
          label={field.label}
          value={metrics[field.key]}
          unit={field.unit}
          desc={field.desc}
          showBadge={field.badge}
          badgeValue={metrics.bias}
          delay={animate ? index * 80 : 0}
          duration={animate ? 700 : 0}
        />
      ))}
      <div className="metric-footer">
        Based on {metrics.n?.toLocaleString() ?? "—"} half-hours
      </div>
    </div>
  );
}