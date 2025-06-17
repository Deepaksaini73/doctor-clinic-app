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
  patientId: string
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
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
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

  const selectedPatientRecords = medicalRecords.filter(
    record => record.patientId === selectedPatient
  )
  const selectedPatientPrescriptions = prescriptions.filter(
    prescription => prescription.patientId === selectedPatient
  )

  return (
    <MainLayout title="Patient Dashboard" subtitle="View your appointments, medical history, and prescriptions">
      <div className="space-y-6">
        <AppointmentHistory 
          appointments={appointments} 
          isLoading={isLoading}
          onPatientSelect={(patientId) => setSelectedPatient(patientId)}
          selectedPatientId={selectedPatient}
        />
        
        {selectedPatient ? (
          <MedicalHistory
            // medicalRecords={selectedPatientRecords}
            prescriptions={selectedPatientPrescriptions}
            isLoading={isLoading}
          />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
            <h3 className="text-lg font-medium text-gray-900">No Patient Selected</h3>
            <p className="text-gray-500">Select a patient from above to view their medical history</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
} 