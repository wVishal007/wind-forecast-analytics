import { useEffect } from "react";

export default function useKeyboardShortcuts(shortcuts, deps = []) {
  useEffect(() => {
    const handler = (e) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target;
      const isInput = target.tagName === "INPUT" ||
                     target.tagName === "TEXTAREA" ||
                     target.tagName === "SELECT" ||
                     target.isContentEditable;

      if (isInput && e.key !== "Escape") return;

      const combo = [];
      if (e.ctrlKey || e.metaKey) combo.push("Ctrl");
      if (e.shiftKey) combo.push("Shift");
      if (e.altKey) combo.push("Alt");
      combo.push(e.key.toUpperCase());

      const key = combo.join("+");
      const action = shortcuts[key];

      if (action) {
        e.preventDefault();
        action(e);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts, ...deps]);
}

// Preset shortcut configurations
export const SHORTCUT_PRESETS = {
  navigation: (updateState) => ({
    "1": () => updateState({ activeTab: "overview" }),
    "2": () => updateState({ activeTab: "day-ahead" }),
    "3": () => updateState({ activeTab: "horizon" }),
    "4": () => updateState({ activeTab: "error-horizon" }),
    "ArrowLeft": () => updateState((prev) => ({
      ...prev,
      day: prev.activeTab === "day-ahead"
        ? new Date(new Date(prev.day).getTime() - 86400000).toISOString().split("T")[0]
        : prev.day,
    })),
    "ArrowRight": () => updateState((prev) => ({
      ...prev,
      day: prev.activeTab === "day-ahead"
        ? new Date(new Date(prev.day).getTime() + 86400000).toISOString().split("T")[0]
        : prev.day,
    })),
    "Shift+ArrowLeft": () => updateState((prev) => ({
      ...prev,
      range: {
        ...prev.range,
        start: new Date(new Date(prev.range.start).getTime() - 86400000).toISOString().split("T")[0],
      },
    })),
    "Shift+ArrowRight": () => updateState((prev) => ({
      ...prev,
      range: {
        ...prev.range,
        end: new Date(new Date(prev.range.end).getTime() + 86400000).toISOString().split("T")[0],
      },
    })),
    "ArrowUp": () => updateState((prev) => ({
      ...prev,
      horizon: Math.min(48, prev.horizon + 1),
    })),
    "ArrowDown": () => updateState((prev) => ({
      ...prev,
      horizon: Math.max(0, prev.horizon - 1),
    })),
    "Escape": () => {
      // Close modals, reset zoom, etc.
      document.querySelectorAll("[data-modal]").forEach((el) => el.remove());
    },
    "?": () => {
      // Toggle shortcuts modal
      const event = new CustomEvent("toggle-shortcuts");
      window.dispatchEvent(event);
    },
  }),
};