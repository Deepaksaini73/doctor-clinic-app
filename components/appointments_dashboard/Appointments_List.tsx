"use client"

import { useState, useEffect } from "react"
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
import { MoreHorizontal, X } from "lucide-react"
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
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setUserRole(user.role)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

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
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`).getTime()
    const dateB = new Date(`${b.date}T${b.time}`).getTime()
    const today = new Date().setHours(0, 0, 0, 0)
    
    // If both dates are today, sort by time
    if (new Date(a.date).setHours(0, 0, 0, 0) === today && 
        new Date(b.date).setHours(0, 0, 0, 0) === today) {
      return dateA - dateB
    }
    
    // If only one date is today, put it first
    if (new Date(a.date).setHours(0, 0, 0, 0) === today) return -1
    if (new Date(b.date).setHours(0, 0, 0, 0) === today) return 1
    
    // For other dates, sort chronologically
    return dateA - dateB
  })

  // Apply date filter after sorting
  const dateFilteredAppointments = filteredAppointments.filter(appointment => {
    if (dateFilter === "all") return true
    
    const appointmentDate = new Date(appointment.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    switch (dateFilter) {
      case "today":
        return appointmentDate.setHours(0, 0, 0, 0) === today.getTime()
      case "week":
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        return appointmentDate >= weekAgo
      case "month":
        const monthAgo = new Date(today)
        monthAgo.setMonth(today.getMonth() - 1)
        return appointmentDate >= monthAgo
      default:
        return true
    }
  })

  // Calculate pagination for filtered appointments
  const totalPages = Math.ceil(dateFilteredAppointments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAppointments = dateFilteredAppointments.slice(startIndex, endIndex)

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
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-extrabold text-gray-900">Appointments Overview</h2>
        
        <div className="text-black flex flex-wrap lg:flex-nowrap gap-3 items-center w-full md:w-auto">
          {/* Search Type and Input */}
          <Select 
            value={searchType} 
            onValueChange={(value: "patient" | "doctor") => setSearchType(value)}
          >
            <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm w-full lg:w-[150px]">
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-lg">
              <SelectItem value="patient">Patient</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder={`Search by ${searchType}...`}
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 bg-white text-gray-900 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm w-full"
            />
          </div>

          {/* Date Filter */}
          <Select 
            value={dateFilter} 
            onValueChange={(value: "all" | "today" | "week" | "month") => setDateFilter(value)}
          >
            <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm w-full lg:w-[150px]">
              <SelectValue placeholder="Date Filter" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-lg">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm w-full lg:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-lg">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm w-full lg:w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-lg">
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="routine">Routine</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {(searchQuery || dateFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all") && (
        <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-inner mt-4">
          <span className="font-semibold text-gray-700 mr-2">Active Filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="text-gray-900 bg-white border border-gray-200 px-3 py-1 flex items-center group">
              Search: <span className="font-normal ml-1 text-gray-700">"{searchQuery}"</span>
              <button onClick={() => setSearchQuery("")} className="ml-2 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><X className="h-4 w-4" /></button>
            </Badge>
          )}
          {dateFilter !== "all" && (
            <Badge variant="secondary" className="text-gray-900 bg-white border border-gray-200 px-3 py-1 flex items-center group">
              Date: <span className="font-normal ml-1 capitalize">{dateFilter === "today" ? "Today" : dateFilter === "week" ? "This Week" : "This Month"}</span>
              <button onClick={() => setDateFilter("all")} className="ml-2 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><X className="h-4 w-4" /></button>
            </Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="text-gray-900 bg-white border border-gray-200 px-3 py-1 flex items-center group">
              Status: <span className="font-normal ml-1 capitalize">{statusFilter}</span>
              <button onClick={() => setStatusFilter("all")} className="ml-2 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><X className="h-4 w-4" /></button>
            </Badge>
          )}
          {priorityFilter !== "all" && (
            <Badge variant="secondary" className="text-gray-900 bg-white border border-gray-200 px-3 py-1 flex items-center group">
              Priority: <span className="font-normal ml-1 capitalize">{priorityFilter}</span>
              <button onClick={() => setPriorityFilter("all")} className="ml-2 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><X className="h-4 w-4" /></button>
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
            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors px-3 py-1 h-auto"
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Update table styles for better contrast */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-md overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="bg-gray-100 text-gray-700 text-sm uppercase">
              <TableHead className="text-gray-700 font-semibold py-3">#</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Patient ID</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Patient</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Gender</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Contact</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Doctor</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Date & Time</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Symptoms</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Priority</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Status</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentAppointments.map((appointment, index) => (
              <TableRow key={appointment.id} className="text-gray-800 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <TableCell className="py-3">{startIndex + index + 1}</TableCell>
                <TableCell className="py-3 font-medium">{appointment.patientId}</TableCell>
                <TableCell className="py-3">{appointment.patientName} ({appointment.patientAge} years)</TableCell>
                <TableCell className="py-3 capitalize">{appointment.gender}</TableCell>
                <TableCell className="py-3">{appointment.mobileNumber}</TableCell>
                <TableCell className="py-3">{appointment.doctorName}</TableCell>
                <TableCell className="py-3">
                  <span className="block text-sm font-medium">{new Date(appointment.date).toLocaleDateString()}</span>
                  <span className="block text-xs text-gray-500">{appointment.time}</span>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {appointment.symptoms.map((symptom, i) => (
                      <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-800 px-2 py-0.5 text-xs rounded-full">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <Badge
                    variant={
                      appointment.priority === "emergency"
                        ? "destructive"
                        : appointment.priority === "urgent"
                        ? "default"
                        : "secondary"
                    }
                    className={`${
                      appointment.priority === "routine" ? "bg-green-100 text-green-800" :
                      appointment.priority === "urgent" ? "bg-orange-100 text-orange-800" :
                      "bg-red-100 text-red-800"
                    } px-2 py-0.5 text-xs rounded-full capitalize`}
                  >
                    {appointment.priority}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
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
                    className={`${
                      appointment.status === "scheduled" ? "bg-blue-110 text-blue-800" :
                      appointment.status === "in-progress" ? "bg-yellow-100 text-yellow-800" :
                      appointment.status === "completed" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    } px-2 py-0.5 text-xs rounded-full capitalize`}
                  >
                    {appointment.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(appointment.id, "cancelled")}
                      disabled={appointment.status === "completed" || appointment.status === "cancelled"}
                      className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 px-3 py-1 h-auto"
                    >
                      Cancel
                    </Button>
                    {userRole === "admin" && (
                      <>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Appointment Actions</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusUpdate(appointment.id, "in-progress")}>
                              Mark In-Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(appointment.id, "completed")}>
                              Mark Completed
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="px-3 py-1 h-auto"
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {currentAppointments.length === 0 && ( /* Handle no appointments found */
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center text-gray-500">
                  No appointments found for the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="text-black flex items-center justify-between mt-6 p-4 border-t border-gray-200 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-700">
            Showing {startIndex + 1} - {Math.min(endIndex, dateFilteredAppointments.length)} of {dateFilteredAppointments.length} appointments
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            >
              &lt;
            </Button>
            {getPageNumbers().map((page, index) => (
              page < 0 ? (
                <Button key={`ellipsis-${index}`} variant="outline" size="sm" disabled className="h-8 w-8 p-0 bg-white border-gray-300 text-gray-700">
                  ...
                </Button>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`${currentPage === page ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-blue-600"} h-8 w-8 p-0 transition-colors`}
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
              className="h-8 w-8 p-0 bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            >
              &gt;
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}