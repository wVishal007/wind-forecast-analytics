import { useState, useEffect, useCallback } from "react";

export function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage or use provided initial
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// Specialized hook for persisting UI state
export function usePersistedUIState(defaults = {}) {
  const STORAGE_KEY = "wind-monitor-ui-state";
  const [state, setState] = useLocalStorage(STORAGE_KEY, defaults);

  const updateState = useCallback((partial) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, [setState]);

  const resetState = useCallback(() => {
    setState(defaults);
  }, [setState, defaults]);

  return { state, updateState, resetState };
}