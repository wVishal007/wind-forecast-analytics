import { getHorizonZone, HORIZON_ZONES } from "../../utils/colors";

export default function HorizonControl({
  value,
  onChange,
  min = 0,
  max = 48,
  step = 1,
  showPresets = true,
  presets = [0, 6, 12, 24, 36, 48],
  className = "",
}) {
  const zone = getHorizonZone(value);

  return (
    <div className={`horizon-control ${className}`}>
      <div className="horizon-header">
        <label className="control-label" style={{ marginBottom: 0, flex: 1 }}>
          Forecast made at least
          <span className="horizon-value">
            {value}
            <span className="horizon-unit">h</span>
          </span>
          before target
        </label>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Math.max(min, Math.max(max, Number(e.target.value))))}
          className="control-input"
          style={{ width: "80px", textAlign: "center", marginBottom: 0 }}
          aria-label="Forecast horizon in hours"
        />
      </div>

      <div className="horizon-slider-container">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="control-range horizon-slider"
          aria-label="Forecast horizon in hours"
        />
        <div className="horizon-markers">
          <span>{min}h</span>
          <span className={zone === HORIZON_ZONES.intraday ? "gate-zone" : ""}>
            Intraday (≤{HORIZON_ZONES.intraday.max}h)
          </span>
          <span className={zone === HORIZON_ZONES.dayAhead ? "gate-zone" : ""}>
            Day-ahead ({HORIZON_ZONES.dayAhead.min}–{HORIZON_ZONES.dayAhead.max}h)
          </span>
          <span>{max}h</span>
        </div>
      </div>

      {showPresets && presets.length > 0 && (
        <div className="control-presets">
          {presets.map((h) => (
            <button
              key={h}
              className={`preset-btn ${value === h ? "active" : ""}`}
              onClick={() => onChange(h)}
              aria-pressed={value === h}
            >
              {h}h
            </button>
          ))}
        </div>
      )}
    </div>
  );
}