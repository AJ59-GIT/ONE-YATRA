
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('oneyatra_theme');
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oneyatra_high_contrast') === 'true';
    }
    return false;
  });

  // Apply theme class to HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Apply high contrast class
  useEffect(() => {
    const root = window.document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('oneyatra_high_contrast', String(highContrast));
  }, [highContrast]);

  // Listen for system theme changes ONLY if user hasn't set a preference
  useEffect(() => {
    const stored = localStorage.getItem('oneyatra_theme');
    if (stored) return; // User has preference, ignore system changes

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Double check storage hasn't been set since effect start
      if (!localStorage.getItem('oneyatra_theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('oneyatra_theme', newTheme);
      return newTheme;
    });
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  return { theme, toggleTheme, highContrast, toggleHighContrast };
};
