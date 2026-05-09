"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, AlertCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MicPermissionModalProps {
  onPermissionGranted: () => void
  onPermissionDenied: () => void
}

export function MicPermissionModal({ 
  onPermissionGranted, 
  onPermissionDenied 
}: MicPermissionModalProps) {
  const [isRequesting, setIsRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInIframe, setIsInIframe] = useState(false)

  // Check if we're in an iframe on mount
  useEffect(() => {
    try {
      setIsInIframe(window !== window.top)
    } catch {
      // Cross-origin iframe - we're definitely in an iframe
      setIsInIframe(true)
    }
  }, [])

  const requestMicPermission = async () => {
    setIsRequesting(true)
    setError(null)

    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Your browser doesn't support microphone access. Please use Chrome or Safari.")
        setIsRequesting(false)
        return
      }

      // Request microphone access - this triggers the browser's permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Verify we got audio tracks
      const audioTracks = stream.getAudioTracks()
      
      if (audioTracks.length === 0) {
        setError("No audio track found. Please check your microphone connection.")
        setIsRequesting(false)
        return
      }
      
      // Stop the stream immediately - we just needed to trigger the permission
      stream.getTracks().forEach(track => track.stop())
      
      onPermissionGranted()
    } catch (err) {
      if (err instanceof Error) {
        
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          // Check if we're in an iframe (like v0 preview)
          const isInIframe = window !== window.top
          if (isInIframe) {
            setError("Microphone access is blocked in this preview. Please open the app in a new tab by clicking 'Open in new tab' (top-right corner) to use voice commands.")
          } else {
            setError("Microphone access was denied. Please go to your browser settings, allow microphone access for this site, then reload the page.")
          }
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setError("No microphone found. Please connect a microphone and try again.")
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setError("Microphone is in use by another application. Please close other apps using the mic and try again.")
        } else if (err.name === "OverconstrainedError") {
          setError("Microphone doesn't meet requirements. Please try a different microphone.")
        } else if (err.name === "SecurityError") {
          setError("Microphone access blocked due to security settings. Please use HTTPS or localhost.")
        } else {
          setError(`Failed to access microphone: ${err.message}. Please check your browser settings.`)
        }
      } else {
        setError("An unknown error occurred. Please try again or use text input.")
      }
      
      setIsRequesting(false)
    }
  }

  const handleSkip = () => {
    onPermissionDenied()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl"
        >
          {/* Animated Mic Icon */}
          <div className="mb-6 flex justify-center">
            <div className={cn(
              "relative flex h-24 w-24 items-center justify-center rounded-full",
              "bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
            )}>
              <motion.div
                animate={isRequesting ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-full",
                  "bg-gradient-to-br from-blue-500 to-cyan-500"
                )}
              >
                <Mic className="h-8 w-8 text-white" />
              </motion.div>
              
              {/* Pulse rings */}
              {isRequesting && (
                <>
                  <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 rounded-full bg-blue-500/30"
                  />
                  <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                    className="absolute inset-0 rounded-full bg-cyan-500/30"
                  />
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
            Enable Voice Commands
          </h2>

          {/* Description */}
          <p className="mb-6 text-center text-muted-foreground">
            APEX uses your microphone to listen for voice commands. 
            Allow microphone access to get started with hands-free control.
          </p>

          {/* Iframe Warning */}
          {isInIframe && !error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-200"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <p className="font-medium text-amber-100">Preview Mode Detected</p>
                <p className="mt-1 text-amber-200/80">Voice commands may not work in this preview. For full voice functionality, open the app in a new tab.</p>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={requestMicPermission}
              disabled={isRequesting}
              className="h-12 w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
            >
              {isRequesting ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                  />
                  Requesting Access...
                </span>
              ) : error ? (
                <span className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Try Again
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Allow Microphone Access
                </span>
              )}
            </Button>

            {isInIframe && (
              <Button
                variant="outline"
                onClick={() => window.open(window.location.href, '_blank')}
                className="h-12 w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in New Tab
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={handleSkip}
              className="h-12 w-full text-muted-foreground hover:text-foreground"
            >
              <MicOff className="mr-2 h-4 w-4" />
              Skip for Now (Use Text Input)
            </Button>
          </div>

          {/* Privacy Note */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Your voice is processed locally and never stored. 
            You can change permissions anytime in browser settings.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
