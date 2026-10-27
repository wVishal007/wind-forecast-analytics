import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "../../utils/formatters";
import { CHART_COLORS, HORIZON_ZONES, getHorizonZone } from "../../utils/colors";

export default function ErrorHorizonChart({ data, formatX = (v) => v, height = 360 }) {
  const customTooltip = ({ active, label }) => {
    if (!active) return null;
    const entry = data.find((d) => d.horizon === Number(label));
    if (!entry) return null;
    const zone = getHorizonZone(entry.horizon);

    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-header">
          {formatX(entry.horizon)} <span className="tooltip-zone-badge" style={{ background: zone.color }}>{zone.label}</span>
        </div>
        {[
          ["MAE", entry.mae],
          ["RMSE", entry.rmse],
          ["Bias", entry.bias],
          ["P90", entry.p90],
          ["P99", entry.p99],
        ].map(([name, v]) => (
          <div className="chart-tooltip-row" key={name}>
            <span className="chart-tooltip-label">{name}</span>
            <span className="chart-tooltip-value">
              {name === "Bias" && v > 0 ? "+" : ""}{formatNumber(v)} MW
            </span>
          </div>
        ))}
        <div className="chart-tooltip-row">
          <span className="chart-tooltip-label">Samples</span>
          <span className="chart-tooltip-value">{formatNumber(entry.n)}</span>
        </div>
      </div>
    );
  };

  const zoneLegend = useMemo(
    () => (
      <div className="zone-legend" role="list" aria-label="Forecast horizon zones">
        {Object.values(HORIZON_ZONES).map((zone) => (
          <div key={zone.label} className="zone-legend-item" role="listitem">
            <span className="zone-swatch" style={{ background: zone.color }} />
            <span className="zone-name">{zone.label}</span>
            <span className="zone-range">{zone.min}–{zone.max}h</span>
          </div>
        ))}
      </div>
    ),
    []
  );

  return (
    <div className="error-horizon-chart">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 16, right: 16, bottom: 4, left: 8 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="horizon"
            type="number"
            domain={[0, 48]}
            ticks={[0, 6, 12, 18, 24, 30, 36, 42, 48]}
            tickFormatter={formatX}
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--color-grid)" }}
            tickLine={{ stroke: "var(--color-grid)" }}
          />
          <YAxis
            width={72}
            domain={[0, "auto"]}
            tickFormatter={(v) => formatNumber(v)}
            unit=" MW"
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--color-grid)" }}
            tickLine={{ stroke: "var(--color-grid)" }}
          />
          <Tooltip content={customTooltip} />
          <Legend wrapperStyle={{ paddingTop: 4 }} />
          {Object.entries(HORIZON_ZONES).map(([key, z]) => (
            <ReferenceArea key={key} x1={z.min} x2={z.max} fill={z.color} fillOpacity={0.3} ifOverflow="visible" />
          ))}
          <ReferenceLine x={30} stroke={CHART_COLORS.gateClosure} strokeWidth={1.5} strokeDasharray="6 4" />
          <Area
            type="monotone"
            dataKey="mae"
            name="Mean absolute error (MAE)"
            stroke={CHART_COLORS.forecast}
            fill={CHART_COLORS.forecast}
            fillOpacity={0.15}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="p90"
            name="90th percentile error (P90)"
            stroke={CHART_COLORS.p90Border}
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      {zoneLegend}
    </div>
  );
}