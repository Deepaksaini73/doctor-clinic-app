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
import { useToast } from "@/components/ui/use-toast"

interface Patient {
  id: string
  name: string
  gender: string
  dateOfBirth: string
  phoneNumber: string
  bloodType: string
}

export default function RecentPatients() {
  const [isLoading, setIsLoading] = useState(true)
  const [recentPatients, setRecentPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const patientsRef = ref(database, 'patients')
    onValue(patientsRef, (snapshot) => {
      if (snapshot.exists()) {
        const patientsData = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...(data as Omit<Patient, 'id'>)
        }))
        setRecentPatients(patientsData)
      } else {
        setRecentPatients([])
      }
      setIsLoading(false)
    })
  }, [])

  const handleDelete = async (patientId: string) => {
    try {
      const patientRef = ref(database, `patients/${patientId}`)
      await remove(patientRef)
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting patient:", error)
      toast({
        title: "Error",
        description: "Failed to delete patient. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredPatients = recentPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phoneNumber.includes(searchQuery)
  )

  return (
    <EnhancedCard hover shadow="lg">
      <EnhancedCardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <EnhancedCardTitle>Recent Patients</EnhancedCardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              placeholder="Search patients..."
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
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Gender</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date of Birth</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Phone Number</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Blood Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200"
                >
                  <td className="py-3 px-4 text-sm font-mono">{patient.patientId}</td>
                  <td className="py-3 px-4 text-sm font-medium">{patient.name}</td>
                  <td className="py-3 px-4 text-sm">{patient.gender}</td>
                  <td className="py-3 px-4 text-sm">{patient.dateOfBirth}</td>
                  <td className="py-3 px-4 text-sm">{patient.phoneNumber}</td>
                  <td className="py-3 px-4 text-sm">
                    <Badge className="bg-blue-100 text-blue-800">{patient.bloodType}</Badge>
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
                        onClick={() => handleDelete(patient.id)}
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
            filteredPatients.map((patient) => (
              <EnhancedCard key={patient.id} hover>
                <EnhancedCardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-500">
                        <span className="font-mono text-xs">ID: {patient.id}</span> | {patient.gender} • {patient.dateOfBirth}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">{patient.bloodType}</Badge>
                  </div>

                  <div className="space-y-2 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-1">{patient.phoneNumber}</span>
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
                      onClick={() => handleDelete(patient.id)}
                    >
                      Delete
                    </AnimatedButton>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            ))
          )}
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  )
}
