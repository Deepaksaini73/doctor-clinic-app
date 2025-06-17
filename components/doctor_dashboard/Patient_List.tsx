"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Appointment } from "@/lib/types"

interface EnhancedPatientListProps {
  appointments: Appointment[]
  selectedAppointment: Appointment | null
  isLoading: boolean
  onSelectAppointment: (appointment: Appointment) => void
}

export default function PatientList({
  appointments,
  selectedAppointment,
  isLoading,
  onSelectAppointment,
}: EnhancedPatientListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Search filter function
  const filterAppointments = (appointments: Appointment[]) => {
    return appointments.filter((appointment) => {
      const searchTerm = searchQuery.toLowerCase()
      return (
        appointment.patientName.toLowerCase().includes(searchTerm) ||
        appointment.symptoms.some(symptom => 
          symptom.toLowerCase().includes(searchTerm)
        ) ||
        appointment.time.toLowerCase().includes(searchTerm)
      )
    })
  }

  // Filter appointments by search and organize by priority
  const filteredAppointments = filterAppointments(appointments)
  const emergencyAppointments = filteredAppointments.filter(app => app.priority === "emergency" && app.status === "scheduled")
  const urgentAppointments = filteredAppointments.filter(app => app.priority === "urgent" && app.status === "scheduled")
  const routineAppointments = filteredAppointments.filter(app => app.priority === "routine" && app.status === "scheduled")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
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

  const renderAppointmentList = (appointments: Appointment[], title: string) => {
  if (appointments.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">{title}</h3>
      <div className="space-y-2">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
              selectedAppointment?.id === appointment.id ? "border-blue-600 border-l-4 bg-blue-50" : "border-gray-200"
            }`}
            onClick={() => onSelectAppointment(appointment)}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">{appointment.patientName.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {appointment.patientName}{" "}
                  <span className="text-sm text-gray-500">({appointment.patientAge}y)</span>
                </h3>
                <p className="text-sm text-gray-600">
                  {appointment.symptoms?.length > 0 
                    ? appointment.symptoms.join(", ")
                    : "No symptoms recorded"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{appointment.time}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(appointment.status)}
              {getPriorityBadge(appointment.priority)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Today's Patients
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {renderAppointmentList(emergencyAppointments, "Emergency Cases")}
            {renderAppointmentList(urgentAppointments, "Urgent Cases")}
            {renderAppointmentList(routineAppointments, "Routine Cases")}
            
            {filteredAppointments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No appointments found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}