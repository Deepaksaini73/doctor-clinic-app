"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/main-layout"
import AppointmentHistory from "@/components/patient_dashboard/Appointment_History"
import MedicalHistory from "@/components/patient_dashboard/Medical_History"
import type { Appointment } from "@/lib/types"

export default function PatientPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [medicalRecords, setMedicalRecords] = useState([])
  const [prescriptions, setPrescriptions] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointments
        const appointmentsResponse = await fetch("/api/appointments")
        const appointmentsData = await appointmentsResponse.json()
        setAppointments(appointmentsData)

        // Fetch medical records
        const recordsResponse = await fetch("/api/medical-records")
        const recordsData = await recordsResponse.json()
        setMedicalRecords(recordsData)

        // Fetch prescriptions
        const prescriptionsResponse = await fetch("/api/prescriptions")
        const prescriptionsData = await prescriptionsResponse.json()
        setPrescriptions(prescriptionsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            View your appointments, medical history, and prescriptions
          </p>
        </div>

        <AppointmentHistory appointments={appointments} isLoading={isLoading} />
        <MedicalHistory
          medicalRecords={medicalRecords}
          prescriptions={prescriptions}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  )
} 