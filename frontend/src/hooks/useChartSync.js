import { useRef, useCallback, useEffect } from "react";

// Shared crosshair state for synchronized charts
const crosshairState = {
  active: false,
  xValue: null,
  subscribers: new Set(),
};

export function useChartSync(chartId) {
  const subscribe = useCallback((callback) => {
    crosshairState.subscribers.add(callback);
    return () => crosshairState.subscribers.delete(callback);
  }, []);

  const setCrosshair = useCallback((active, xValue) => {
    crosshairState.active = active;
    crosshairState.xValue = xValue;
    crosshairState.subscribers.forEach((cb) => cb(active, xValue));
  }, []);

  const getCrosshair = useCallback(() => ({
    active: crosshairState.active,
    xValue: crosshairState.xValue,
  }), []);

  return { subscribe, setCrosshair, getCrosshair };
}

// Hook for managing chart zoom/pan state
export function useChartZoom(initialDomain = null) {
  const [domain, setDomain] = useState(initialDomain);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleZoom = useCallback((newDomain) => {
    if (!newDomain) {
      setDomain(initialDomain);
      setIsZoomed(false);
    } else {
      setDomain(newDomain);
      setIsZoomed(true);
    }
  }, [initialDomain]);

  const resetZoom = useCallback(() => {
    setDomain(initialDomain);
    setIsZoomed(false);
  }, [initialDomain]);

  return { domain, isZoomed, handleZoom, resetZoom };
}

import { useState } from "react";