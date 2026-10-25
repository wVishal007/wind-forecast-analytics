import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "system";
    return localStorage.getItem("theme") || "system";
  });
  const [resolvedTheme, setResolvedTheme] = useState("light");

  // Resolve system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        setResolvedTheme(mediaQuery.matches ? "dark" : "light");
      }
    };
    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const resolved = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    setResolvedTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  }, []);

  const setExplicitTheme = useCallback((newTheme) => {
    if (["light", "dark", "system"].includes(newTheme)) {
      setTheme(newTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme: setExplicitTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}