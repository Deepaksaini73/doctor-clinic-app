"use client"

import { useState } from "react"
import { Search, Filter, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { database } from "@/lib/firebase"
import { ref, update, remove } from "firebase/database"
import { useToast } from "@/hooks/use-toast"
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

interface EnhancedAppointmentsListProps {
  appointments: Appointment[]
  onSearch: (query: string) => void
}

export default function EnhancedAppointmentsList({ appointments, onSearch }: EnhancedAppointmentsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(Math.ceil(appointments.length / itemsPerPage))
  const [filteredAppointments, setFilteredAppointments] = useState(appointments)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query)
  }

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
              {filteredAppointments.map((appointment, index) => (
                <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{index + 1}</td>
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
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAppointments.length)} to {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} of {filteredAppointments.length} appointments
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              // Show first page, last page, current page, and pages around current page
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={pageNum === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              } else if (
                pageNum === currentPage - 2 ||
                pageNum === currentPage + 2
              ) {
                return <span key={pageNum}>...</span>;
              }
              return null;
            })}
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