"use client"

import { useState, useEffect } from "react"
import type { Appointment } from "@/lib/types"
import MainLayout from "@/components/layout/main-layout"
import EnhancedVoiceBooking from "@/components/receptionist_dashboard/Enhanced_Voice_Booking"
import EnhancedAppointmentsList from "@/components/receptionist_dashboard/Enhanced_Appointments_List"

export default function ReceptionistPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true)
      try {
        const today = new Date().toISOString().split("T")[0]
        const response = await fetch(`/api/appointments?date=${today}`)
        if (!response.ok) throw new Error("Failed to fetch appointments")
        const data = await response.json()
        setAppointments(data)
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const handleAppointmentCreated = () => {
    // Refresh appointments list
    const fetchAppointments = async () => {
      try {
        const today = new Date().toISOString().split("T")[0]
        const response = await fetch(`/api/appointments?date=${today}`)
        if (!response.ok) throw new Error("Failed to fetch appointments")
        const data = await response.json()
        setAppointments(data)
      } catch (error) {
        console.error("Error fetching appointments:", error)
      }
    }
    fetchAppointments()
  }

  return (
    <MainLayout title="Welcome back, Sabrina!" subtitle="Here is the latest update for the last 7 days, check now.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Booking System */}
        <EnhancedVoiceBooking onAppointmentCreated={handleAppointmentCreated} />

        {/* Today's Appointments */}
        <EnhancedAppointmentsList appointments={appointments} isLoading={isLoading} />
      </div>
    </MainLayout>
  )
}
