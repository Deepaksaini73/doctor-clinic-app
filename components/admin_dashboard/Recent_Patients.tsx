"use client"

import { useState, useEffect } from "react"
import { Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  EnhancedCard,
  EnhancedCardContent,
  EnhancedCardHeader,
  EnhancedCardTitle,
} from "@/components/ui/enhanced-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { CardSkeleton } from "@/components/ui/loading-skeleton"
import { database } from "@/lib/firebase"
import { ref, onValue, remove } from "firebase/database"
import { useToast } from "@/hooks/use-toast"

interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientAge: number
  gender: string
  mobileNumber: string
  time: string
  symptoms: string
  priority: "Low" | "Medium" | "High"
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed"
  createdAt: number
}

export default function RecentPatients() {
  const [isLoading, setIsLoading] = useState(true)
  const [recentPatients, setRecentPatients] = useState<Appointment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const patientsPerPage = 10
  const { toast } = useToast()

  useEffect(() => {
    const appointmentsRef = ref(database, 'appointments')
    onValue(appointmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const appointmentsData = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...(data as Omit<Appointment, 'id'>)
        }))
        setRecentPatients(appointmentsData)
      } else {
        setRecentPatients([])
      }
      setIsLoading(false)
    })
  }, [])

  const handleDelete = async (appointmentId: string) => {
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
        description: "Failed to delete appointment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredPatients = recentPatients.filter(appointment =>
    appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.mobileNumber.includes(searchQuery)
  )

  // Calculate pagination
  const indexOfLastPatient = currentPage * patientsPerPage
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient)
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <EnhancedCard hover shadow="lg">
      <EnhancedCardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <EnhancedCardTitle>Recent Appointments</EnhancedCardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </EnhancedCardHeader>
      <EnhancedCardContent>
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Patient ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Patient Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Gender</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Age</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Phone Number</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPatients.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200"
                >
                  <td className="py-3 px-4 text-sm font-mono">{appointment.patientId}</td>
                  <td className="py-3 px-4 text-sm font-medium">{appointment.patientName}</td>
                  <td className="py-3 px-4 text-sm">{appointment.gender}</td>
                  <td className="py-3 px-4 text-sm">{appointment.patientAge}</td>
                  <td className="py-3 px-4 text-sm">{appointment.mobileNumber}</td>
                  <td className="py-3 px-4 text-sm">
                    <Badge className="bg-blue-100 text-blue-800">{appointment.time}</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-2">
                      <AnimatedButton variant="ghost" size="sm" animation="pulse">
                        <Edit className="h-4 w-4" />
                      </AnimatedButton>
                      <AnimatedButton 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(appointment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </AnimatedButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            currentPatients.map((appointment) => (
              <EnhancedCard key={appointment.id} hover>
                <EnhancedCardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                      <p className="text-sm text-gray-500">
                        <span className="font-mono text-xs">ID: {appointment.patientId}</span> | {appointment.gender} • {appointment.patientAge}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">{appointment.time}</Badge>
                  </div>

                  <div className="space-y-2 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-1">{appointment.mobileNumber}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <AnimatedButton variant="outline" size="sm" icon={<Edit className="h-4 w-4" />}>
                      Edit
                    </AnimatedButton>
                    <AnimatedButton
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => handleDelete(appointment.id)}
                    >
                      Delete
                    </AnimatedButton>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex justify-center items-center gap-2">
          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </AnimatedButton>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <AnimatedButton
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </AnimatedButton>
            ))}
          </div>
          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </AnimatedButton>
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  )
}
