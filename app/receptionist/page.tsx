"use client"

import { useState, useEffect } from "react"
import { Calendar, Search, Edit, Trash2, Plus, MicIcon } from "lucide-react"
import type { Appointment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import MainLayout from "@/components/layout/main-layout"
import VoiceInput from "@/components/receptionist/voice-input"
import AppointmentForm from "@/components/receptionist/appointment-form"

export default function ReceptionistPage() {
  const [transcript, setTranscript] = useState<string>("")
  const [isListening, setIsListening] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true)
      try {
        const today = new Date().toISOString().split("T")[0]
        const response = await fetch(`/api/appointments?date=${today}`)
        if (!response.ok) throw new Error("Failed to fetch appointments")
        const data = await response.json()
        setAppointments(data)
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const handleAppointmentCreated = () => {
    // Refresh appointments list
    const fetchAppointments = async () => {
      try {
        const today = new Date().toISOString().split("T")[0]
        const response = await fetch(`/api/appointments?date=${today}`)
        if (!response.ok) throw new Error("Failed to fetch appointments")
        const data = await response.json()
        setAppointments(data)
      } catch (error) {
        console.error("Error fetching appointments:", error)
      }
    }
    fetchAppointments()
    setShowAppointmentForm(false)
  }

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-orange-100 text-orange-800">Urgent</Badge>
      case "emergency":
        return <Badge className="bg-red-100 text-red-800">Emergency</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Routine</Badge>
    }
  }

  return (
    <MainLayout title="Welcome back, Sabrina!" subtitle="Here is the latest update for the last 7 days, check now.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Booking System */}
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
                <AppointmentForm transcript={transcript} onAppointmentCreated={handleAppointmentCreated} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Today's Appointments
              </CardTitle>
              <span className="text-sm font-medium text-gray-500">{appointments.length} total</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? "No appointments match your search" : "No appointments scheduled for today"}
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {appointment.patientName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {appointment.patientName}{" "}
                              <span className="text-sm text-gray-500">({appointment.patientAge}y)</span>
                            </h3>
                            <p className="text-sm text-gray-600">{appointment.doctorName}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{appointment.symptoms.join(", ")}</p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(appointment.status)}
                          {getPriorityBadge(appointment.priority)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">{appointment.time}</span>
                        <div className="flex items-center gap-1 mt-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
