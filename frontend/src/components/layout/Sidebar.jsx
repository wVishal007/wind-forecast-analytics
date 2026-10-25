import { useAppState } from "../../context/AppStateContext";

const TABS = [
  { id: "overview", label: "Overview", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ), desc: "January accuracy summary" },
  { id: "day-ahead", label: "Day-Ahead", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ), desc: "Gate closure forecast vs actual" },
  { id: "horizon", label: "Horizon Explorer", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ), desc: "Range + forecast horizon" },
  { id: "error-horizon", label: "Error vs Horizon", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="23" y1="4" x2="1" y2="20" />
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
    </svg>
  ), desc: "MAE/P90 across 0-48h" },
];

export default function Sidebar() {
  const { state, updateState } = useAppState();
  const isCollapsed = state.sidebarCollapsed;

  const handleTabClick = (tabId) => {
    updateState({ activeTab: tabId });
  };

  const handleKeyDown = (e, tabId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTabClick(tabId);
    }
  };

  return (
    <aside
      className={`app-sidebar ${isCollapsed ? "collapsed" : ""}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <nav className="sidebar-nav">
        <ul role="tablist" aria-label="Views">
          {TABS.map((tab) => (
            <li key={tab.id} role="presentation">
              <button
                role="tab"
                aria-selected={state.activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                id={`tab-${tab.id}`}
                className={`nav-tab ${state.activeTab === tab.id ? "active" : ""}`}
                onClick={() => handleTabClick(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, tab.id)}
                title={isCollapsed ? `${tab.label}: ${tab.desc}` : ""}
              >
                <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
                {!isCollapsed && <span className="tab-label">{tab.label}</span>}
              </button>
            </li>
          ))}
        </ul>

        {!isCollapsed && (
          <>
            <div className="sidebar-divider" />
            <div className="sidebar-section">
              <h3 className="sidebar-section-title">Data Scope</h3>
              <ul className="scope-list">
                <li>National GB wind only</li>
                <li>January 2026</li>
                <li>Elexon FUELHH (actuals)</li>
                <li>Elexon WINDFOR (forecasts)</li>
              </ul>
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}
