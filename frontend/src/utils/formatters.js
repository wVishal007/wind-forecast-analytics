// Date and time formatting utilities for Europe/London timezone

const LONDON_TZ = "Europe/London";

export function formatTime(iso) {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: LONDON_TZ,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatClock(iso) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    timeZone: LONDON_TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    timeZone: LONDON_TZ,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatHorizon(h) {
  return `${h}h ahead`;
}

export function formatNumber(n, options = {}) {
  if (n == null) return "—";
  const { decimals = 0, compact = false } = options;
  if (compact && Math.abs(n) >= 1000) {
    return new Intl.NumberFormat("en-GB", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  }
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatError(value) {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)} MW`;
}

export function formatPercent(value, total) {
  if (value == null || total == null || total === 0) return "—";
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function getErrorColorClass(value) {
  if (value == null) return "";
  if (value > 50) return "positive";   // Over-forecast
  if (value < -50) return "negative";  // Under-forecast
  return "neutral";
}

export function getBiasBadgeClass(bias) {
  if (bias == null) return "neutral";
  if (bias > 50) return "positive";    // Over-forecast (bad for buyer)
  if (bias < -50) return "negative";   // Under-forecast (good for buyer)
  return "neutral";
}

// London date helpers
export function getLondonDate(date) {
  return new Date(date).toLocaleDateString("en-CA", { timeZone: LONDON_TZ }); // YYYY-MM-DD
}

export function getLondonDateTime(date) {
  return new Date(date).toLocaleString("en-GB", {
    timeZone: LONDON_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).replace(",", "");
}

export function startOfDayLondon(date) {
  const d = new Date(date);
  // Get midnight in London, then convert to UTC
  const londonMidnight = new Date(d.toLocaleString("en-GB", {
    timeZone: LONDON_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "0",
    minute: "0",
    second: "0",
    hour12: false,
  }));
  return londonMidnight;
}

export function endOfDayLondon(date) {
  const d = new Date(date);
  const londonEnd = new Date(d.toLocaleString("en-GB", {
    timeZone: LONDON_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "23",
    minute: "59",
    second: "59",
    hour12: false,
  }));
  return londonEnd;
}

// Check if date is within January 2026
export function isInJanuary2026(date) {
  const d = new Date(date);
  const londonDate = new Date(d.toLocaleString("en-GB", { timeZone: LONDON_TZ }));
  return londonDate >= new Date("2026-01-01") && londonDate < new Date("2026-02-01");
}

// Parse date string as London local date
export function parseLondonDate(dateStr) {
  // dateStr is YYYY-MM-DD
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}