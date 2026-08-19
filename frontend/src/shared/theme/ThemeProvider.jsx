import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => window.localStorage.getItem('nova_theme') || 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', theme === 'light');
    window.localStorage.setItem('nova_theme', theme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    isLight: theme === 'light',
    toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark'),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
