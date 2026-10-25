import { useTheme } from "../../context/ThemeContext";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: "☀️" },
  { value: "dark", label: "Dark", icon: "🌙" },
  { value: "system", label: "System", icon: "💻" },
];

export default function ThemeToggle({ showLabel = false, className = "" }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`theme-toggle ${className}`} role="group" aria-label="Color theme">
      {THEME_OPTIONS.map((option) => (
        <button
          key={option.value}
          className={`theme-toggle-btn ${theme === option.value ? "active" : ""}`}
          onClick={() => setTheme(option.value)}
          aria-pressed={theme === option.value}
          title={option.label}
        >
          <span className="theme-toggle-icon" aria-hidden="true">{option.icon}</span>
          {showLabel && <span className="theme-toggle-label">{option.label}</span>}
        </button>
      ))}
    </div>
  );
}