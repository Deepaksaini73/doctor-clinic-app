"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/main-layout"
import VoiceBooking from "@/components/receptionist_dashboard/Voice_Booking"
import AppointmentsList from "@/components/receptionist_dashboard/Appointments_List"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  name: string
  role: string
}

export default function ReceptionistPage() {
  const [receptionistName, setReceptionistName] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData) as User
        setReceptionistName(user.name)
      }
    } catch (error) {
      console.error("Error getting receptionist's name:", error)
      toast({
        title: "Error",
        description: "Failed to load user information",
        variant: "destructive",
      })
    }
  }, [toast])

  return (
    <MainLayout 
      title={`Welcome back, ${receptionistName || 'Receptionist'}!`} 
      subtitle="Here is the latest update for the last 7 days, check now."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Booking System */}
        <VoiceBooking onAppointmentCreated={() => {}} />

        {/* Today's Appointments */}
        <AppointmentsList />
      </div>
    </MainLayout>
  )
}