"use client"

import { useState, useEffect } from "react"
import { Calendar, Search, Edit, Trash2, Filter } from "lucide-react"
import { format, isToday, parseISO } from "date-fns"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Appointment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { database } from "@/lib/firebase"
import { ref, onValue, remove, update } from "firebase/database"
import { useToast } from "@/hooks/use-toast"

interface EnhancedAppointmentsListProps {
  onAppointmentUpdated?: () => void
}

export default function AppointmentsList({ onAppointmentUpdated }: EnhancedAppointmentsListProps) {
  const [patientSearchQuery, setPatientSearchQuery] = useState("")
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const { toast } = useToast()

  // Add new state for search type
  const [searchType, setSearchType] = useState<"patient" | "doctor">("patient")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const appointmentsRef = ref(database, 'appointments')
    
    // Set up real-time listener
    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const appointmentsData = snapshot.val()
        const appointmentsArray = Object.entries(appointmentsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }))
        setAppointments(appointmentsArray)
      } else {
        setAppointments([])
      }
      setIsLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      const appointmentRef = ref(database, `appointments/${appointmentId}`)
      await remove(appointmentRef)
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      })
      if (onAppointmentUpdated) {
        onAppointmentUpdated()
      }
    } catch (error) {
      console.error("Error deleting appointment:", error)
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      })
    }
  }

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const appointmentRef = ref(database, `appointments/${appointmentId}`)
      await update(appointmentRef, { status: newStatus })
      toast({
        title: "Success",
        description: "Appointment status updated successfully",
      })
      if (onAppointmentUpdated) {
        onAppointmentUpdated()
      }
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      })
    }
  }

  // Filter appointments based on all criteria
  const filteredAppointments = appointments
    .filter(appointment => isToday(parseISO(appointment.date))) // Always filter for today
    .filter(appointment => {
      // Status filter
      if (statusFilter !== "all") {
        return appointment.status === statusFilter
      }
      return true
    })
    .filter(appointment => {
      // Priority filter
      if (priorityFilter !== "all") {
        return appointment.priority === priorityFilter
      }
      return true
    })
    .filter(appointment => {
      if (!searchQuery) return true
      if (searchType === "patient") {
        return appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase())
      } else {
        return appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
      }
    })

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Today Appointments
          </CardTitle>
          <span className="text-sm font-medium text-gray-500">
            {filteredAppointments.length} total
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Split Search Inputs */}
            <div className="flex-1 flex gap-2">
              <Select value={searchType} onValueChange={(value: "patient" | "doctor") => setSearchType(value)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Search by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search by ${searchType === "patient" ? "patient name" : "doctor name"}...`}
                  className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Status and Priority Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                {`Search: ${searchType === "patient" ? "Patient" : "Doctor"}`}
                <button onClick={() => setSearchQuery("")} className="ml-1">×</button>
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {statusFilter}
                <button onClick={() => setStatusFilter("all")} className="ml-1">×</button>
              </Badge>
            )}
            {priorityFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {priorityFilter}
                <button onClick={() => setPriorityFilter("all")} className="ml-1">×</button>
              </Badge>
            )}
          </div>

          {/* Appointments List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {patientSearchQuery || doctorSearchQuery ? "No appointments match your search" : "No appointments scheduled for today"}
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
                      {/* Update symptoms rendering with null check */}
                      {appointment.symptoms && appointment.symptoms.length > 0 && (
                        <p className="text-sm text-gray-600 mb-3">
                          {appointment.symptoms.join(", ")}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        {getStatusBadge(appointment.status)}
                        {getPriorityBadge(appointment.priority)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">{appointment.time}</span>
                      <div className="flex items-center gap-1 mt-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleStatusUpdate(appointment.id, 
                            appointment.status === 'scheduled' ? 'in-progress' : 
                            appointment.status === 'in-progress' ? 'completed' : 'scheduled'
                          )}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}