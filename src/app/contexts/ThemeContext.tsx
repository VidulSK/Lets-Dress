import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Key used in localStorage so the theme survives page refresh
const STORAGE_KEY = 'lets-dress-theme';

function applyTheme(t: Theme) {
  document.documentElement.setAttribute('data-theme', t);
  if (t === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [theme, setTheme] = useState<Theme>(() => {
    // 1. Try localStorage first (persists across refresh, works for guests too)
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;

    // 2. Fall back to current HTML attribute (set by server or previous session)
    const attr = document.documentElement.getAttribute('data-theme') as Theme | null;
    if (attr === 'light' || attr === 'dark') return attr;

    // 3. Last resort: system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Apply theme classes whenever theme changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // If a logged-in user has a server-side preference AND no local override was
  // made in this session, sync to the server preference. We only do this once
  // when the user first loads with a fresh localStorage (i.e. no stored key yet).
  useEffect(() => {
    if (user?.theme) {
      // Only use server theme if there's no local override already set
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setTheme(user.theme as Theme);
      }
    }
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    // Also persist to server for logged-in users
    fetch('/api/auth/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: newTheme }),
    }).catch(console.error);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
