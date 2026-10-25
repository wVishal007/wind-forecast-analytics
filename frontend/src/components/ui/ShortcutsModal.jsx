import { useEffect, useState } from "react";
import React from "react";

const SHORTCUT_GROUPS = [
  {
    title: "Navigation",
    shortcuts: [
      { key: "1", desc: "Overview tab" },
      { key: "2", desc: "Day-Ahead tab" },
      { key: "3", desc: "Horizon Explorer tab" },
      { key: "4", desc: "Error vs Horizon tab" },
    ],
  },
  {
    title: "Day-Ahead View",
    shortcuts: [
      { key: "← / →", desc: "Previous / Next delivery day" },
    ],
  },
  {
    title: "Horizon Explorer",
    shortcuts: [
      { key: "Shift+← / Shift+→", desc: "Adjust range start / end" },
      { key: "↑ / ↓", desc: "Increase / Decrease forecast horizon" },
    ],
  },
  {
    title: "General",
    shortcuts: [
      { key: "Esc", desc: "Close modals, reset chart zoom" },
      { key: "?", desc: "Show this help" },
    ],
  },
];

export default function ShortcutsModal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="modal-overlay" data-modal="shortcuts" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" id="shortcuts-title">Keyboard Shortcuts</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close shortcuts help">
            ✕
          </button>
        </div>
        <div className="modal-body">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} className="shortcut-group">
              <h3 className="shortcut-group-title">{group.title}</h3>
              <div className="shortcut-list">
                {group.shortcuts.map((s) => (
                  <React.Fragment key={s.key}>
                    <kbd className="shortcut-key">{s.key}</kbd>
                    <span className="shortcut-desc">{s.desc}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}