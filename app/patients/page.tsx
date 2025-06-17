"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/main-layout"
import AppointmentHistory from "@/components/patient_dashboard/Appointment_History"
import MedicalHistory from "@/components/patient_dashboard/Medical_History"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { useToast } from "@/components/ui/use-toast"

interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientAge: number
  gender: string
  mobileNumber: string
  doctorId: string
  doctorName: string
  date: string
  time: string
  symptoms: string[]
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  priority: "routine" | "urgent" | "emergency"
  notes?: string
  createdAt: string
}

interface MedicalRecord {
  id: string
  patientId: string
  date: string
  doctorId: string
  doctorName: string
  diagnosis: string
  treatment: string
  notes: string
}

interface Prescription {
  id: string
  date: string
  doctorName: string
  medications: {
    name: string
    dosage: string
    frequency: string
    duration: string
  }[]
}

export default function PatientPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Fetch appointments
    const appointmentsRef = ref(database, 'appointments')
    const appointmentsUnsubscribe = onValue(appointmentsRef, (snapshot) => {
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

    // Fetch medical records
    const medicalRecordsRef = ref(database, 'medicalRecords')
    const medicalRecordsUnsubscribe = onValue(medicalRecordsRef, (snapshot) => {
      if (snapshot.exists()) {
        const recordsData = snapshot.val()
        const recordsArray = Object.entries(recordsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        })) as MedicalRecord[]
        setMedicalRecords(recordsArray)
      } else {
        setMedicalRecords([])
      }
    })

    // Fetch prescriptions
    const prescriptionsRef = ref(database, 'prescriptions')
    const prescriptionsUnsubscribe = onValue(prescriptionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const prescriptionsData = snapshot.val()
        const prescriptionsArray = Object.entries(prescriptionsData).map(([id, data]: [string, any]) => ({
          id,
          ...data,
          medications: data.medicines || [] // Map medicines to medications to match the interface
        })) as Prescription[]
        setPrescriptions(prescriptionsArray)
      } else {
        setPrescriptions([])
      }
    })

    setIsLoading(false)

    // Cleanup subscriptions
    return () => {
      appointmentsUnsubscribe()
      medicalRecordsUnsubscribe()
      prescriptionsUnsubscribe()
    }
  }, [])

  return (
    <MainLayout title="Patient Dashboard" subtitle="View your appointments, medical history, and prescriptions">
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