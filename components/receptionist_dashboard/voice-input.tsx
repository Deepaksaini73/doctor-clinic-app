"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, Trash2, Save, Play } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VoiceInputProps {
  onTranscriptComplete: (transcript: string) => void
}

export default function VoiceInput({ onTranscriptComplete }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " "
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript((prevTranscript) => prevTranscript + finalTranscript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)
        setError(`Error: ${event.error}`)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start()
        }
      }
    } else {
      setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.")
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isListening])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      setError(null)
      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch (err) {
        console.error("Failed to start speech recognition:", err)
        setError("Failed to start speech recognition. Please try again.")
      }
    }
  }

  const handleClearTranscript = () => {
    setTranscript("")
  }

  const handleSaveTranscript = () => {
    onTranscriptComplete(transcript)
  }

  // Mock voice input for demo purposes
  const simulateVoiceInput = () => {
    const mockPhrases = [
      "New appointment for John Smith, 45 years old, with severe headache and dizziness. He prefers Dr. Sarah Johnson.",
      "Emily Johnson, 32 years old, is experiencing shortness of breath and wheezing. She wants to see Dr. Michael Chen urgently.",
      "Robert Davis, 58, has been feeling fatigue and increased thirst. Schedule him with Dr. Lisa Wong.",
    ]

    const randomPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)]
    setTranscript(randomPhrase)
  }

  // Voice command shortcuts (placeholder for future ML integration)
  const processVoiceCommand = () => {
    // This is where you would integrate with your ML voice processing system
    // For now, we'll use a simple keyword detection system

    const command = transcript.toLowerCase()

    if (command.includes("new appointment") || command.includes("schedule appointment")) {
      // Extract patient info and pre-fill form
      onTranscriptComplete(transcript)
      return
    }

    if (command.includes("urgent") || command.includes("emergency")) {
      // Mark as urgent
      onTranscriptComplete(transcript + " [URGENT]")
      return
    }

    // Default behavior if no command detected
    onTranscriptComplete(transcript)
  }

  return (
    <Card className="w-full border-receptionist border-t-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Voice Input</span>
          <div className="flex gap-2">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="sm"
              onClick={toggleListening}
              className={isListening ? "bg-red-500 hover:bg-red-600" : "bg-receptionist hover:bg-blue-700"}
            >
              {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
              {isListening ? "Stop" : "Start"} Recording
            </Button>
            <Button variant="outline" size="sm" onClick={simulateVoiceInput}>
              <Play className="mr-2 h-4 w-4" />
              Simulate Voice
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Textarea
          placeholder="Speak or type patient information here..."
          className="min-h-[150px] text-lg"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
        <div className="mt-2 text-sm text-gray-500">
          <p>
            <strong>Voice Command Examples:</strong> "New appointment for [name], [age], with [symptoms]" or "Urgent
            appointment for [name]"
          </p>
          <p className="mt-1 text-xs italic">Note: This is a placeholder for future ML voice processing integration</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleClearTranscript}>
          <Trash2 className="mr-2 h-4 w-4" /> Clear
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={processVoiceCommand}>
            Process Command
          </Button>
          <Button
            onClick={handleSaveTranscript}
            disabled={!transcript.trim()}
            className="bg-receptionist hover:bg-blue-700"
          >
            <Save className="mr-2 h-4 w-4" /> Use Transcript
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
