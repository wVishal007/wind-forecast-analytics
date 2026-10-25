export default function Skeleton({ className = "", style = {}, ...props }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        ...style,
        background: "linear-gradient(90deg, var(--color-surface-border) 25%, var(--color-surface-hover) 50%, var(--color-surface-border) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
      {...props}
    />
  );
}

export function ChartSkeleton({ height = "360px" }) {
  return (
    <div className="chart-skeleton" style={{ height }}>
      <Skeleton className="skeleton-title" style={{ height: "24px", width: "40%", marginBottom: "16px" }} />
      <Skeleton className="skeleton-chart" style={{ height: "calc(100% - 40px)", borderRadius: "var(--radius-md)" }} />
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="metric-card-skeleton">
      <Skeleton className="skeleton-label" style={{ height: "14px", width: "60%", marginBottom: "8px" }} />
      <Skeleton className="skeleton-value" style={{ height: "32px", width: "80%" }} />
    </div>
  );
}

export function MetricGridSkeleton({ count = 5 }) {
  return (
    <div className="metric-grid-skeleton">
      {Array.from({ length: count }, (_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }) {
  return (
    <div className="table-row-skeleton">
      {Array.from({ length: columns }, (_, i) => (
        <Skeleton key={i} style={{ height: "16px", width: "80%", borderRadius: "var(--radius-sm)" }} />
      ))}
    </div>
  );
}