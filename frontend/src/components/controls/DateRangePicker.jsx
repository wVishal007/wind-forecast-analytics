import { useState, useRef, useEffect } from "react";

const PRESETS = [
  { label: "Today", getRange: () => {
    const today = new Date().toISOString().split("T")[0];
    return { start: today, end: today };
  }},
  { label: "This Week", getRange: () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + 1); // Monday
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Sunday
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  }},
  { label: "Last 7 Days", getRange: () => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() - 1); // Yesterday
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  }},
  { label: "Full Month", getRange: () => ({
    start: "2026-01-01",
    end: "2026-01-31",
  })},
];

export default function DateRangePicker({
  value,
  onChange,
  minDate = "2026-01-01",
  maxDate = "2026-01-31",
  className = "",
}) {
  const [showPresets, setShowPresets] = useState(false);
  const presetsRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (presetsRef.current && !presetsRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setShowPresets(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePresetClick = (preset) => {
    const range = preset.getRange();
    // Clamp to valid range
    if (range.start < minDate) range.start = minDate;
    if (range.end > maxDate) range.end = maxDate;
    onChange(range);
    setShowPresets(false);
  };

  return (
    <div className={`date-range-picker ${className}`}>
      <div className="date-range-inputs">
        <label className="control-label" style={{ marginBottom: 0 }}>
          From
          <input
            type="date"
            min={minDate}
            max={value.end}
            value={value.start}
            onChange={(e) => onChange({ ...value, start: e.target.value })}
            className="control-input"
          />
        </label>
        <span className="date-separator" aria-hidden="true">–</span>
        <label className="control-label" style={{ marginBottom: 0 }}>
          To
          <input
            type="date"
            min={value.start}
            max={maxDate}
            value={value.end}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
            className="control-input"
          />
        </label>
      </div>

      <div className="preset-trigger">
        <button
          ref={triggerRef}
          type="button"
          className="preset-btn"
          onClick={() => setShowPresets(!showPresets)}
          aria-expanded={showPresets}
          aria-haspopup="listbox"
        >
          Presets ▼
        </button>
        {showPresets && (
          <div ref={presetsRef} className="preset-dropdown" role="listbox">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                role="option"
                className="preset-dropdown-item"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}