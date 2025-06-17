"use client"

import { useState } from "react"
import { Calendar, Clock, User, Search, MapPin, Phone, AlertCircle, ChevronRight, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import type { Appointment } from "@/lib/types"

interface EnhancedAppointmentHistoryProps {
  appointments: Appointment[]
  isLoading: boolean
  onPatientSelect: (patientId: string) => void
  selectedPatientId: string | null
}

export default function AppointmentHistory({ 
  appointments = [], // Add default empty array
  isLoading,
  onPatientSelect,
  selectedPatientId 
}: EnhancedAppointmentHistoryProps) {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "doctor">("date")

  // Add safe filtering with null checks
  const filteredAppointments = (appointments || [])
    .filter((app) => app?.status === (activeTab === "upcoming" ? "scheduled" : "completed"))
    .filter((app) => 
      app?.patientName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      return (a.patientName || '').localeCompare(b.patientName || '')
    })

  // Update appointments count with null check
  const upcomingCount = (appointments || [])
    .filter(app => app?.status === "scheduled").length
  const pastCount = (appointments || [])
    .filter(app => app?.status === "completed").length

  const getPriorityBadge = (priority: string) => {
    const colors = {
      routine: "bg-green-100 text-green-800",
      urgent: "bg-orange-100 text-orange-800",
      emergency: "bg-red-100 text-red-800"
    }
    return <Badge className={colors[priority as keyof typeof colors]}>{priority}</Badge>
  }

  return (
    <Card className="h-fit max-h-[800px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Patients Appointment History
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by patient name..."
                className="pl-10 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === "date" ? "doctor" : "date")}
            >
              <Filter className="h-4 w-4 mr-2" />
              Sort by {sortBy === "date" ? "Patient Name" : "Date"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "upcoming" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "past" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("past")}
          >
            Past ({pastCount})
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer
                    ${selectedPatientId === appointment.patientId ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                  onClick={() => onPatientSelect(appointment.patientId)}
                >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.patientName}</h3>
                        <p className="text-sm text-gray-600">
                          {appointment.patientAge} years • {appointment.gender}
                        </p>
                      </div>
                    </div>
                    
                    <div className="ml-[60px] space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        Dr. {appointment.doctorName}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {format(new Date(appointment.date), "MMMM d, yyyy")}
                        </span>
                        <Clock className="h-4 w-4 text-gray-400 ml-2" />
                        <span className="text-sm text-gray-600">{appointment.time}</span>
                      </div>
                      {(appointment.symptoms || []).length > 0 && ( // Add null check for symptoms
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-600">
                            {(appointment.symptoms || []).join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getPriorityBadge(appointment.priority)}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
            {filteredAppointments.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">No appointments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery 
                    ? "No patients found with this name" 
                    : `No ${activeTab} appointments`}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}