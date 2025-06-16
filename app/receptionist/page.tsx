"use client"

import MainLayout from "@/components/layout/main-layout"
import VoiceBooking from "@/components/receptionist_dashboard/Voice_Booking"
import AppointmentsList from "@/components/receptionist_dashboard/Appointments_List"

export default function ReceptionistPage() {
  return (
    <MainLayout title="Welcome back, Sabrina!" subtitle="Here is the latest update for the last 7 days, check now.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Booking System */}
        <VoiceBooking onAppointmentCreated={() => {}} />

        {/* Today's Appointments */}
        <AppointmentsList />
      </div>
    </MainLayout>
  )
}
