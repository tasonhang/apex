"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type ApexState = "idle" | "listening" | "speaking"

interface ApexContextValue {
  assistantName: string
  setAssistantName: (name: string) => void
  state: ApexState
  setState: (state: ApexState) => void
  isSidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  lastCommand: string | null
  setLastCommand: (command: string | null) => void
  lastResponse: string | null
  setLastResponse: (response: string | null) => void
}

const ApexContext = createContext<ApexContextValue | null>(null)

export function ApexProvider({ children }: { children: ReactNode }) {
  const [assistantName, setAssistantName] = useState("APEX")
  const [state, setState] = useState<ApexState>("idle")
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<string | null>(null)
  
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])
  
  return (
    <ApexContext.Provider
      value={{
        assistantName,
        setAssistantName,
        state,
        setState,
        isSidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        lastCommand,
        setLastCommand,
        lastResponse,
        setLastResponse,
      }}
    >
      {children}
    </ApexContext.Provider>
  )
}

export function useApex() {
  const context = useContext(ApexContext)
  if (!context) {
    throw new Error("useApex must be used within an ApexProvider")
  }
  return context
}
