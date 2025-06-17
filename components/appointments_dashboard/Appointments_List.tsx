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

  // Add new state declarations
  const [searchType, setSearchType] = useState<"patient" | "doctor">("patient")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

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

  // Update filteredAppointments logic
  const filteredAppointments = appointments.filter(appointment => {
    // Date filtering
    if (dateFilter !== "all") {
      const appointmentDate = new Date(appointment.date)
      const today = new Date()
      switch (dateFilter) {
        case "today":
          return appointmentDate.toDateString() === today.toDateString()
        case "week":
          const weekAgo = new Date(today.setDate(today.getDate() - 7))
          return appointmentDate >= weekAgo
        case "month":
          const monthAgo = new Date(today.setMonth(today.getMonth() - 1))
          return appointmentDate >= monthAgo
      }
    }

    // Status filtering
    if (statusFilter !== "all" && appointment.status !== statusFilter) return false

    // Priority filtering
    if (priorityFilter !== "all" && appointment.priority !== priorityFilter) return false

    // Search filtering
    if (searchQuery) {
      if (searchType === "patient") {
        return appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase())
      } else {
        return appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
      }
    }

    return true
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
        
        <div className="text-black grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
          {/* Search Type and Input */}
          <Select value={searchType} onValueChange={setSearchType}>
            <SelectTrigger>
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="patient">Patient</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder={`Search by ${searchType}...`}
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 bg-white text-gray-900"
            />
          </div>

          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Date Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap gap-2">
        {(searchQuery || dateFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all") && (
          <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md">
            {searchQuery && (
              <Badge variant="secondary" className="text-gray-900">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery("")} className="ml-2">×</button>
              </Badge>
            )}
            {dateFilter !== "all" && (
              <Badge variant="secondary" className="text-gray-900">
                Date: {dateFilter}
                <button onClick={() => setDateFilter("all")} className="ml-2">×</button>
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="text-gray-900">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter("all")} className="ml-2">×</button>
              </Badge>
            )}
            {priorityFilter !== "all" && (
              <Badge variant="secondary" className="text-gray-900">
                Priority: {priorityFilter}
                <button onClick={() => setPriorityFilter("all")} className="ml-2">×</button>
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setDateFilter("all")
                setStatusFilter("all")
                setPriorityFilter("all")
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {/* Update table styles for better contrast */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-gray-900">#</TableHead>
              <TableHead className="text-gray-900">Patient ID</TableHead>
              <TableHead className="text-gray-900">Patient</TableHead>
              <TableHead className="text-gray-900">Gender</TableHead>
              <TableHead className="text-gray-900">Contact</TableHead>
              <TableHead className="text-gray-900">Doctor</TableHead>
              <TableHead className="text-gray-900">Date & Time</TableHead>
              <TableHead className="text-gray-900">Symptoms</TableHead>
              <TableHead className="text-gray-900">Priority</TableHead>
              <TableHead className="text-gray-900">Status</TableHead>
              <TableHead className="text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentAppointments.map((appointment, index) => (
              <TableRow key={appointment.id} className="text-gray-900">
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
        <div className="text-black flex items-center justify-between mt-4 p-4 border-t">
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