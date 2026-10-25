import { useAppState } from "../../context/AppStateContext";

export default function StatusBar() {
  const { state } = useAppState();

  return (
    <footer className="app-statusbar" role="contentinfo" aria-label="Status information">
      <div className="status-item">
        <span className="status-label">Data:</span>
        <span className="status-value">January 2026 (fixed)</span>
      </div>
      <div className="status-item">
        <span className="status-label">Timezone:</span>
        <span className="status-value">Europe/London</span>
      </div>
      <div className="status-item">
        <span className="status-label">View:</span>
        <span className="status-value">{state.activeTab.replace("-", " ")}</span>
      </div>
      <div className="status-item status-version">
        v0.1.0
      </div>
    </footer>
  );
}
