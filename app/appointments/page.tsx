"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import MainLayout from "@/components/layout/main-layout"
import AppointmentsList from "@/components/appointments_dashboard/Appointments_List"
import CreateAppointment from "@/components/appointments_dashboard/Create_Appointment"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { useToast } from "@/hooks/use-toast"


interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientAge: number
  doctorId: string
  doctorName: string
  date: string
  time: string
  symptoms: string[]
  status: string
  priority: string
}

interface Doctor {
  id: string
  name: string
  specialization: string
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    symptoms: [] as string[],
    status: "scheduled",
    priority: "routine"
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const appointmentsRef = ref(database, 'appointments')
    
    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const appointmentsData = snapshot.val()
        const appointmentsArray = Object.entries(appointmentsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        })) as Appointment[]
        // Sort appointments by date and time
        appointmentsArray.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`).getTime()
          const dateB = new Date(`${b.date}T${b.time}`).getTime()
          return dateA - dateB
        })
        setAppointments(appointmentsArray)
      } else {
        setAppointments([])
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const doctorsRef = ref(database, 'doctors')
    
    const unsubscribe = onValue(doctorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const doctorsData = snapshot.val()
        const doctorsArray = Object.entries(doctorsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        })) as Doctor[]
        setDoctors(doctorsArray)
      } else {
        setDoctors([])
      }
    })

    return () => unsubscribe()
  }, [])

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.symptoms.some(symptom => 
        symptom.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false)
    toast({
      title: "Success",
      description: "Appointment created successfully"
    })
  }

  return (
    <MainLayout title="Appointments" subtitle="Manage and track all appointments">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">List Appointments</h1>
            <p className="text-gray-600">Here is the latest update for the last 7 days, check now.</p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Appointment
          </Button>
        </div>

        {/* Create Appointment Modal */}
        <CreateAppointment
          isOpen={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          doctors={doctors}
          onSuccess={handleCreateSuccess}
        />

        {/* Appointments List */}
        <AppointmentsList 
          appointments={filteredAppointments} 
          onSearch={setSearchQuery} 
        />
      </div>
    </MainLayout>
  )
}
