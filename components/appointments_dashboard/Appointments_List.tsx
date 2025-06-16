"use client"

import { useState } from "react"
import { Search, Filter, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { database } from "@/lib/firebase"
import { ref, update, remove } from "firebase/database"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Appointment {
  id: string
  patientName: string
  notes: string
  doctorName: string
  date: string
  status: string
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

  // Calculate pagination
  const totalPages = Math.ceil(appointments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAppointments = appointments.slice(startIndex, endIndex)

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "Scheduled":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Scheduled</Badge>
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Appointments</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search"
                className="pl-10 w-64"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">No</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Patient Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Notes</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Doctor Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Appointment Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {currentAppointments.map((appointment, index) => (
                <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{startIndex + index + 1}</td>
                  <td className="py-3 px-4 font-medium">{appointment.patientName}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{appointment.notes}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">
                          {appointment.doctorName.split(" ")[1]?.charAt(0)}
                        </span>
                      </div>
                      {appointment.doctorName}
                    </div>
                  </td>
                  <td className="py-3 px-4">{appointment.date}</td>
                  <td className="py-3 px-4">{getStatusBadge(appointment.status)}</td>
                  <td className="py-3 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {appointment.status !== 'Completed' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(appointment.id, 'Completed')}
                          >
                            Mark as Completed
                          </DropdownMenuItem>
                        )}
                        {appointment.status !== 'Scheduled' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(appointment.id, 'Scheduled')}
                          >
                            Mark as Scheduled
                          </DropdownMenuItem>
                        )}
                        {appointment.status !== 'Cancelled' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(appointment.id, 'Cancelled')}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4">
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
      </CardContent>
    </Card>
  )
} 