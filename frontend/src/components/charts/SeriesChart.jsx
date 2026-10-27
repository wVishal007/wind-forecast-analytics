import { useMemo } from "react";
import {
  Area,
  Brush,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatError, getErrorColorClass, formatNumber, formatTime } from "../../utils/formatters";
import { CHART_COLORS } from "../../utils/colors";

const DEFAULT_COLORS = {
  actual: CHART_COLORS.actual,
  forecast: CHART_COLORS.forecast,
};

export default function SeriesChart({
  data,
  xKey = "time",
  lines = [],
  formatX = (v) => v,
  height = 360,
  showErrorBand = false,
  p90Error = null,
  chartId = "default",
  syncCrosshair = true,
  enableZoom = true,
}) {
  const hasBand = showErrorBand && p90Error != null;

  // Always return the data. Add band fields only when the band is on.
  const chartData = useMemo(() => {
    if (!hasBand) return data;
    return data.map((row) => {
      if (row.forecast == null) return { ...row, bandLow: null, bandSpan: null };
      const low = Math.max(0, row.forecast - p90Error);
      const high = row.forecast + p90Error;
      return { ...row, bandLow: low, bandSpan: high - low };
    });
  }, [data, hasBand, p90Error]);

  const withForecast = data.filter((d) => d.forecast != null).length;

  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload;
    const { actual, forecast, publishTime } = row;
    const error = forecast != null && actual != null ? forecast - actual : null;
    const errorPct = error != null && actual ? (error / actual) * 100 : null;

    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-header">{formatX(label)}</div>
        <div className="chart-tooltip-row">
          <span className="chart-tooltip-label">Actual</span>
          <span className="chart-tooltip-value">{actual != null ? `${formatNumber(actual)} MW` : "—"}</span>
        </div>
        <div className="chart-tooltip-row">
          <span className="chart-tooltip-label">Forecast</span>
          <span className="chart-tooltip-value">{forecast != null ? `${formatNumber(forecast)} MW` : "— (no forecast for this half-hour)"}</span>
        </div>
        {publishTime && (
          <div className="chart-tooltip-row">
            <span className="chart-tooltip-label">Published</span>
            <span className="chart-tooltip-value">{formatTime(publishTime)}</span>
          </div>
        )}
        {error != null && (
          <div className="chart-tooltip-row">
            <span className="chart-tooltip-label">Error</span>
            <span className={`chart-tooltip-value chart-tooltip-error ${getErrorColorClass(error)}`}>
              {formatError(error)}
              {errorPct != null && <span className="error-pct"> ({errorPct > 0 ? "+" : ""}{errorPct.toFixed(1)}%)</span>}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chart-container" style={{ height, position: "relative" }}>
      <span id={`chart-summary-${chartId}`} className="sr-only">
        Line chart of actual versus forecast wind generation. {data.length} points, {withForecast} with a forecast.
      </span>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 16, bottom: enableZoom ? 60 : 4, left: 8 }}
          syncId={syncCrosshair ? chartId : undefined}
        >
          <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey={xKey}
            tickFormatter={formatX}
            minTickGap={56}
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--color-grid)" }}
            tickLine={{ stroke: "var(--color-grid)" }}
          />
          <YAxis
            width={72}
            tickFormatter={(v) => formatNumber(v)}
            unit=" MW"
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--color-grid)" }}
            tickLine={{ stroke: "var(--color-grid)" }}
            domain={[0, "auto"]}
          />
          <Tooltip content={customTooltip} />
          <Legend wrapperStyle={{ paddingTop: 4 }} iconType="line" iconHeight={3} />

          {hasBand && (
            <>
              <Area
                dataKey="bandLow"
                name="bandLow"
                type="monotone"
                stackId="p90band"
                stroke="none"
                fill="none"
                isAnimationActive={false}
                connectNulls
                legendType="none"
                tooltipType="none"
              />
              <Area
                dataKey="bandSpan"
                name="Forecast ± P90 error"
                type="monotone"
                stackId="p90band"
                stroke="none"
                fill={CHART_COLORS.p90Band}
                fillOpacity={1}
                isAnimationActive={false}
                connectNulls
                tooltipType="none"
              />
            </>
          )}

          {lines.map(({ key, name, color, dashed }) => (
            <Line
              key={key}
              dataKey={key}
              name={name}
              stroke={color || DEFAULT_COLORS[key]}
              strokeWidth={2}
              strokeDasharray={dashed ? "6 4" : undefined}
              dot={false}
              activeDot={{ r: 4 }}
              type="monotone"
              isAnimationActive={false}
              connectNulls
            />
          ))}

          {enableZoom && (
            <Brush dataKey={xKey} height={30} tickFormatter={formatX} travellerWidth={8} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}