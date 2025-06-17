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
    <Card className="h-fit max-h-[900px] shadow-lg border-0 transition-all duration-300 ease-in-out">
      <CardHeader className="border-b bg-gray-50/50 p-6">
        {selectedPatientId ? (
          <div className="flex flex-col items-start w-full">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold mb-4 flex-shrink-0">
              <Calendar className="h-6 w-6 text-blue-600" />
              Patients Appointment History
            </CardTitle>
            <div className="flex items-center gap-3 flex-wrap w-full justify-end">
              <div className="relative flex-1 min-w-[100px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient name..."
                  className="pl-10 w-full bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === "date" ? "doctor" : "date")}
                className="bg-white hover:bg-gray-50 transition-colors shadow-sm flex-shrink-0 whitespace-nowrap"
              >
                <Filter className="h-4 w-4 mr-2" />
                Sort by {sortBy === "date" ? "Patient Name" : "Date"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold flex-shrink-0">
              <Calendar className="h-6 w-6 text-blue-600" />
              Patients Appointment History
            </CardTitle>
            <div className="flex items-center gap-3 flex-grow justify-end">
              <div className="relative flex-1 min-w-[150px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient name..."
                  className="pl-10 w-full bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === "date" ? "doctor" : "date")}
                className="bg-white hover:bg-gray-50 transition-colors shadow-sm flex-shrink-0 whitespace-nowrap"
              >
                <Filter className="h-4 w-4 mr-2" />
                Sort by {sortBy === "date" ? "Patient Name" : "Date"}
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6 pt-4">
        <div className="flex border-b mb-6">
          <button
            className={`px-6 py-3 font-medium text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
              activeTab === "upcoming" 
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
              activeTab === "past" 
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
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
          <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`border border-gray-200 rounded-xl p-5 hover:bg-gray-50/80 transition-all duration-300 cursor-pointer shadow-sm group
                    ${selectedPatientId === appointment.patientId 
                      ? 'ring-2 ring-blue-500 bg-blue-50/50 shadow-md scale-[0.98]' 
                      : 'hover:scale-[1.01]'}`}
                  onClick={() => onPatientSelect(appointment.patientId)}
                >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-110">
                        <User className="h-7 w-7 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{appointment.patientName}</h3>
                        <p className="text-sm text-gray-600">
                          {appointment.patientAge} years • {appointment.gender}
                        </p>
                      </div>
                    </div>
                    
                    <div className="ml-[72px] space-y-3 pr-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="truncate">Dr. {appointment.doctorName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {format(new Date(appointment.date), "MMMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{appointment.time}</span>
                        </div>
                      </div>
                      {(appointment.symptoms || []).length > 0 && (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-600">
                            {(appointment.symptoms || []).join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    {getPriorityBadge(appointment.priority)}
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
            {filteredAppointments.length === 0 && (
              <div className="text-center py-16 px-4 bg-gray-50/50 rounded-xl">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 shadow-inner">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-sm text-gray-500">
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