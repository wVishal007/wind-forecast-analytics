import { Suspense, lazy } from " react\;
import { useApi } from \../../hooks/useApi\;
import MetricGrid from \../metrics/MetricGrid\;
import { ChartSkeleton, MetricGridSkeleton } from \../states/Skeleton\;
import EmptyState from \../states/EmptyState\;
import ErrorBanner from \../states/ErrorBanner\;
import { formatHorizon } from \../../utils/formatters\;

const ErrorHorizonChart = lazy(() => import(\../charts/ErrorHorizonChart\));

export default function OverviewTab() {
 const accuracy = useApi(\/api/accuracy\);

 if (accuracy.loading) {
 return (
 <Suspense fallback={<LoadingFallback />}>
 <ChartSkeleton />
 <MetricGridSkeleton count={5} />
 </Suspense>
 );
 }

 if (accuracy.error) {
 return (
 <ErrorBanner
 message={accuracy.error}
 onRetry={accuracy.refetch}
 details={accuracy.error}
 />
 );
 }

 if (!accuracy.data) return <EmptyState type=\noData\ />;

 const { dayAhead, byHorizon } = accuracy.data;

 return (
 <div className=\tab-content\>
 <section className=\content-section\>
 <header className=\section-header\>
 <h2>Wind Forecast Performance</h2>
 <p className=\section-desc\>
 Error of the latest forecast published before day-ahead gate closure (09:30 the day before delivery), across every
 half-hour of January 2026.
 </p>
 </header>
 {dayAhead ? <MetricGrid metrics={dayAhead} /> : <EmptyState type=\noOverlap\ />}
 <p className=\section-note\>
 Positive bias indicates the forecast overestimated wind generation (under-procurement risk). Negative bias indicates underestimation.
 </p>
 </section>

 <section className=\content-section\>
 <header className=\section-header\>
 <h2>Does Error Grow with Forecast Horizon?</h2>
 <p className=\section-desc\>MAE and P90 absolute error for each forecast horizon from 0 to 48 hours across January 2026.</p>
 </header>
 {byHorizon && byHorizon.length > 0 ? (
 <Suspense fallback={<ChartSkeleton />}>
 <ErrorHorizonChart data={byHorizon} formatX={formatHorizon} />
 </Suspense>
 ) : (
 <EmptyState type=\noData\ />
 )}
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
