"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useApex } from "@/contexts/apex-context"

interface UseVoiceOptions {
  wakeWord?: string
  onCommand?: (command: string) => void
}

// Detect Safari iOS
function isSafariIOS(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
  return isIOS && isSafari
}

// Detect if browser supports speech recognition
function getSpeechRecognitionSupport(): { supported: boolean; isSafariMobile: boolean } {
  if (typeof window === "undefined") return { supported: false, isSafariMobile: false }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  return {
    supported: !!SpeechRecognition,
    isSafariMobile: isSafariIOS()
  }
}

export function useVoice({ wakeWord = "wake up", onCommand }: UseVoiceOptions = {}) {
  const { state, setState, setLastCommand, setLastResponse } = useApex()
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSafariMobile, setIsSafariMobile] = useState(false)
  const isListeningForCommandRef = useRef(false)
  const isActiveRef = useRef(false)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return
    
    const { supported, isSafariMobile: isSafari } = getSpeechRecognitionSupport()
    setIsSafariMobile(isSafari)
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported. Please use text input instead.")
      return
    }
    
    setIsSupported(true)
    synthRef.current = window.speechSynthesis
    
    const recognition = new SpeechRecognition()
    
    // Safari iOS requires different settings
    if (isSafari) {
      // Safari iOS doesn't support continuous mode well
      recognition.continuous = false
      recognition.interimResults = false
    } else {
      recognition.continuous = true
      recognition.interimResults = true
    }
    
    recognition.lang = "en-US"
    recognition.maxAlternatives = 1
    
    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1]
      
      if (!lastResult.isFinal && !isSafari) return
      
      const transcript = lastResult[0].transcript.toLowerCase().trim()
      
      if (!isListeningForCommandRef.current) {
        // Check for wake word
        if (transcript.includes(wakeWord.toLowerCase())) {
          isListeningForCommandRef.current = true
          setState("listening")
          speak("Yes, I'm listening")
        }
      } else {
        // Process command
        isListeningForCommandRef.current = false
        setLastCommand(transcript)
        processCommand(transcript)
      }
    }
    
    recognition.onerror = (event) => {
      // Handle specific errors silently for expected cases
      if (event.error === "no-speech" || event.error === "aborted") {
        return
      }
      
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please allow microphone in browser settings.")
      } else if (event.error === "network") {
        setError("Network error. Speech recognition requires internet connection.")
      } else if (event.error === "audio-capture") {
        setError("No microphone found. Please connect a microphone.")
      } else {
        setError(`Voice error: ${event.error}. Try using text input instead.`)
      }
    }
    
    recognition.onend = () => {
      // Only restart if we're supposed to be actively listening
      if (isActiveRef.current && state !== "speaking") {
        // Clear any existing restart timeout
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current)
        }
        
        // Delay restart to prevent rapid cycling (longer delay for Safari)
        const delay = isSafari ? 300 : 100
        restartTimeoutRef.current = setTimeout(() => {
          try {
            if (isActiveRef.current && recognitionRef.current) {
              recognitionRef.current.start()
            }
          } catch {
            // Already started or other issue
          }
        }, delay)
      }
    }
    
    recognitionRef.current = recognition
    
    return () => {
      isActiveRef.current = false
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
      try {
        recognition.stop()
      } catch {
        // Already stopped
      }
    }
  }, [wakeWord, setState, setLastCommand, state])
  
  const speak = useCallback((text: string) => {
    setState("speaking")
    setLastResponse(text)
    
    // Check if speech synthesis is available
    if (!synthRef.current) {
      // No speech synthesis available - just set state back after a delay
      setTimeout(() => setState("idle"), 1000)
      return
    }
    
    // Stop recognition while speaking to avoid feedback
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Already stopped
      }
    }
    
    // Cancel any ongoing speech
    synthRef.current.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1
    
    utterance.onend = () => {
      setState("idle")
      // Restart recognition after speaking
      if (isActiveRef.current && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start()
          } catch {
            // Already started
          }
        }, 200)
      }
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
    if (!recognitionRef.current) {
      setError("Voice recognition not available. Please use text input.")
      return
    }
    
    // First verify we have microphone permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop())
    } catch {
      setError("Microphone access denied. Please allow microphone in browser settings.")
      return
    }
    
    isActiveRef.current = true
    setError(null)
    
    try {
      recognitionRef.current.start()
    } catch {
      // Already started - that's ok
    }
  }, [])
  
  const stopListening = useCallback(() => {
    isActiveRef.current = false
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Already stopped
      }
    }
    isListeningForCommandRef.current = false
    setState("idle")
  }, [setState])
  
  const manualCommand = useCallback((command: string) => {
    setLastCommand(command)
    processCommand(command)
  }, [setLastCommand, processCommand])
  
  return {
    isSupported,
    isSafariMobile,
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
