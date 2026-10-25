import { useEffect, useState, useRef } from "react";
import { formatNumber } from "../../utils/formatters";
import { getBiasBadgeClass } from "../../utils/formatters";

export function AnimatedMetricCard({
  label,
  value,
  unit = "MW",
  desc,
  showBadge = false,
  badgeValue = null,
  className = "",
  duration = 600,
  delay = 0,
}) {
  const badgeClass = showBadge ? getBiasBadgeClass(badgeValue) : "neutral";
  const badgeText = showBadge
    ? badgeValue > 50
      ? "Over-forecast"
      : badgeValue < -50
      ? "Under-forecast"
      : "Neutral"
    : null;

  const [displayValue, setDisplayValue] = useState(null);
  const [showBadgeState, setShowBadgeState] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (value == null) {
      setDisplayValue(null);
      return;
    }

    const target = value;
    const start = 0;
    startTimeRef.current = performance.now();

    const animate = (now) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [value, duration, delay]);

  useEffect(() => {
    if (showBadge && badgeText) {
      const timer = setTimeout(() => setShowBadgeState(true), delay + duration * 0.5);
      return () => clearTimeout(timer);
    }
  }, [showBadge, badgeText, delay, duration]);

  useEffect(() => {
    if (desc) {
      const timer = setTimeout(() => setShowDesc(true), delay + duration * 0.7);
      return () => clearTimeout(timer);
    }
  }, [desc, delay, duration]);

  return (
    <article className={`metric-card ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <header className="metric-header">
        <span className="metric-label">{label}</span>
        {showBadgeState && badgeText && (
          <span className={`metric-badge ${badgeClass}`} style={{ animation: "fadeIn var(--transition-fast) ease-out" }}>
            {badgeText}
          </span>
        )}
      </header>
      <div className="metric-value">
        {displayValue != null ? formatNumber(displayValue) : value != null ? formatNumber(value) : "\u2014"}
        <span className="metric-unit">{unit}</span>
      </div>
      {showDesc && desc && (
        <p className="metric-desc" style={{ animation: "fadeIn var(--transition-normal) ease-out" }}>
          {desc}
        </p>
      )}
    </article>
  );
}

export function MetricCard({
  label,
  value,
  unit = "MW",
  desc,
  showBadge = false,
  badgeValue = null,
  className = "",
}) {
  const badgeClass = showBadge ? getBiasBadgeClass(badgeValue) : "neutral";
  const badgeText = showBadge
    ? badgeValue > 50
      ? "Over-forecast"
      : badgeValue < -50
      ? "Under-forecast"
      : "Neutral"
    : null;

  return (
    <article className={`metric-card ${className}`}>
      <header className="metric-header">
        <span className="metric-label">{label}</span>
        {showBadge && badgeText && (
          <span className={`metric-badge ${badgeClass}`}>{badgeText}</span>
        )}
      </header>
      <div className="metric-value">
        {value != null ? formatNumber(value) : "\u2014"}
        <span className="metric-unit">{unit}</span>
      </div>
      {desc && <p className="metric-desc">{desc}</p>}
    </article>
  );
}
