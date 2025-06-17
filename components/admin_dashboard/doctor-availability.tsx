"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Doctor } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { database } from "@/lib/firebase"
import { ref, onValue, remove } from "firebase/database"
import { Trash2 } from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"


export default function DoctorAvailability() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const doctorsRef = ref(database, 'doctors')
    onValue(doctorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const doctorsData = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...(data as Omit<Doctor, 'id'>)
        }))
        setDoctors(doctorsData)
      } else {
        setDoctors([])
      }
      setIsLoading(false)
    }, (error) => {
      console.error("Error fetching doctors:", error)
      toast({
        title: "Error",
        description: "Failed to load doctor availability. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    })
  }, [toast])

  const handleDeleteDoctor = async (doctorId: string) => {
    try {
      const doctorRef = ref(database, `doctors/${doctorId}`)
      await remove(doctorRef)
      toast({
        title: "Success",
        description: "Doctor deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting doctor:", error)
      toast({
        title: "Error",
        description: "Failed to delete doctor. Please try again.",
        variant: "destructive",
      })
    }
  }

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  return (
    <Card className="border-admin border-t-4">
      <CardHeader>
        <CardTitle>Doctor Availability</CardTitle>
        <CardDescription>Weekly schedule for all doctors</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">Doctor</th>
                  {daysOfWeek.map((day) => (
                    <th key={day} className="text-center p-2 border-b">
                      {day}
                    </th>
                  ))}
                  <th className="text-center p-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td className="p-2 border-b">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-admin bg-opacity-10 text-admin mr-2 flex items-center justify-center">
                          {doctor.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-xs text-gray-500">{doctor.specialization}</div>
                        </div>
                      </div>
                    </td>
                    {daysOfWeek.map((day) => (
                      <td key={day} className="text-center p-2 border-b">
                        {doctor.availability?.days?.includes(day) ? (
                          <div>
                            <Badge className="bg-green-100 text-green-800 border-green-200">Available</Badge>
                            <div className="text-xs mt-1">{doctor.availability?.hours}</div>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-500">
                            Unavailable
                          </Badge>
                        )}
                      </td>
                    ))}
                    <td className="p-2 border-b text-center">
                      <AnimatedButton 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteDoctor(doctor.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </AnimatedButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
