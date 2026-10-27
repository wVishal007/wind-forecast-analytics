import { useCallback, Suspense, lazy } from "react";
import useApi from "../../hooks/useApi";
import { useAppState } from "../../context/AppStateContext";
import MetricGrid from "../metrics/MetricGrid";
import { ChartSkeleton, MetricGridSkeleton } from "../states/Skeleton";
import EmptyState from "../states/EmptyState";
import ErrorBanner from "../states/ErrorBanner";
import DateRangePicker from "../controls/DateRangePicker";
import HorizonControl from "../controls/HorizonControl";
import { formatTime } from "../../utils/formatters";
import { CHART_COLORS } from "../../utils/colors";

const SeriesChart = lazy(() => import("../charts/SeriesChart"));

const SERIES_LINES = [
  { key: "actual", name: "Actual", color: CHART_COLORS.actual },
  { key: "forecast", name: "Forecast", color: CHART_COLORS.forecast, dashed: true },
];

const MIN_DAY = "2026-01-01";
const MAX_DAY = "2026-01-31";

export default function HorizonExplorerTab() {
  const { state, updateState } = useAppState();
  const { range, horizon } = state;

  const endExclusive = new Date(Date.parse(range.end + "T00:00:00Z") + 86400000).toISOString();
  const explorer = useApi(
    "/api/series?" + new URLSearchParams({ start: range.start + "T00:00:00Z", end: endExclusive, horizon: horizon.toString() })
  );

  const handleRangeChange = useCallback((newRange) => {
    if (newRange.start <= newRange.end) updateState({ range: newRange });
  }, [updateState]);

  const handleHorizonChange = useCallback((h) => updateState({ horizon: Math.max(0, Math.min(48, h)) }), [updateState]);

  if (explorer.loading) return <Suspense fallback={<LoadingFallback />}><ChartSkeleton /><MetricGridSkeleton count={5} /></Suspense>;
  if (explorer.error) return <ErrorBanner message={explorer.error} onRetry={explorer.refetch} details={explorer.error} />;
  if (!explorer.data) return <EmptyState type="noData" />;

  const { series, metrics } = explorer.data;

  return (
    <div className="tab-content">
      <section className="content-section">
        <header className="section-header">
          <h2>Horizon Explorer</h2>
          <p className="section-desc">Select a date range and forecast horizon to see the latest forecast available that far in advance.</p>
        </header>
        <div className="controls-grid">
          <DateRangePicker value={range} onChange={handleRangeChange} minDate={MIN_DAY} maxDate={MAX_DAY} />
          <HorizonControl value={horizon} onChange={handleHorizonChange} min={0} max={48} step={1} showPresets presets={[0,6,12,24,36,48]} />
        </div>
        <Suspense fallback={<ChartSkeleton />}>
          <SeriesChart data={series} xKey="time" lines={SERIES_LINES} formatX={formatTime}
            chartId="horizon-explorer" syncCrosshair={true} enableZoom={true} />
        </Suspense>
        {metrics ? <MetricGrid metrics={metrics} /> : <EmptyState type="noOverlap" />}
      </section>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="loading-fallback">
      <ChartSkeleton />
      <MetricGridSkeleton count={5} />
    </div>
  );
}