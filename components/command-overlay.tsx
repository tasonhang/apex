"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useApex } from "@/contexts/apex-context"
import { cn } from "@/lib/utils"

export function CommandOverlay() {
  const { state, lastCommand, lastResponse } = useApex()
  
  return (
    <AnimatePresence>
      {(lastCommand || lastResponse) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4"
        >
          <div className="rounded-xl bg-card/80 backdrop-blur-md border border-border shadow-lg overflow-hidden">
            {lastCommand && (
              <div className="px-4 py-3 border-b border-border/50">
                <p className="text-xs text-muted-foreground mb-1">You said:</p>
                <p className="text-sm font-medium text-foreground">{lastCommand}</p>
              </div>
            )}
            {lastResponse && (
              <div className="px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">APEX:</p>
                <p className={cn(
                  "text-sm text-foreground",
                  state === "speaking" && "animate-pulse"
                )}>
                  {lastResponse}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
