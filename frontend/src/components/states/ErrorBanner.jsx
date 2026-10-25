import { useState } from "react";

export default function ErrorBanner({ message, onRetry, details, className = "" }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`error-banner ${className}`} role="alert" aria-live="assertive">
      <div className="error-content">
        <span className="error-icon" aria-hidden="true">⚠️</span>
        <div className="error-text">
          <strong>Could not load data</strong>
          <p>{message}</p>
        </div>
      </div>
      <div className="error-actions">
        {onRetry && (
          <button className="error-btn error-btn-primary" onClick={onRetry}>
            🔄 Retry
          </button>
        )}
        {details && (
          <button
            className="error-btn error-btn-secondary"
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
          >
            {showDetails ? "Hide details" : "Show details"}
          </button>
        )}
      </div>
      {showDetails && details && (
        <details className="error-details" open>
          <summary>Technical details</summary>
          <pre>{details}</pre>
        </details>
      )}
    </div>
  );
}