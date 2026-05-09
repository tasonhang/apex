"use client"

import { motion } from "framer-motion"
import { Mic, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface MicButtonProps {
  isListening: boolean
  onTap: () => void
  state: "idle" | "listening" | "speaking"
  className?: string
}

export function MicButton({ isListening, onTap, state, className }: MicButtonProps) {
  const isActive = isListening || state === "listening" || state === "speaking"
  
  return (
    <div className={cn("relative", className)}>
      {/* Outer pulse ring - only visible when listening */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ 
            scale: [1, 1.5, 1.8],
            opacity: [0.6, 0.3, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
          style={{
            background: state === "speaking" 
              ? "radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(34,197,94,0.4) 0%, transparent 70%)"
          }}
        />
      )}
      
      {/* Middle pulse ring */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ scale: 1, opacity: 0.4 }}
          animate={{ 
            scale: [1, 1.3, 1.5],
            opacity: [0.4, 0.2, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.3
          }}
          style={{
            background: state === "speaking"
              ? "radial-gradient(circle, rgba(251,191,36,0.5) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(34,197,94,0.5) 0%, transparent 70%)"
          }}
        />
      )}
      
      {/* Main button */}
      <motion.button
        onClick={onTap}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative z-10 flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300",
          "border-2 shadow-lg",
          isActive
            ? state === "speaking"
              ? "border-amber-500/50 bg-amber-500/20 text-amber-400 shadow-amber-500/25"
              : "border-green-500/50 bg-green-500/20 text-green-400 shadow-green-500/25"
            : "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/20 hover:shadow-blue-500/25"
        )}
      >
        {/* Inner glow */}
        {isActive && (
          <motion.div
            className="absolute inset-2 rounded-full"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [0.95, 1, 0.95]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: state === "speaking"
                ? "radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)"
            }}
          />
        )}
        
        {/* Icon */}
        <motion.div
          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {isListening ? (
            <Mic className="h-8 w-8" />
          ) : (
            <MicOff className="h-8 w-8" />
          )}
        </motion.div>
      </motion.button>
      
      {/* Status label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "mt-3 text-center text-sm font-medium",
          isActive
            ? state === "speaking"
              ? "text-amber-400"
              : "text-green-400"
            : "text-muted-foreground"
        )}
      >
        {state === "speaking" 
          ? "Speaking..." 
          : isListening 
            ? "Listening..." 
            : "Tap to speak"
        }
      </motion.p>
    </div>
  )
}
