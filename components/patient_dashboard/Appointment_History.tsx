"use client"

import { useState } from "react"
import { Calendar, Clock, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Appointment } from "@/lib/types"

interface EnhancedAppointmentHistoryProps {
  appointments: Appointment[]
  isLoading: boolean
}

export default function AppointmentHistory({ appointments, isLoading }: EnhancedAppointmentHistoryProps) {
  const [activeTab, setActiveTab] = useState("upcoming")

  const upcomingAppointments = appointments.filter((app) => app.status === "scheduled")
  const pastAppointments = appointments.filter((app) => app.status === "completed")

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          My Appointments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "upcoming" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "past" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("past")}
          >
            Past
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {(activeTab === "upcoming" ? upcomingAppointments : pastAppointments).map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{appointment.doctorName}</h3>
                        <p className="text-sm text-gray-600">{appointment.symptoms.join(", ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{appointment.time}</span>
                      {getStatusBadge(appointment.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {(activeTab === "upcoming" ? upcomingAppointments : pastAppointments).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No {activeTab} appointments found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 