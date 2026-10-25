import { Suspense, lazy } from " react\;
import { useApi } from \../../hooks/useApi\;
import { ChartSkeleton } from \../states/Skeleton\;
import EmptyState from \../states/EmptyState\;
import ErrorBanner from \../states/ErrorBanner\;
import { formatHorizon } from \../../utils/formatters\;

const ErrorHorizonChart = lazy(() => import(\../charts/ErrorHorizonChart\));

export default function ErrorHorizonTab() {
 const accuracy = useApi(\/api/accuracy\);

 if (accuracy.loading) return <Suspense fallback={<ChartSkeleton />}><ChartSkeleton /></Suspense>;
 if (accuracy.error) return <ErrorBanner message={accuracy.error} onRetry={accuracy.refetch} details={accuracy.error} />;
 if (!accuracy.data?.byHorizon) return <EmptyState type=\noData\ />;

 return (
 <div className=\tab-content\>
 <section className=\content-section\>
 <header className=\section-header\>
 <h2>Error vs Forecast Horizon</h2>
 <p className=\section-desc\>MAE and P90 absolute error for each forecast horizon from 0 to 48 hours across all of January 2026.</p>
 </header>
 <Suspense fallback={<ChartSkeleton />}>
 <ErrorHorizonChart data={accuracy.data.byHorizon} formatX={formatHorizon} />
 </Suspense>
 </section>
 </div>
 );
}
