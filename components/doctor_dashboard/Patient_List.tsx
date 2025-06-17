"use client"

import { useState } from "react"
import { Calendar, Search, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
      const symptoms = appointment.symptoms || []
      return (
        appointment.patientName.toLowerCase().includes(searchTerm) ||
        symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm)) ||
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
        return <Badge className="bg-blue-50 text-blue-700 border border-blue-100">Scheduled</Badge>
      case "in-progress":
        return <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-100">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-50 text-green-700 border border-green-100">Completed</Badge>
      default:
        return <Badge className="bg-gray-50 text-gray-700 border border-gray-100">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-orange-50 text-orange-700 border border-orange-100">Urgent</Badge>
      case "emergency":
        return <Badge className="bg-red-50 text-red-700 border border-red-100">Emergency</Badge>
      default:
        return <Badge className="bg-gray-50 text-gray-700 border border-gray-100">Routine</Badge>
    }
  }

  const renderAppointmentList = (appointments: Appointment[], title: string) => {
    if (appointments.length === 0) return null

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
          {title}
          <Badge variant="outline" className="text-xs font-normal">
            {appointments.length}
          </Badge>
        </h3>
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedAppointment?.id === appointment.id 
                  ? "border-blue-600 border-l-4 bg-blue-50 shadow-sm" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => onSelectAppointment(appointment)}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm">
                  <span className="text-blue-700 font-medium text-lg">{appointment.patientName.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {appointment.patientName}
                    <span className="text-sm text-gray-500 ml-2">({appointment.patientAge}y)</span>
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {(appointment.symptoms || []).length > 0 
                      ? appointment.symptoms?.join(", ")
                      : "No symptoms recorded"}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {appointment.time}
                  </span>
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
    <Card className="border-doctor border-t-4 shadow-sm">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
          <Calendar className="h-6 w-6 text-blue-600" />
          Today's Patients
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search patients by name, symptoms, or time..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
            {renderAppointmentList(emergencyAppointments, "Emergency Cases")}
            {renderAppointmentList(urgentAppointments, "Urgent Cases")}
            {renderAppointmentList(routineAppointments, "Routine Cases")}
            
            {filteredAppointments.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex flex-col items-center gap-3">
                  <Search className="h-12 w-12 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}