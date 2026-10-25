import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AppStateContext = createContext(null);

const STORAGE_KEY = "wind-monitor-ui-state";

const DEFAULT_STATE = {
  activeTab: "overview",           // overview | day-ahead | horizon | error-horizon
  day: "2026-01-15",               // Delivery day for day-ahead view
  range: { start: "2026-01-10", end: "2026-01-16" },  // Date range for horizon explorer
  horizon: 24,                     // Forecast horizon in hours (0-48)
  sidebarCollapsed: false,         // Sidebar collapsed state
};

export function AppStateProvider({ children }) {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_STATE;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_STATE, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn("Failed to parse UI state from localStorage", e);
    }
    return DEFAULT_STATE;
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to persist UI state", e);
    }
  }, [state]);

  // Sync with URL (for shareable links)
  useEffect(() => {
    const params = new URLSearchParams();
    if (state.activeTab !== "overview") params.set("tab", state.activeTab);
    if (state.activeTab === "day-ahead") params.set("day", state.day);
    if (state.activeTab === "horizon") {
      params.set("start", state.range.start);
      params.set("end", state.range.end);
      params.set("horizon", state.horizon.toString());
    }
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    window.history.replaceState(null, "", newUrl);
  }, [state]);

  // Restore from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["overview", "day-ahead", "horizon", "error-horizon"].includes(tab)) {
      setState((prev) => ({
        ...prev,
        activeTab: tab,
        day: params.get("day") || prev.day,
        range: {
          start: params.get("start") || prev.range.start,
          end: params.get("end") || prev.range.end,
        },
        horizon: params.get("horizon") ? parseInt(params.get("horizon"), 10) : prev.horizon,
      }));
    }
  }, []);

  const updateState = useCallback((partial) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetState = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  return (
    <AppStateContext.Provider value={{ state, updateState, resetState }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}