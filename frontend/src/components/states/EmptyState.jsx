const EMPTY_STATES = {
  noForecast: {
    icon: "🔮",
    title: "No forecast available",
    description: "No wind forecast was published before gate closure for this delivery day.",
    action: { label: "Try Horizon Explorer", view: "horizon" },
  },
  noActuals: {
    icon: "📊",
    title: "No actuals yet",
    description: "Settled actual generation data is not yet available for this period.",
    action: null,
  },
  noOverlap: {
    icon: "⚠️",
    title: "No overlapping data",
    description: "There are no half-hours where both forecast and actual data exist for this selection.",
    action: null,
  },
  rangeInvalid: {
    icon: "📅",
    title: "Date range outside data scope",
    description: "Data is only available for January 2026. Please select a range within this month.",
    action: { label: "Reset to January", view: "overview" },
  },
  noData: {
    icon: "📭",
    title: "No data to display",
    description: "Adjust your filters or select a different view to see data.",
    action: null,
  },
};

export default function EmptyState({ type = "noData", onAction, ...props }) {
  const state = EMPTY_STATES[type] || EMPTY_STATES.noData;

  return (
    <div className="empty-state" role="status" aria-live="polite" {...props}>
      <div className="empty-icon" aria-hidden="true">{state.icon}</div>
      <h3 className="empty-title">{state.title}</h3>
      <p className="empty-description">{state.description}</p>
      {state.action && (
        <button
          className="empty-action"
          onClick={() => onAction?.(state.action.view)}
        >
          {state.action.label}
        </button>
      )}
    </div>
  );
}