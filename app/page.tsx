"use client"

import { useState } from "react"
import { ApexProvider, useApex } from "@/contexts/apex-context"
import { ApexSphere } from "@/components/apex-sphere"
import { ApexSidebar } from "@/components/apex-sidebar"
import { CommandOverlay } from "@/components/command-overlay"
import { MicButton } from "@/components/mic-button"
import { useVoice } from "@/hooks/use-voice"
import { Button } from "@/components/ui/button"
import { Menu, X, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"

function ApexDashboard() {
  const { state, isSidebarOpen, toggleSidebar } = useApex()
  const { isSupported, isSafariMobile, isListening, startListening, stopListening, manualCommand } = useVoice()
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualInput, setManualInput] = useState("")

  const handleMicTap = async () => {
    if (isListening) {
      stopListening()
    } else {
      await startListening()
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim()) {
      manualCommand(manualInput.trim())
      setManualInput("")
      setShowManualInput(false)
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative z-20"
          >
            <ApexSidebar
              onStartListening={startListening}
              onStopListening={stopListening}
              isListening={isListening}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col items-center justify-center">
        {/* Toggle Sidebar Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute top-4 left-4 z-10"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Status Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 rounded-full bg-card/80 backdrop-blur-sm px-4 py-2 border border-border">
            <div className={cn(
              "h-2 w-2 rounded-full",
              state === "idle" && "bg-blue-500",
              state === "listening" && "bg-green-500 animate-pulse",
              state === "speaking" && "bg-amber-500 animate-pulse"
            )} />
            <span className="text-sm font-medium text-foreground capitalize">{state}</span>
          </div>
        </div>

        {/* 3D Sphere */}
        <div className="w-full h-full max-w-2xl max-h-2xl flex items-center justify-center">
          <ApexSphere state={state} className="w-full h-full" />
        </div>

        {/* Mic Button - positioned below sphere */}
        {isSupported && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
            <MicButton
              isListening={isListening}
              onTap={handleMicTap}
              state={state}
            />
          </div>
        )}

        {/* Text Input Toggle and Quick Actions */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
          <AnimatePresence>
            {showManualInput ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="rounded-2xl border border-border bg-card/90 backdrop-blur-sm p-4 shadow-lg"
              >
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <Input
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Type a command (e.g., 'show my leads')..."
                    className="flex-1 h-12 bg-background/50 border-border/50 text-base"
                    autoFocus
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["Show leads", "My schedule", "Messages", "Properties", "Deals"].map((cmd) => (
                    <button
                      key={cmd}
                      type="button"
                      onClick={() => {
                        manualCommand(cmd)
                        setShowManualInput(false)
                      }}
                      className="text-xs px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <button
                  onClick={() => setShowManualInput(true)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                  Or type a command
                </button>
                {isSafariMobile && (
                  <p className="text-xs text-muted-foreground text-center">
                    Tap the mic button and speak your command
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Command Overlay */}
        <CommandOverlay />
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <ApexProvider>
      <ApexDashboard />
    </ApexProvider>
  )
}
