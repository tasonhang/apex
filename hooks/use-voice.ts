"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useApex } from "@/contexts/apex-context"

interface UseVoiceOptions {
  wakeWord?: string
  onCommand?: (command: string) => void
}

export function useVoice({ wakeWord = "wake up", onCommand }: UseVoiceOptions = {}) {
  const { state, setState, setLastCommand, setLastResponse } = useApex()
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isListeningForCommandRef = useRef(false)
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return
    
    console.log("[v0] Initializing speech recognition...")
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.log("[v0] Speech recognition not supported")
      setError("Speech recognition is not supported in this browser. Try Chrome or Safari.")
      return
    }
    
    console.log("[v0] Speech recognition API found:", SpeechRecognition.name || "webkitSpeechRecognition")
    setIsSupported(true)
    synthRef.current = window.speechSynthesis
    
    const recognition = new SpeechRecognition()
    // Safari works better with continuous = false and manual restarts
    recognition.continuous = true
    recognition.interimResults = true // Enable interim results for better responsiveness
    recognition.lang = "en-US"
    recognition.maxAlternatives = 1
    
    recognition.onstart = () => {
      console.log("[v0] Speech recognition started successfully")
    }
    
    recognition.onaudiostart = () => {
      console.log("[v0] Audio capture started - microphone is working")
    }
    
    recognition.onspeechstart = () => {
      console.log("[v0] Speech detected")
    }
    
    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1]
      console.log("[v0] Recognition result:", lastResult[0].transcript, "isFinal:", lastResult.isFinal)
      
      if (!lastResult.isFinal) return
      
      const transcript = lastResult[0].transcript.toLowerCase().trim()
      console.log("[v0] Final transcript:", transcript)
      
      if (!isListeningForCommandRef.current) {
        // Check for wake word
        if (transcript.includes(wakeWord.toLowerCase())) {
          console.log("[v0] Wake word detected!")
          isListeningForCommandRef.current = true
          setState("listening")
          speak("Yes, I'm listening")
        }
      } else {
        // Process command
        console.log("[v0] Processing command:", transcript)
        isListeningForCommandRef.current = false
        setLastCommand(transcript)
        processCommand(transcript)
      }
    }
    
    recognition.onerror = (event) => {
      console.error("[v0] Speech recognition error:", event.error, event)
      
      // Handle specific errors
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please allow microphone access in your browser settings and reload the page.")
      } else if (event.error === "no-speech") {
        // This is normal - just means no speech was detected, don't show error
        console.log("[v0] No speech detected, continuing to listen...")
      } else if (event.error === "network") {
        setError("Network error. Speech recognition requires an internet connection.")
      } else if (event.error === "audio-capture") {
        setError("No microphone found. Please connect a microphone.")
      } else if (event.error === "aborted") {
        console.log("[v0] Recognition aborted")
      } else {
        setError(`Speech recognition error: ${event.error}`)
      }
    }
    
    recognition.onend = () => {
      console.log("[v0] Speech recognition ended, attempting restart...")
      // Restart recognition to keep listening
      if (recognitionRef.current && state !== "speaking") {
        // Small delay before restart to prevent rapid cycling
        setTimeout(() => {
          try {
            recognitionRef.current?.start()
            console.log("[v0] Recognition restarted")
          } catch (e) {
            console.log("[v0] Could not restart recognition:", e)
          }
        }, 100)
      }
    }
    
    recognitionRef.current = recognition
    
    return () => {
      console.log("[v0] Cleaning up speech recognition")
      recognition.stop()
    }
  }, [wakeWord, setState, setLastCommand])
  
  const speak = useCallback((text: string) => {
    if (!synthRef.current) return
    
    setState("speaking")
    setLastResponse(text)
    
    // Cancel any ongoing speech
    synthRef.current.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1
    
    utterance.onend = () => {
      setState("idle")
    }
    
    utterance.onerror = () => {
      setState("idle")
    }
    
    synthRef.current.speak(utterance)
  }, [setState, setLastResponse])
  
  const processCommand = useCallback((command: string) => {
    // Mock command processing - will be replaced with AI later
    const lowerCommand = command.toLowerCase()
    
    if (onCommand) {
      onCommand(command)
    }
    
    // Simple mock responses
    if (lowerCommand.includes("lead") || lowerCommand.includes("leads")) {
      speak("You have 12 active leads. The most recent is John Smith, who inquired about a property in downtown.")
    } else if (lowerCommand.includes("schedule") || lowerCommand.includes("calendar") || lowerCommand.includes("appointment")) {
      speak("You have 3 appointments today. The next one is at 2 PM with Sarah Johnson for a property viewing.")
    } else if (lowerCommand.includes("message") || lowerCommand.includes("messages")) {
      speak("You have 5 unread messages. Would you like me to read them?")
    } else if (lowerCommand.includes("property") || lowerCommand.includes("properties") || lowerCommand.includes("listing")) {
      speak("You have 8 active listings. The most viewed property is the 3 bedroom house on Oak Street.")
    } else if (lowerCommand.includes("deal") || lowerCommand.includes("deals")) {
      speak("You have 4 deals in progress. 2 are pending closing this week.")
    } else if (lowerCommand.includes("help")) {
      speak("I can help you with leads, schedules, messages, properties, and deals. Just say wake up and then your command.")
    } else if (lowerCommand.includes("hello") || lowerCommand.includes("hi")) {
      speak("Hello! How can I assist you today?")
    } else if (lowerCommand.includes("thank")) {
      speak("You're welcome! Is there anything else I can help with?")
    } else {
      speak(`I heard: ${command}. This feature will be available soon.`)
    }
  }, [speak, onCommand])
  
  const startListening = useCallback(async () => {
    console.log("[v0] startListening called")
    
    if (!recognitionRef.current) {
      console.log("[v0] No recognition ref available")
      return
    }
    
    // First verify we have microphone permission
    try {
      console.log("[v0] Requesting microphone access...")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop())
      console.log("[v0] Microphone access confirmed")
    } catch (err) {
      console.error("[v0] Microphone access failed:", err)
      setError("Microphone access denied. Please allow microphone in browser settings and reload.")
      return
    }
    
    try {
      recognitionRef.current.start()
      console.log("[v0] Recognition start() called successfully")
    } catch (e) {
      console.log("[v0] Recognition start error (may already be running):", e)
    }
  }, [])
  
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
    isListeningForCommandRef.current = false
    setState("idle")
  }, [setState])
  
  const manualCommand = useCallback((command: string) => {
    setLastCommand(command)
    processCommand(command)
  }, [setLastCommand, processCommand])
  
  return {
    isSupported,
    error,
    state,
    startListening,
    stopListening,
    speak,
    manualCommand,
  }
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
