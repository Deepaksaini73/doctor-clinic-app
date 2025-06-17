"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { Appointment } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Search, MoreVertical } from "lucide-react"
import { database } from "@/lib/firebase"
import { ref, onValue, update, remove } from "firebase/database"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default function AppointmentsTable() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

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
        // Sort appointments by time
        appointmentsArray.sort((a, b) => {
          const timeA = a.time.toLowerCase()
          const timeB = b.time.toLowerCase()
          return timeA.localeCompare(timeB)
        })
        setAppointments(appointmentsArray)
      } else {
        setAppointments([])
      }
      setIsLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const appointmentRef = ref(database, `appointments/${appointmentId}`)
      await update(appointmentRef, { status: newStatus })
      toast({
        title: "Success",
        description: "Appointment status updated successfully",
      })
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      const appointmentRef = ref(database, `appointments/${appointmentId}`)
      await remove(appointmentRef)
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting appointment:", error)
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      })
    }
  }

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.symptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Urgent</Badge>
      case "emergency":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Emergency</Badge>
      default:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
            Routine
          </Badge>
        )
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-progress":
        return <Badge variant="secondary">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "cancelled":
        return (
          <Badge variant="outline" className="text-gray-500">
            Cancelled
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            Scheduled
          </Badge>
        )
    }
  }

  return (
    <Card className="border-receptionist border-t-4">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>{appointments.length} appointments scheduled for today</CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? "No appointments match your search" : "No appointments scheduled for today"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Symptoms</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.time}</TableCell>
                    <TableCell>{appointment.patientName}</TableCell>
                    <TableCell>{appointment.patientAge}</TableCell>
                    <TableCell>{appointment.doctorName}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">{appointment.symptoms.join(", ")}</div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(appointment.priority)}</TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {appointment.status !== 'completed' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                            >
                              Mark as Completed
                            </DropdownMenuItem>
                          )}
                          {appointment.status !== 'in-progress' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(appointment.id, 'in-progress')}
                            >
                              Mark as In Progress
                            </DropdownMenuItem>
                          )}
                          {appointment.status !== 'cancelled' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                            >
                              Cancel Appointment
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                          >
                            Delete Appointment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
