"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { database } from "@/lib/firebase"
import { ref, update, remove } from "firebase/database"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientAge: number
  gender: string
  mobileNumber: string
  doctorId: string
  doctorName: string
  date: string
  time: string
  symptoms: string[]
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  priority: "routine" | "urgent" | "emergency"
  notes?: string
  createdAt: string
}

interface AppointmentsListProps {
  appointments: Appointment[]
  onSearch: (query: string) => void
}

export default function AppointmentsList({ appointments, onSearch }: AppointmentsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()
  const itemsPerPage = 10
  const [statusFilter, setStatusFilter] = useState("all")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query)
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const appointmentRef = ref(database, `appointments/${id}`)
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

  const handleDeleteAppointment = async (id: string) => {
    try {
      const appointmentRef = ref(database, `appointments/${id}`)
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

  const filteredAppointments = appointments.filter(appointment => {
    if (statusFilter === "all") return true
    return appointment.status === statusFilter
  })

  // Calculate pagination for filtered appointments
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex)

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than max visible pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Calculate start and end of visible pages
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if at the start
      if (currentPage <= 2) {
        end = 4
      }
      // Adjust if at the end
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push(-1) // -1 represents ellipsis
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push(-2) // -2 represents ellipsis
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-64"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Patient ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Symptoms</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentAppointments.map((appointment, index) => (
              <TableRow key={appointment.id}>
                <TableCell>{startIndex + index + 1}</TableCell>
                <TableCell>{appointment.patientId}</TableCell>
                <TableCell>
                  {appointment.patientName} ({appointment.patientAge} years)
                </TableCell>
                <TableCell className="capitalize">{appointment.gender}</TableCell>
                <TableCell>{appointment.mobileNumber}</TableCell>
                <TableCell>{appointment.doctorName}</TableCell>
                <TableCell>
                  {new Date(appointment.date).toLocaleDateString()} {appointment.time}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {appointment.symptoms.map((symptom, i) => (
                      <Badge key={i} variant="secondary">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      appointment.priority === "emergency"
                        ? "destructive"
                        : appointment.priority === "urgent"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {appointment.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      appointment.status === "completed"
                        ? "default"
                        : appointment.status === "cancelled"
                        ? "destructive"
                        : appointment.status === "in-progress"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {appointment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(appointment.id, "cancelled")}
                      disabled={appointment.status === "completed" || appointment.status === "cancelled"}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAppointment(appointment.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 p-4 border-t">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </Button>
            {getPageNumbers().map((page, index) => (
              page < 0 ? (
                <Button key={`ellipsis-${index}`} variant="outline" size="sm" disabled>
                  ...
                </Button>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              &gt;
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 