import { useMemo, useRef, useEffect, useState,useCallback } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  Layer,
  Brush,
} from "recharts";
import { formatError, getErrorColorClass, formatNumber, formatTime, formatPercent } from "../../utils/formatters";
import { CHART_COLORS } from "../../utils/colors";
import { useChartSync } from "../../hooks/useChartSync";

const DEFAULT_COLORS = {
  actual: CHART_COLORS.actual,
  forecast: CHART_COLORS.forecast,
  forecastDashed: CHART_COLORS.forecastDashed,
};

export default function SeriesChart({
  data,
  xKey = "time",
  lines = [],
  formatX,
  annotations = [],
  height = 360,
  showErrorBand = false,
  p90Error = null,
  chartId = "default",
  syncCrosshair = true,
  enableZoom = true,
}) {
  const chartRef = useRef(null);
  const [brushRange, setBrushRange] = useState(null);
  const [crosshair, setCrosshairState] = useState({ active: false, xValue: null });
  const { subscribe, setCrosshair, getCrosshair } = useChartSync(chartId);

  // Subscribe to crosshair changes from other charts
  useEffect(() => {
    if (!syncCrosshair) return;
    return subscribe(({ active, xValue }) => {
      setCrosshairState({ active, xValue });
    });
  }, [subscribe, syncCrosshair]);

  // Handle local crosshair changes
  const handleCrosshairChange = useCallback(({ active, payload }) => {
    if (!syncCrosshair) return;
    const xValue = active && payload?.length ? payload[0].payload[xKey] : null;
    setCrosshair(active, xValue);
    setCrosshairState({ active, xValue });
  }, [syncCrosshair, setCrosshair, xKey]);

  // Handle brush for zoom
  const handleBrushChange = useCallback(({ startIndex, endIndex }) => {
    if (!enableZoom) return;
    if (startIndex !== 0 || endIndex !== data.length - 1) {
      setBrushRange({ startIndex, endIndex });
    } else {
      setBrushRange(null);
    }
  }, [data.length, enableZoom]);

  const resetZoom = useCallback(() => {
    setBrushRange(null);
  }, []);

  // Prepare annotation layers
  const annotationLayers = useMemo(() => {
    return annotations.map((ann, idx) => {
      if (ann.type === "gateClosure") {
        return (
          <Layer key={`gate-closure-${idx}`}>
            <ReferenceLine
              x={ann.value}
              stroke={CHART_COLORS.gateClosure}
              strokeWidth={2}
              strokeDasharray="8 4"
              label={{
                position: "top",
                value: ann.label || "Gate closure",
                fill: CHART_COLORS.gateClosure,
                fontSize: 11,
                fontWeight: 600,
                background: CHART_COLORS.gateClosureLight,
                padding: { x: 6, y: 2 },
                borderRadius: 4,
              }}
            />
          </Layer>
        );
      }
      return null;
    });
  }, [annotations]);

  // Error band area
  const errorBand = showErrorBand && p90Error && data.length > 0 ? (
    <Layer key="error-band">
      {data.map((row, i) => {
        if (row.forecast == null) return null;
        const nextRow = data[i + 1];
        const upper = row.forecast + p90Error;
        const lower = row.forecast - p90Error;
        const nextUpper = nextRow?.forecast != null ? nextRow.forecast + p90Error : upper;
        const nextLower = nextRow?.forecast != null ? nextRow.forecast - p90Error : lower;

        return (
          <path
            key={i}
            d={`M ${row[xKey]} ${upper} L ${nextRow?.[xKey] || row[xKey]} ${nextUpper} L ${nextRow?.[xKey] || row[xKey]} ${nextLower} L ${row[xKey]} ${lower} Z`}
            fill={CHART_COLORS.p90Band}
            stroke={CHART_COLORS.p90Border}
            strokeWidth={0.5}
            strokeDasharray="4 2"
          />
        );
      })}
    </Layer>
  ) : null;

  // Missing data markers
  const missingMarkers = data
    .filter((row) => row.forecast == null || row.actual == null)
    .map((row, i) => (
      <Layer key={`missing-${i}`}>
        <text
          x={row[xKey]}
          y={20}
          textAnchor="middle"
          fill="var(--color-chart-missing-marker)"
          fontSize={14}
          fontWeight="bold"
          pointerEvents="none"
        >
          ✕
        </text>
      </Layer>
    ));

  // Crosshair line
  const crosshairLine = crosshair.active && crosshair.xValue ? (
    <Layer key="crosshair">
      <line
        x1={crosshair.xValue}
        y1={0}
        x2={crosshair.xValue}
        y2="100%"
        stroke="var(--color-chart-crosshair)"
        strokeWidth={1}
        strokeDasharray="4 4"
        pointerEvents="none"
      />
    </Layer>
  ) : null;

  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const row = payload[0].payload;
    const actual = row.actual;
    const forecast = row.forecast;
    const publishTime = row.publishTime;
    const error = forecast != null && actual != null ? forecast - actual : null;
    const errorPct = error != null && actual != null && actual !== 0 ? (error / actual) * 100 : null;

    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-header">{formatX(label)}</div>
        <div className="chart-tooltip-row">
          <span className="chart-tooltip-label">Actual</span>
          <span className="chart-tooltip-value">{actual != null ? `${formatNumber(actual)} MW` : "—"}</span>
        </div>
        <div className="chart-tooltip-row">
          <span className="chart-tooltip-label">Forecast</span>
          <span className="chart-tooltip-value">{forecast != null ? `${formatNumber(forecast)} MW` : "—"}</span>
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

  // Determine data slice for zoom
  let chartData = data;
  if (brushRange) {
    chartData = data.slice(brushRange.startIndex, brushRange.endIndex + 1);
  }

  return (
    <div className="chart-container" style={{ height, position: "relative" }}>
      {enableZoom && brushRange && (
        <button
          className="zoom-reset-btn"
          onClick={resetZoom}
          aria-label="Reset zoom"
          title="Reset zoom (double-click chart)"
        >
          ✕ Reset zoom
        </button>
      )}

      {/* Accessible chart summary for screen readers */}
      <div className="chart-sr-summary" aria-hidden="false">
        <span id={`chart-summary-${chartId}`} className="sr-only">
          Line chart showing actual vs forecast wind generation over time.
          {data.length} data points. {data.filter(d => d.forecast != null).length} with forecast data.
          {data.filter(d => d.forecast == null).length} missing forecast values.
        </span>
      </div>

      <ResponsiveContainer width="100%" height="100%" role="img" aria-labelledby={`chart-summary-${chartId}`}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, bottom: brushRange ? 60 : 4, left: 8 }}
          ref={chartRef}
        >
          <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey={xKey}
            tickFormatter={formatX}
            minTickGap={56}
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--color-grid)" }}
            tickLine={{ stroke: "var(--color-grid)" }}
            allowDecimals={false}
            interval={brushRange ? "preserveStartEnd" : "preserveEnd"}
          />
          <YAxis
            width={72}
            tickFormatter={(v) => formatNumber(v)}
            unit=" MW"
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--color-grid)" }}
            tickLine={{ stroke: "var(--color-grid)" }}
          />
          <Tooltip
            content={customTooltip}
            labelFormatter={formatX}
            formatter={(v) => (v == null ? "no data" : `${formatNumber(v)} MW`)}
            onChange={handleCrosshairChange}
          />
          <Legend
            wrapperStyle={{ paddingTop: 4 }}
            iconType="line"
            iconHeight={3}
          />
          {errorBand}
          {annotationLayers}
          {missingMarkers}
          {crosshairLine}
          {lines.map(({ key, name, color, dashed }) => (
            <Line
              key={key}
              dataKey={key}
              name={name}
              stroke={color || DEFAULT_COLORS[key]}
              strokeWidth={2}
              strokeDasharray={dashed ? "6 4" : undefined}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          ))}
          {enableZoom && (
            <Brush
              dataKey={xKey}
              height={30}
              startIndex={brushRange?.startIndex ?? 0}
              endIndex={brushRange?.endIndex ?? data.length - 1}
              onChange={handleBrushChange}
              tickFormatter={formatX}
              travellerWidth={8}
              travellerStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-primary)",
                borderRadius: "var(--radius-sm)",
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}