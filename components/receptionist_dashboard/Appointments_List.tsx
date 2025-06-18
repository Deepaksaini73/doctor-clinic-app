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
import { ref, onValue, update } from "firebase/database"
import { useToast } from "@/hooks/use-toast"

interface EnhancedAppointmentsListProps {
  onAppointmentUpdated?: () => void
}

const isValidDate = (dateString: string | undefined | null): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

const isTodayDate = (dateString: string | undefined | null): boolean => {
  if (!isValidDate(dateString)) return false;
  try {
    return isToday(parseISO(dateString));
  } catch (error) {
    console.error("Date parsing error:", error);
    return false;
  }
};

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
    let intervalId: NodeJS.Timeout

    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/appointments')
        const data = await response.json()
        
        if (data.appointments) {
          setAppointments(data.appointments)
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching appointments:', error)
        toast({
          title: "Error",
          description: "Failed to fetch appointments",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchAppointments()
    // Poll every 30 seconds for updates
    intervalId = setInterval(fetchAppointments, 30000)

    return () => clearInterval(intervalId)
  }, [toast])

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      // Optimistically update UI
      setAppointments(currentAppointments => 
        currentAppointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: newStatus }
            : appointment
        )
      );

      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        // Revert optimistic update if API call fails
        setAppointments(currentAppointments => 
          currentAppointments.map(appointment => 
            appointment.id === appointmentId 
              ? { ...appointment, status: appointment.status }
              : appointment
          )
        );
        throw new Error('Failed to update status')
      }

      toast({
        title: "Success",
        description: "Appointment status updated successfully",
      })

      // Notify parent component if needed
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
    .filter(appointment => {
      // Add null check and validation for date
      if (!appointment?.date) return false;
      return isTodayDate(appointment.date);
    })
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
    <Card className="w-full">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calendar className="h-5 w-5 text-blue-600" />
            Today Appointments
          </CardTitle>
          <span className="text-sm font-medium text-gray-500">
            {filteredAppointments.length} total
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Search and Filters - Stacked on mobile */}
          <div className="flex flex-col space-y-3">
            {/* Search Section */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <Select value={searchType} onValueChange={(value: "patient" | "doctor") => setSearchType(value)}>
                  <SelectTrigger className="w-full sm:w-[130px]">
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[130px]">
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
                <SelectTrigger className="w-full sm:w-[130px]">
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

          {/* Active Filters - Wrap on mobile */}
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
            <div className="flex justify-center items-center h-48 sm:h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 px-4 text-gray-500">
              {searchQuery ? "No appointments match your search" : "No appointments scheduled for today"}
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-medium text-sm">
                            {appointment.patientName.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {appointment.patientName}{" "}
                            <span className="text-sm text-gray-500">({appointment.patientAge}y)</span>
                          </h3>
                          <p className="text-sm text-gray-600 truncate">{appointment.doctorName}</p>
                        </div>
                      </div>
                      {appointment.symptoms && appointment.symptoms.length > 0 && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {appointment.symptoms.join(", ")}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(appointment.status)}
                        {getPriorityBadge(appointment.priority)}
                        <span className="text-sm font-medium text-gray-900 sm:hidden">
                          {appointment.time}
                        </span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 mt-2 sm:mt-0">
                      <span className="hidden sm:inline text-sm font-medium text-gray-900">
                        {appointment.time}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-9 px-2.5"
                          onClick={() => handleStatusUpdate(appointment.id, 
                            appointment.status === 'scheduled' ? 'in-progress' : 
                            appointment.status === 'in-progress' ? 'completed' : 'scheduled'
                          )}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-9 px-2.5 text-red-600 hover:text-red-700"
                            onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="ml-1 hidden sm:inline">Cancel</span>
                          </Button>
                        )}
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