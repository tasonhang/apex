"use client"

import { useEffect, useState } from "react"
import { ApexProvider, useApex } from "@/contexts/apex-context"
import { ApexSphere } from "@/components/apex-sphere"
import { ApexSidebar } from "@/components/apex-sidebar"
import { CommandOverlay } from "@/components/command-overlay"
import { useVoice } from "@/hooks/use-voice"
import { Button } from "@/components/ui/button"
import { Menu, X, Keyboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { MicPermissionModal } from "@/components/mic-permission-modal"

function ApexDashboard() {
  const { state, isSidebarOpen, toggleSidebar } = useApex()
  const { isSupported, error, startListening, stopListening, manualCommand } = useVoice()
  const [isListening, setIsListening] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualInput, setManualInput] = useState("")
  const [showPermissionModal, setShowPermissionModal] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)

  // Check if we already have permission on mount
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.permissions) {
      navigator.permissions.query({ name: "microphone" as PermissionName }).then((result) => {
        if (result.state === "granted") {
          setShowPermissionModal(false)
          setHasPermission(true)
        }
      }).catch(() => {
        // Permissions API not supported, show modal
      })
    }
  }, [])

  // Start listening after permission is granted
  useEffect(() => {
    if (hasPermission && isSupported) {
      startListening()
      setIsListening(true)
    }
  }, [hasPermission, isSupported, startListening])

  const handlePermissionGranted = () => {
    setShowPermissionModal(false)
    setHasPermission(true)
  }

  const handlePermissionDenied = () => {
    setShowPermissionModal(false)
    // User can still use manual input
  }

  const handleToggleListening = () => {
    if (isListening) {
      stopListening()
      setIsListening(false)
    } else {
      startListening()
      setIsListening(true)
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
      {/* Microphone Permission Modal */}
      {showPermissionModal && (
        <MicPermissionModal
          onPermissionGranted={handlePermissionGranted}
          onPermissionDenied={handlePermissionDenied}
        />
      )}

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
              onStartListening={() => {
                startListening()
                setIsListening(true)
              }}
              onStopListening={() => {
                stopListening()
                setIsListening(false)
              }}
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

        {/* Manual Input Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowManualInput(!showManualInput)}
          className="absolute top-4 right-4 z-10"
        >
          <Keyboard className="h-5 w-5" />
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

        {/* Error Message */}
        {error && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        {/* 3D Sphere */}
        <div className="w-full h-full max-w-2xl max-h-2xl">
          <ApexSphere state={state} className="w-full h-full" />
        </div>

        {/* Manual Input */}
        <AnimatePresence>
          {showManualInput && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4"
            >
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <Input
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Type a command..."
                  className="flex-1 bg-card/80 backdrop-blur-sm"
                  autoFocus
                />
                <Button type="submit">Send</Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Command Overlay */}
        <CommandOverlay />

        {/* Help Text */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <p className="text-xs text-muted-foreground">
            {isListening 
              ? 'Say "Wake up" to start a voice command' 
              : "Click the microphone icon to enable voice commands"
            }
          </p>
        </div>
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
