const TABS = [
  { id: "overview", label: "Overview", desc: "January accuracy summary" },
  { id: "day-ahead", label: "Day-Ahead", desc: "Gate closure forecast vs actual" },
  { id: "horizon", label: "Horizon Explorer", desc: "Range + forecast horizon" },
  { id: "error-horizon", label: "Error vs Horizon", desc: "MAE/P90 across 0–48h" },
];

export default function TabNavigation({ activeTab, onChange, className = "" }) {
  return (
    <nav className={`tab-navigation ${className}`} role="tablist" aria-label="Views">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`${tab.id}-panel`}
          id={`tab-${tab.id}`}
          className={`tab-pill ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onChange(tab.id)}
          title={tab.desc}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}