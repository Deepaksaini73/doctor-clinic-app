"use client"

import { useState, useEffect } from "react"
import type { Appointment, Patient, Doctor } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import MainLayout from "@/components/layout/main-layout"
import PrescriptionEditor from "@/components/doctor_dashboard/prescription-editor"
import PatientList from "@/components/doctor_dashboard/Patient_List"
import PatientProfile from "@/components/doctor_dashboard/Patient_Profile"
import { database } from "@/lib/firebase"
import { ref, onValue, get } from "firebase/database"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Calendar, Users, Clock } from "lucide-react"

export default function DoctorDashboardPage() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [doctorName, setDoctorName] = useState("")
  const { toast } = useToast()

  // Fetch appointments
  useEffect(() => {
    const appointmentsRef = ref(database, 'appointments')

    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const appointmentsData = snapshot.val()

        // Convert object to array
        const appointmentsArray = Object.entries(appointmentsData).map(
          ([id, data]: [string, any]) => ({
            id,
            ...data,
          })
        )

        // Filter for today's appointments
        const today = new Date().toISOString().split("T")[0]
        const todaysAppointments = appointmentsArray.filter(
          (appointment) => appointment.date === today
        )

        setAppointments(todaysAppointments)
      } else {
        setAppointments([])
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Fetch patient data when appointment is selected
  useEffect(() => {
    if (selectedAppointment) {
      const fetchPatient = async () => {
        try {
          const patientsRef = ref(database, 'patients')
          const snapshot = await get(patientsRef)
          
          if (snapshot.exists()) {
            const patients = snapshot.val()
            const patientData = Object.values(patients).find(
              (p: any) => p.patientId === selectedAppointment.patientId
            )
            
            if (patientData) {
              setPatient(patientData as Patient)
            } else {
              toast({
                title: "Patient Not Found",
                description: "Could not find patient information.",
                variant: "destructive",
              })
              setPatient(null)
            }
          } else {
            toast({
              title: "No Patients Found",
              description: "No patient records found in the database.",
              variant: "destructive",
            })
            setPatient(null)
          }
        } catch (error) {
          console.error("Error fetching patient:", error)
          toast({
            title: "Error",
            description: "Failed to fetch patient data. Please try again.",
            variant: "destructive",
          })
          setPatient(null)
        }
      }

      fetchPatient()
    } else {
      setPatient(null)
    }
  }, [selectedAppointment, toast])

  // Get doctor's name from localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData) as Doctor
        setDoctorName(user.name)
      }
    } catch (error) {
      console.error("Error getting doctor's name:", error)
      toast({
        title: "Error",
        description: "Failed to load doctor information",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
  }

  return (
    <MainLayout 
      title={`Welcome back, ${doctorName || 'Doctor'}!`}  
      subtitle="Patient management and AI-assisted prescriptions"
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-doctor border-t-4 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Patients</p>
                  <h3 className="text-2xl font-bold text-gray-900">{appointments.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-doctor border-t-4 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Date</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-doctor border-t-4 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Time</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Patients */}
          <div className="lg:col-span-1">
            <Card className="border-doctor border-t-4 shadow-md">
              <CardContent className="p-0">
                <PatientList
                  appointments={appointments}
                  selectedAppointment={selectedAppointment}
                  isLoading={isLoading}
                  onSelectAppointment={handleSelectAppointment}
                />
              </CardContent>
            </Card>
          </div>

          {/* Patient Profile and Consultation */}
          <div className="lg:col-span-2 space-y-6">
            {selectedAppointment ? (
              <>
                {/* Patient Profile */}
                <Card className="border-doctor border-t-4 shadow-md">
                  <CardContent className="p-0">
                    <PatientProfile appointment={selectedAppointment} patient={patient} />
                  </CardContent>
                </Card>

                {/* AI-Assisted Prescription */}
                <Card className="border-doctor border-t-4 shadow-md">
                  <CardContent className="p-0">
                    <PrescriptionEditor 
                      appointment={selectedAppointment} 
                      symptoms={selectedAppointment.symptoms} 
                      onClose={() => setSelectedAppointment(null)} 
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-doctor border-t-4 shadow-md h-[calc(100vh-24rem)]">
                <CardContent className="h-full flex flex-col items-center justify-center p-6">
                  <div className="text-center space-y-4">
                    <Users className="h-12 w-12 text-gray-400 mx-auto" />
                    <h3 className="text-lg font-medium text-gray-900">No Patient Selected</h3>
                    <p className="text-gray-500 max-w-sm">
                      Select a patient from the list to view their details and create prescriptions
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
