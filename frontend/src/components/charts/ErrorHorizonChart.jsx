import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { formatNumber } from "../../utils/formatters";
import { CHART_COLORS, HORIZON_ZONES } from "../../utils/colors";

export default function ErrorHorizonChart({
  data,
  formatX,
  height = 360,
}) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Prepare zone reference areas
  const zoneAreas = useMemo(() => {
    return Object.values(HORIZON_ZONES).map((zone, idx) => (
      <ReferenceArea
        key={`zone-${idx}`}
        x1={zone.min}
        x2={zone.max}
        fill={zone.color}
        fillOpacity={0.3}
      />
    ));
  }, []);

  // Day-ahead reference line (~30h)
  const dayAheadLine = (
    <>
      <ReferenceLine
        x={30}
        stroke={CHART_COLORS.gateClosure}
        strokeWidth={1.5}
        strokeDasharray="6 4"
        label={{
          position: "top",
          value: "Day-ahead",
          fill: CHART_COLORS.gateClosure,
          fontSize: 10,
          fontWeight: 600,
          background: CHART_COLORS.gateClosureLight,
          padding: { x: 4, y: 1 },
          borderRadius: 3,
          offset: -10,
        }}
      />
    </>
  );

  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const horizon = parseInt(label, 10);
    const entry = data.find((d) => d.horizon === horizon);
    if (!entry) return null;

    // Determine zone
    let zoneLabel = "";
    if (horizon <= 6) zoneLabel = "Intraday";
    else if (horizon <= 36) zoneLabel = "Day-ahead";
    else zoneLabel = "Forward";

    setActiveTooltip({ horizon, zoneLabel });

    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-header">
          {formatX(label)}
          <span className="tooltip-zone-badge" style={{
            background: horizon <= 6 ? HORIZON_ZONES.intraday.color :
                        horizon <= 36 ? HORIZON_ZONES.dayAhead.color : HORIZON_ZONES.forward.color,
            color: horizon <= 6 ? "#166534" : horizon <= 36 ? "#6b21a8" : "#0e7490",
          }}>
            {zoneLabel}
          </span>
        </div>
        <div className="chart-tooltip-row">
          <span className="chart-tooltip-label">MAE</span>
          <span className="chart-tooltip-value">{formatNumber(entry.mae)} MW</span>
        </div>
        <div className="chart-tooltip-row">
          <span className="chart-tooltip-label">RMSE</span>
          <span className="chart-tooltip-value">{formatNumber(entry.rmse)} MW</span>
        </div>
        <div className="chart-tooltip-row">
          <span className="chart-tooltip-label">Bias</span>
          <span className="chart-tooltip-value">{entry.bias > 0 ? "+" : ""}{formatNumber(entry.bias)} MW</span>
        </div>
        <div className="chart-tooltip-row">
          <span className="chart-tooltip-label">P90</span>
          <span className="chart-tooltip-value">{formatNumber(entry.p90)} MW</span>
        </div>
        <div className="chart-tooltip-row">
          <span className="chart-tooltip-label">P99</span>
          <span className="chart-tooltip-value">{formatNumber(entry.p99)} MW</span>
        </div>
        <div className="chart-tooltip-row">
          <span className="chart-tooltip-label">Samples</span>
          <span className="chart-tooltip-value">{formatNumber(entry.n)} half-hours</span>
        </div>
      </div>
    );
  };

  // Zone legend
  const zoneLegend = useMemo(() => (
    <div className="zone-legend" role="list" aria-label="Forecast horizon zones">
      {Object.values(HORIZON_ZONES).map((zone) => (
        <div key={zone.label} className="zone-legend-item" style={{ "--zone-color": zone.color }}>
          <span className="zone-swatch" style={{ background: zone.color }} />
          <span className="zone-name">{zone.label}</span>
          <span className="zone-range">{zone.min}–{zone.max}h</span>
        </div>
      ))}
    </div>
  ), []);

  return (
    <div className="error-horizon-chart">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="horizon"
            tickFormatter={formatX}
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--color-grid)" }}
            tickLine={{ stroke: "var(--color-grid)" }}
            domain={[0, 48]}
          />
          <YAxis
            width={72}
            tickFormatter={(v) => formatNumber(v)}
            unit=" MW"
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--color-grid)" }}
            tickLine={{ stroke: "var(--color-grid)" }}
            domain={["dataMin", "dataMax"]}
          />
          <Tooltip content={customTooltip} />
          <Legend wrapperStyle={{ paddingTop: 4 }} />
          {zoneAreas}
          {dayAheadLine}
          <Area
            type="monotone"
            dataKey="mae"
            name="Mean Absolute Error (MAE)"
            stroke={CHART_COLORS.forecast}
            fill={CHART_COLORS.forecast}
            fillOpacity={0.15}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="p90"
            name="90th Percentile Error (P90)"
            stroke={CHART_COLORS.p90Border}
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      {zoneLegend}
    </div>
  );
}