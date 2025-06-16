"use client"

import { useState } from "react"
import { MicIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import VoiceInput from "@/components/receptionist_dashboard/voice-input"
import AppointmentForm from "@/components/receptionist_dashboard/appointment-form"

interface EnhancedVoiceBookingProps {
  onAppointmentCreated: () => void
}

export default function EnhancedVoiceBooking({ onAppointmentCreated }: EnhancedVoiceBookingProps) {
  const [transcript, setTranscript] = useState<string>("")
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MicIcon className="h-5 w-5 text-blue-600" />
            Voice Booking System
          </CardTitle>
          <Button
            onClick={() => setShowAppointmentForm(!showAppointmentForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <VoiceInput onTranscriptChange={setTranscript} />

        {showAppointmentForm && (
          <div className="mt-6">
            <AppointmentForm transcript={transcript} onAppointmentCreated={onAppointmentCreated} />
          </div>
        )}
      </CardContent>
    </Card>
  )
} 