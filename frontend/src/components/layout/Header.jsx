import { useTheme } from "../../context/ThemeContext";
import { useAppState } from "../../context/AppStateContext";

const THEME_LABELS = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

const THEME_ICONS = {
  light: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  dark: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  system: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
};

const MENU_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const GITHUB_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const HELP_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function Header() {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();
  const { state, updateState } = useAppState();

  return (
    <header className="app-header" role="banner">
      <div className="header-left">
        <h1 className="app-title">GB Wind Forecast Monitor</h1>
        <span className="app-subtitle">National wind \u00B7 Elexon FUELHH/WINDFOR \u00B7 January 2026</span>
      </div>
      <div className="header-right">
        <div className="theme-selector" role="group" aria-label="Color theme">
          {["light", "dark", "system"].map((t) => (
            <button
              key={t}
              className={`theme-btn ${theme === t ? "active" : ""}`}
              onClick={() => setTheme(t)}
              aria-pressed={theme === t}
              title={THEME_LABELS[t]}
            >
              <span className="theme-icon" aria-hidden="true">{THEME_ICONS[t]}</span>
              <span className="theme-label">{THEME_LABELS[t]}</span>
            </button>
          ))}
        </div>
        <button
          className="icon-btn mobile-menu-btn"
          onClick={() => updateState({ sidebarCollapsed: !state.sidebarCollapsed })}
          aria-label={state.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!state.sidebarCollapsed}
        >
          {MENU_ICON}
        </button>
        <button className="icon-btn" onClick={() => window.open("https://github.com", "_blank")} aria-label="GitHub repository" title="GitHub">
          {GITHUB_ICON}
        </button>
        <button className="icon-btn" onClick={() => alert("Keyboard shortcuts: 1-4 tabs, \u2190/\u2192 day, \u2191/\u2193 horizon, ? help")} aria-label="Keyboard shortcuts" title="Shortcuts">
          {HELP_ICON}
        </button>
      </div>
    </header>
  );
}
