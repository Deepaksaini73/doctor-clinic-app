"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/main-layout"
<<<<<<< Updated upstream
import EnhancedAppointmentsList from "@/components/appointments_dashboard/Enhanced_Appointments_List"
import EnhancedCreateAppointment from "@/components/appointments_dashboard/Enhanced_Create_Appointment"
=======
import AppointmentsList from "@/components/appointments_dashboard/Appointments_List"
import CreateAppointment from "@/components/appointments_dashboard/Create_Appointment"
import { database } from "@/lib/firebase"
import { ref, onValue, push, set } from "firebase/database"
import { useToast } from "@/components/ui/use-toast"

interface Appointment {
  id: string
  patientName: string
  doctorName: string
  date: string
  status: string
  notes: string
  createdAt?: string
}
>>>>>>> Stashed changes

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    doctorName: "",
    date: "",
    status: "Scheduled",
    notes: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
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
        setAppointments(appointmentsArray)
      } else {
        setAppointments([])
      }
    })

    return () => unsubscribe()
  }, [])

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateAppointment = async () => {
    try {
      const appointmentsRef = ref(database, 'appointments')
      const newAppointmentRef = push(appointmentsRef)
      
      await set(newAppointmentRef, {
        ...newAppointment,
        createdAt: new Date().toISOString()
      })

      toast({
        title: "Success",
        description: "Appointment created successfully",
      })

      setNewAppointment({
        patientName: "",
        doctorName: "",
        date: "",
        status: "Scheduled",
        notes: "",
      })
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      })
    }
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
          <EnhancedCreateAppointment
            isOpen={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
            newAppointment={newAppointment}
            onNewAppointmentChange={setNewAppointment}
            onCreateAppointment={handleCreateAppointment}
          />
        </div>

        {/* Appointments List */}
        <EnhancedAppointmentsList appointments={filteredAppointments} onSearch={setSearchQuery} />
      </div>
    </MainLayout>
  )
}
