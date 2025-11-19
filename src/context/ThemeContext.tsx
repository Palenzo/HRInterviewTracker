import React, { createContext, useContext, useEffect } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

type Theme = 'light'

type ThemeContextType = {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Force light theme only
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggle: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
