"use client"

import { useRef, useCallback, useState } from "react"
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

export function useVoice({ wakeWord = "wake up", onCommand }: UseVoiceOptions = {}) {
  const { state, setState, setLastCommand, setLastResponse } = useApex()
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const isListeningForCommandRef = useRef(false)
  
  // Check if speech recognition is available (don't initialize yet - wait for user gesture)
  const isSupported = typeof window !== "undefined" && 
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  
  const isSafariMobile = isSafariIOS()
  
  const speak = useCallback((text: string) => {
    setState("speaking")
    setLastResponse(text)
    
    if (typeof window === "undefined") {
      setTimeout(() => setState("idle"), 1000)
      return
    }
    
    // Initialize speech synthesis on demand
    if (!synthRef.current) {
      synthRef.current = window.speechSynthesis
    }
    
    if (!synthRef.current) {
      setTimeout(() => setState("idle"), 1000)
      return
    }
    
    // Stop recognition while speaking
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Already stopped
      }
    }
    
    synthRef.current.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1
    
    utterance.onend = () => {
      setState("idle")
      // Restart recognition after speaking if we were listening
      if (isListening && recognitionRef.current) {
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
  }, [setState, setLastResponse, isListening])
  
  const processCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase()
    
    if (onCommand) {
      onCommand(command)
    }
    
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
  
  // Initialize recognition - called on user gesture (mic button tap)
  const initializeRecognition = useCallback(() => {
    if (typeof window === "undefined") return null
    
    // Use webkitSpeechRecognition for Safari
    const SpeechRecognitionAPI = window.webkitSpeechRecognition || window.SpeechRecognition
    if (!SpeechRecognitionAPI) return null
    
    const recognition = new SpeechRecognitionAPI()
    
    // Safari iOS settings - must use non-continuous mode
    if (isSafariMobile) {
      recognition.continuous = false
      recognition.interimResults = false
    } else {
      recognition.continuous = true
      recognition.interimResults = true
    }
    
    recognition.lang = "en-US"
    recognition.maxAlternatives = 1
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1]
      
      if (!lastResult.isFinal && !isSafariMobile) return
      
      const transcript = lastResult[0].transcript.toLowerCase().trim()
      
      if (!isListeningForCommandRef.current) {
        if (transcript.includes(wakeWord.toLowerCase())) {
          isListeningForCommandRef.current = true
          setState("listening")
          speak("Yes, I'm listening")
        }
      } else {
        isListeningForCommandRef.current = false
        setLastCommand(transcript)
        processCommand(transcript)
      }
    }
    
    recognition.onerror = () => {
      // Silently handle errors - no error messages shown
    }
    
    recognition.onend = () => {
      // Auto-restart for continuous listening (not on Safari mobile)
      if (!isSafariMobile && isListening && state !== "speaking") {
        setTimeout(() => {
          try {
            recognition.start()
          } catch {
            // Already started
          }
        }, 100)
      } else if (isSafariMobile) {
        // On Safari mobile, set listening to false when recognition ends
        setIsListening(false)
        setState("idle")
      }
    }
    
    return recognition
  }, [wakeWord, setState, setLastCommand, processCommand, speak, isSafariMobile, isListening, state])
  
  // Start listening - triggered by mic button tap (user gesture)
  const startListening = useCallback(async () => {
    if (!isSupported) return
    
    // Step 1: Request microphone permission via getUserMedia FIRST
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
    } catch {
      // Permission denied - but don't show error, just fail silently
      return
    }
    
    // Step 2: Initialize speech recognition after permission granted
    if (!recognitionRef.current) {
      recognitionRef.current = initializeRecognition()
    }
    
    if (!recognitionRef.current) return
    
    // Step 3: Start recognition
    try {
      recognitionRef.current.start()
      setIsListening(true)
      setState("idle") // Ready to hear wake word
    } catch {
      // May already be started
    }
  }, [isSupported, initializeRecognition, setState])
  
  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Already stopped
      }
    }
    setIsListening(false)
    isListeningForCommandRef.current = false
    setState("idle")
  }, [setState])
  
  // Manual command via text input
  const manualCommand = useCallback((command: string) => {
    setLastCommand(command)
    processCommand(command)
  }, [setLastCommand, processCommand])
  
  return {
    isSupported,
    isSafariMobile,
    isListening,
    hasPermission,
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
