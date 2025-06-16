"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/main-layout"
import AppointmentsList from "@/components/appointments_dashboard/Appointments_List"
import CreateAppointment from "@/components/appointments_dashboard/Create_Appointment"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([
    {
      id: 12,
      patientName: "Sabrina Gomez",
      notes: "I've been feeling really fatigued...",
      doctorName: "Dr. Mia Kensington",
      date: "March 15, 2026",
      status: "Completed",
    },
    {
      id: 13,
      patientName: "Alexandra Smith",
      notes: "I have a persistent headache...",
      doctorName: "Dr. Oliver Westwood",
      date: "April 20, 2026",
      status: "Completed",
    },
    {
      id: 14,
      patientName: "Benjamin Johnson",
      notes: "I've noticed some unusual br...",
      doctorName: "Dr. Sophia Langley",
      date: "May 5, 2026",
      status: "Scheduled",
    },
    {
      id: 15,
      patientName: "Avery Thompson",
      notes: "I feel short of breath even w...",
      doctorName: "Dr. Amelia Hawthorne",
      date: "June 10, 2026",
      status: "Completed",
    },
    {
      id: 16,
      patientName: "Olivia Brown",
      notes: "I've been having stomach pa...",
      doctorName: "Dr. Clara Whitmore",
      date: "July 25, 2026",
      status: "Scheduled",
    },
    {
      id: 17,
      patientName: "Brandon Davis",
      notes: "I keep experiencing sharp ch...",
      doctorName: "Dr. Elijah Stone",
      date: "August 30, 2026",
      status: "Scheduled",
    },
    {
      id: 18,
      patientName: "Amelia Wilson",
      notes: "I've had a cough that lingers...",
      doctorName: "Dr. Nathaniel Rivers",
      date: "September 15, 2026",
      status: "Cancelled",
    },
    {
      id: 19,
      patientName: "Charlotte Martinez",
      notes: "I'm feeling unusually anxious...",
      doctorName: "Dr. Victoria Ashford",
      date: "October 22, 2026",
      status: "Cancelled",
    },
  ])

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    doctorName: "",
    date: "",
    status: "Scheduled",
    notes: "",
  })

  const [searchQuery, setSearchQuery] = useState("")

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateAppointment = () => {
    const newId = Math.max(...appointments.map((a) => a.id)) + 1
    setAppointments([...appointments, { ...newAppointment, id: newId }])
    setNewAppointment({
      patientName: "",
      doctorName: "",
      date: "",
      status: "Scheduled",
      notes: "",
    })
    setIsCreateModalOpen(false)
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
          <CreateAppointment
            isOpen={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
            newAppointment={newAppointment}
            onNewAppointmentChange={setNewAppointment}
            onCreateAppointment={handleCreateAppointment}
          />
        </div>

        {/* Appointments List */}
        <AppointmentsList appointments={filteredAppointments} onSearch={setSearchQuery} />
      </div>
    </MainLayout>
  )
}
