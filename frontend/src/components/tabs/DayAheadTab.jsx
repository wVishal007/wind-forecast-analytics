import { useCallback, Suspense, lazy } from " react\;
import { useApi } from \../../hooks/useApi\;
import { useAppState } from \../../context/AppStateContext\;
import MetricGrid from \../metrics/MetricGrid\;
import { ChartSkeleton, MetricGridSkeleton } from \../states/Skeleton\;
import EmptyState from \../states/EmptyState\;
import ErrorBanner from \../states/ErrorBanner\;
import DateRangePicker from \../controls/DateRangePicker\;
import { formatTime, formatClock, isInJanuary2026, parseLondonDate } from \../../utils/formatters\;
import { CHART_COLORS } from \../../utils/colors\;

const SeriesChart = lazy(() => import(\../charts/SeriesChart\));

const SERIES_LINES = [
 { key: \actual\, name: \Actual\, color: CHART_COLORS.actual },
 { key: \forecast\, name: \Forecast\, color: CHART_COLORS.forecast, dashed: true },
];

const MIN_DAY = \2026-01-01\;
const MAX_DAY = \2026-01-31\;

export default function DayAheadTab() {
 const { state, updateState } = useAppState();
 const day = state.day;
 const dayAhead = useApi(\/api/day-ahead?day=\ + day);

 const handleDayChange = useCallback((newDay) => {
 if (newDay && isInJanuary2026(newDay)) updateState({ day: newDay });
 }, [updateState]);

 const goToPrevDay = useCallback(() => {
 const cur = parseLondonDate(day);
 const prev = new Date(cur.getTime() - 86400000);
 if (prev >= parseLondonDate(MIN_DAY)) handleDayChange(prev.toISOString().split(\T\)[0]);
 }, [day, handleDayChange]);

 const goToNextDay = useCallback(() => {
 const cur = parseLondonDate(day);
 const nxt = new Date(cur.getTime() + 86400000);
 if (nxt <= parseLondonDate(MAX_DAY)) handleDayChange(nxt.toISOString().split(\T\)[0]);
 }, [day, handleDayChange]);

 if (dayAhead.loading) return <Suspense fallback={<LoadingFallback />}><ChartSkeleton /><MetricGridSkeleton count={5} /></Suspense>;
 if (dayAhead.error) return <ErrorBanner message={dayAhead.error} onRetry={dayAhead.refetch} details={dayAhead.error} />;
 if (!dayAhead.data) return <EmptyState type=\noData\ />;

 const { gateClosure, series, metrics } = dayAhead.data;
 const firstForecastTime = series.find((s) => s.forecast != null)?.publishTime;

 return (
 <div className=\tab-content\>
 <section className=\content-section\>
 <header className=\section-header\>
 <h2>Day-Ahead Gate Closure View</h2>
 <p className=\section-desc\>The forecast available at 09:30 London time the day before delivery, compared to actual output.</p>
 <div className=\section-controls\>
 <label className=\control-label\>
 Delivery day
 <input
 type=\date\
 min={MIN_DAY}
 max={MAX_DAY}
 value={day}
 onChange={(e) => e.target.value && handleDayChange(e.target.value)}
 className=\control-input\
 />
 </label>
 <div className=\day-nav\>
 <button className=\icon-btn\ onClick={goToPrevDay} disabled={day===MIN_DAY} aria-label=\Previous day\ title=\Previous day\>
 <svg width=\18\ height=\18\ viewBox=\0 0 24 24\ fill=\none\ stroke=\currentColor\ strokeWidth=\2\ strokeLinecap=\round\ strokeLinejoin=\round\><polyline points=\15 18 9 12 15 6\/></svg>
 </button>
 <button className=\icon-btn\ onClick={goToNextDay} disabled={day===MAX_DAY} aria-label=\Next day\ title=\Next day\>
 <svg width=\18\ height=\18\ viewBox=\0 0 24 24\ fill=\none\ stroke=\currentColor\ strokeWidth=\2\ strokeLinecap=\round\ strokeLinejoin=\round\><polyline points=\9 18 15 12 9 6\/></svg>
 </button>
 </div>
 </div>
 </header>
 <p className=\section-meta\>
 Decision made by <strong>{formatTime(gateClosure)}</strong>. Latest forecast used was published{" \}
          {firstForecastTime ? <strong>{formatTime(firstForecastTime)}</strong> : <em>— no forecast available</em>}.
        </p>
        <Suspense fallback={<ChartSkeleton />}>
          <SeriesChart data={series} xKey=\time\ lines={SERIES_LINES} formatX={formatClock}
                       annotations={[{type:\gateClosure\,value:gateClosure,label:\Gate closure\}]}
                       chartId=\day-ahead\ syncCrosshair={true} enableZoom={true} />
        </Suspense>
        {metrics ? <MetricGrid metrics={metrics} /> : <EmptyState type=\noOverlap\ />}
      </section>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className=\loading-fallback\>
      <ChartSkeleton />
      <MetricGridSkeleton count={5} />
    </div>
  );
}
