"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
  accentColor: string
  setAccentColor: (color: string) => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")
  const [accentColor, setAccentColor] = useState<string>("#1677ff")

  // Load theme and accent color from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("chat-app-theme") as Theme
    const savedAccentColor = localStorage.getItem("chat-app-accent-color") as string
    
    if (savedTheme) {
      setTheme(savedTheme)
    }
    if (savedAccentColor) {
      setAccentColor(savedAccentColor)
    }
  }, [])

  // Update resolved theme based on current theme
  useEffect(() => {
    setResolvedTheme(theme);
  }, [theme])

  // Apply theme to document
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    // Chỉ cập nhật nếu theme thực sự khác với theme hiện tại
    if (currentTheme !== resolvedTheme) {
      document.documentElement.setAttribute("data-theme", resolvedTheme);
    }
    localStorage.setItem("chat-app-theme", theme);
  }, [theme, resolvedTheme])

  // Apply accent color to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Convert hex color to RGB for CSS variables
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    const rgb = hexToRgb(accentColor);
    if (rgb) {
      root.style.setProperty('--accent-primary', accentColor);
      root.style.setProperty('--accent-secondary', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
      root.style.setProperty('--accent-secondary-dark', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);
    }
    
    localStorage.setItem("chat-app-accent-color", accentColor);
  }, [accentColor])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  const handleSetAccentColor = (newAccentColor: string) => {
    setAccentColor(newAccentColor)
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme: handleSetTheme, 
      resolvedTheme,
      accentColor,
      setAccentColor: handleSetAccentColor
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
