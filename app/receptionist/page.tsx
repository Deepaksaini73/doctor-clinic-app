"use client"

import MainLayout from "@/components/layout/main-layout"
import EnhancedVoiceBooking from "@/components/receptionist_dashboard/Enhanced_Voice_Booking"
import EnhancedAppointmentsList from "@/components/receptionist_dashboard/Enhanced_Appointments_List"

export default function ReceptionistPage() {
  return (
    <MainLayout title="Welcome back, Sabrina!" subtitle="Here is the latest update for the last 7 days, check now.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Booking System */}

        <EnhancedVoiceBooking onAppointmentCreated={handleAppointmentCreated} />

        {/* Today's Appointments */}
        <EnhancedAppointmentsList appointments={appointments} isLoading={isLoading} />

        <VoiceBooking onAppointmentCreated={() => {}} />

        {/* Today's Appointments */}
        <AppointmentsList />

      </div>
    </MainLayout>
  )
}
