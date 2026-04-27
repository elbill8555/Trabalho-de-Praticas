import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored ? stored === 'dark' : prefersDark;
    
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
    setMounted(true);
  }, []);

  const applyTheme = (dark: boolean) => {
    const root = document.documentElement;
    
    if (dark) {
      root.style.colorScheme = 'dark';
      root.classList.add('dark-mode');
      localStorage.setItem('theme-mode', 'dark');
    } else {
      root.style.colorScheme = 'light';
      root.classList.remove('dark-mode');
      localStorage.setItem('theme-mode', 'light');
    }
  };

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    applyTheme(newDark);
  };

  return { isDark, toggleDarkMode, mounted };
}
