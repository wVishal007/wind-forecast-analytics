import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const TOOLTIP_STYLE = { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--ink)" };
const mw = (v) => `${Math.round(v).toLocaleString()} MW`;

export default function SeriesChart({ data, xKey, lines, formatX, band }) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey={xKey} tickFormatter={formatX} minTickGap={56} tickMargin={8} />
        <YAxis width={64} domain={[0, "auto"]} tickFormatter={(v) => v.toLocaleString()} label={{ value: "MW", position: "insideTopLeft", offset: 0, dy: -8, className: "axis-unit" }} />
        <Tooltip
          labelFormatter={formatX}
          contentStyle={TOOLTIP_STYLE}
          formatter={(v) => (v == null ? "no data" : Array.isArray(v) ? `${mw(v[0])} to ${mw(v[1])}` : mw(v))}
        />
        <Legend verticalAlign="top" height={32} />
        {band && <Area dataKey="band" name={band} fill="#0d9488" fillOpacity={0.14} stroke="none" isAnimationActive={false} />}
        {lines.map(({ key, name, color, dashed }) => (
          <Line key={key} dataKey={key} name={name} stroke={color} strokeWidth={2} strokeDasharray={dashed ? "6 4" : undefined} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
