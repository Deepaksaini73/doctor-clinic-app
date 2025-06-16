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
  const [activeTab, setActiveTab] = useState("upcoming")

  const upcomingAppointments = appointments.filter((app) => app.status === "scheduled")
  const completedAppointments = appointments.filter((app) => app.status === "completed")

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

        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "upcoming" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "completed" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "all" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(activeTab === "upcoming"
              ? upcomingAppointments
              : activeTab === "completed"
                ? completedAppointments
                : appointments
            ).map((appointment) => (
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
                    <p className="text-sm text-gray-600">{appointment.symptoms.join(", ")}</p>
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
        )}
      </CardContent>
    </Card>
  )
} 