"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mic, MicOff, Trash2, Save, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VoiceInputProps {
  onTranscriptComplete: (processedData: any) => void;
}

export default function VoiceInput({ onTranscriptComplete }: VoiceInputProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [finalTranscript, setFinalTranscript] = useState<string>(""); // ✅ NEW: store cumulative final text
  const [transcript, setTranscript] = useState<string>(""); // ✅ shows final + interim
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        // ✅ Do NOT reset finalTranscript here!
      };

      recognition.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setError("Error recording voice. Please try again.");
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let localFinal = finalTranscript; // get current final

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPiece = event.results[i][0].transcript || "";
          if (event.results[i].isFinal) {
            localFinal += transcriptPiece + " ";
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        localFinal = localFinal.trim();
        setFinalTranscript(localFinal); // update final state
        setTranscript((localFinal + " " + interimTranscript).trim()); // show final + interim
      };

      return () => {
        if (recognition) {
          recognition.stop();
        }
      };
    } else {
      setError(
        "Speech recognition is not supported in this browser. Please use Chrome."
      );
    }
  }, [finalTranscript]); // ✅ depend on finalTranscript to keep latest value

  const startRecording = () => {
    try {
      if (recognitionRef.current && !isListening) {
        recognitionRef.current.start();
      }
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Failed to start recording. Please try again.");
      setIsListening(false);
    }
  };

  const stopRecording = () => {
    try {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    } catch (err) {
      console.error("Error stopping recording:", err);
      setError("Failed to stop recording. Please refresh the page.");
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleClearTranscript = () => {
    setFinalTranscript("");
    setTranscript("");
    setError(null);
  };

  const processTranscript = async (text: string) => {
    if (!text.trim()) {
      setError("Transcript is empty.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log("Sending transcript:", text);

      const response = await fetch("/api/process-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (!response.ok) {
        throw new Error(data.error || `API returned status ${response.status}`);
      }

      const requiredFields = ["patientName", "patientAge", "gender", "symptoms", "priority"];
      const missingFields = requiredFields.filter(field => {
        const value = data[field];
        return (
          value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim() === "")
        );
      });

      if (missingFields.length > 0) {
        throw new Error(`Missing or empty fields: ${missingFields.join(", ")}`);
      }

      if (typeof onTranscriptComplete === "function") {
        onTranscriptComplete(data);
      }

    } catch (err) {
      console.error("Transcript processing failed:", err);
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(`${msg}. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTranscript = () => {
    const trimmedTranscript = finalTranscript.trim();
    if (trimmedTranscript) {
      processTranscript(trimmedTranscript);
    }
  };

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
              className={
                isListening
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-receptionist hover:bg-blue-700"
              }
            >
              {isListening ? (
                <MicOff className="mr-2 h-4 w-4" />
              ) : (
                <Mic className="mr-2 h-4 w-4" />
              )}
              {isListening ? "Stop" : "Start"} Recording
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
          value={transcript || ""}
          onChange={(e) => {
            const value = e.target.value || "";
            setTranscript(value);
            setFinalTranscript(value); // keep both in sync if manually edited
          }}
        />
        <div className="mt-2 text-sm text-gray-500">
          <p>
            <strong>Instructions:</strong> Click "Start Recording" and speak clearly. Click "Stop Recording" when finished.
          </p>
          <p className="mt-1">
            <strong>What to say:</strong> Include your name, age, gender, mobile number, symptoms, preferred doctor (if any), and how urgent it is.
          </p>
          <p className="mt-1">
            <strong>Example:</strong> "Hi, my name is Ramesh Verma. I am forty two years old male. My number is nine eight seven six five four three two one zero. I have headache and mild fever. I want to see Dr. Anita Sharma urgently. I have a history of migraine."
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleClearTranscript}>
          <Trash2 className="mr-2 h-4 w-4" /> Clear
        </Button>
        <Button
          onClick={handleSaveTranscript}
          disabled={!finalTranscript.trim() || isProcessing}
          className="bg-receptionist hover:bg-blue-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Use Transcript
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
