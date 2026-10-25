// Semantic color mapping for charts and UI

export const CHART_COLORS = {
  actual: "var(--color-actual)",
  forecast: "var(--color-forecast)",
  forecastDashed: "var(--color-forecast-dashed)",
  errorPositive: "var(--color-error-positive)",
  errorNegative: "var(--color-error-negative)",
  errorNeutral: "var(--color-error-neutral)",
  p90Band: "var(--color-p90-band)",
  p90Border: "var(--color-p90-border)",
  gateClosure: "var(--color-gate-closure)",
  gateClosureLight: "var(--color-gate-closure-light)",
  grid: "var(--color-grid)",
  gridStrong: "var(--color-grid-strong)",
};

export const METRIC_COLORS = {
  mae: "var(--color-text)",
  rmse: "var(--color-text)",
  bias: (value) => {
    if (value == null) return "var(--color-text-muted)";
    if (value > 50) return "var(--color-error-positive)";
    if (value < -50) return "var(--color-error-negative)";
    return "var(--color-text)";
  },
  p90: "var(--color-p90-border)",
  p99: "var(--color-warning)",
};

export const HORIZON_ZONES = {
  intraday: { min: 0, max: 6, label: "Intraday", color: "var(--color-success-light)" },
  dayAhead: { min: 24, max: 36, label: "Day-ahead", color: "var(--color-gate-closure-light)" },
  forward: { min: 36, max: 48, label: "Forward", color: "var(--color-primary-light)" },
};

export function getHorizonZone(horizon) {
  if (horizon <= 6) return HORIZON_ZONES.intraday;
  if (horizon <= 36) return HORIZON_ZONES.dayAhead;
  return HORIZON_ZONES.forward;
}

export function getErrorColor(error) {
  if (error == null) return CHART_COLORS.errorNeutral;
  return error > 0 ? CHART_COLORS.errorPositive : CHART_COLORS.errorNegative;
}