"use client"

import { useState, useEffect } from "react"
import type { Appointment, Patient } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import MainLayout from "@/components/layout/main-layout"
import PrescriptionEditor from "@/components/doctor_dashboard/prescription-editor"
import PatientList from "@/components/doctor_dashboard/Patient_List"
import PatientProfile from "@/components/doctor_dashboard/Patient_Profile"

export default function DoctorDashboardPage() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
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

        // Select the first appointment by default
        if (data.length > 0 && !selectedAppointment) {
          setSelectedAppointment(data[0])
        }
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  // Fetch patient data when appointment is selected
  useEffect(() => {
    if (selectedAppointment) {
      const fetchPatient = async () => {
        try {
          const response = await fetch(`/api/patients/${selectedAppointment.patientId}`)
          if (!response.ok) throw new Error("Failed to fetch patient data")
          const data = await response.json()
          setPatient(data)
        } catch (error) {
          console.error("Error fetching patient:", error)
        }
      }

      fetchPatient()
    }
  }, [selectedAppointment])

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
  }

  return (
    <MainLayout title="Welcome back, Dr. Smith!" subtitle="Patient management and AI-assisted prescriptions">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Patients */}
        <PatientList
          appointments={appointments}
          selectedAppointment={selectedAppointment}
          isLoading={isLoading}
          onSelectAppointment={handleSelectAppointment}
        />

        {/* Patient Profile and Consultation */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAppointment ? (
            <>
              {/* Patient Profile */}
              <PatientProfile appointment={selectedAppointment} patient={patient} />

              {/* AI-Assisted Prescription */}
              <PrescriptionEditor appointment={selectedAppointment} symptoms={selectedAppointment.symptoms} />
            </>
          ) : (
            <Card className="h-64 flex items-center justify-center">
              <CardContent>
                <p className="text-gray-500 text-center">Select a patient to view details and create prescriptions</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
