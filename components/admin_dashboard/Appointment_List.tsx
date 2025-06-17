"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import {
  EnhancedCard,
  EnhancedCardContent,
  EnhancedCardHeader,
  EnhancedCardTitle,
} from "@/components/ui/enhanced-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface Appointment {
  id: string
  doctorId: string
  doctorName: string
  date: string
  time: string
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  priority: "routine" | "urgent" | "emergency"
}

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const appointmentsRef = ref(database, 'appointments')
    onValue(appointmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const appointmentsData = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...(data as Omit<Appointment, 'id'>)
        }))
        // Sort appointments by date and time
        appointmentsData.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`).getTime()
          const dateB = new Date(`${b.date} ${b.time}`).getTime()
          return dateA - dateB
        })
        setAppointments(appointmentsData)
      } else {
        setAppointments([])
      }
      setIsLoading(false)
    })
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "emergency":
        return "red"
      case "urgent":
        return "orange"
      default:
        return "blue"
    }
  }

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
    <EnhancedCard hover gradient>
      <EnhancedCardHeader gradient>
        <div className="flex items-center justify-between">
          <EnhancedCardTitle gradient>Appointment List</EnhancedCardTitle>
        </div>
      </EnhancedCardHeader>
      <EnhancedCardContent>
        <div className="space-y-4 max-h-[1380px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No appointments found</div>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:border-blue-300"
              >
                <div
                  className={`w-10 h-10 rounded-full bg-${getPriorityColor(appointment.priority)}-100 flex items-center justify-center`}
                >
                  <span className={`text-${getPriorityColor(appointment.priority)}-600 font-medium text-sm`}>
                    {appointment.doctorName.split(" ")[1]?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{appointment.doctorName}</p>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <p className="text-xs text-gray-500">
                    {appointment.date} • {appointment.time}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  )
}
