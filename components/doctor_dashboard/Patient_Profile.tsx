"use client"

import { useState, useEffect } from "react"
import { User, Clock, AlertTriangle, History, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Patient } from "@/lib/types"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import { useToast } from "@/components/ui/use-toast"

interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientAge: number
  gender: string
  contact: string
  doctorId: string
  doctorName: string
  date: string
  time: string
  symptoms: string[]
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  priority: "routine" | "urgent" | "emergency"
  notes?: string
  diagnosis?: string
  createdAt: string
}

interface Visit {
  id: string
  date: string
  doctorId: string
  doctorName: string
  symptoms: string[]
  diagnosis: string
  prescription: {
    id: string
    medicines: Array<{
      name: string
      dosage: string
      frequency: string
      duration: string
      notes?: string
    }>
    instructions: string
  }
}

interface EnhancedPatientProfileProps {
  appointment: Appointment
  patient: Patient | null
}

export default function PatientProfile({ appointment, patient }: EnhancedPatientProfileProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [pastVisits, setPastVisits] = useState<Visit[]>([])
  const [isLoadingVisits, setIsLoadingVisits] = useState(false)
  const { toast } = useToast()

  const fetchPastVisits = async () => {
    if (!appointment.patientId) return

    setIsLoadingVisits(true)
    try {
      // Fetch prescriptions
      const prescriptionsRef = ref(database, 'prescriptions')
      const prescriptionsSnapshot = await get(prescriptionsRef)
      
      if (prescriptionsSnapshot.exists()) {
        const prescriptions = prescriptionsSnapshot.val()
        const patientPrescriptions = Object.values(prescriptions).filter(
          (p: any) => p.patientId === appointment.patientId
        )

        // Fetch appointments for context
        const appointmentsRef = ref(database, 'appointments')
        const appointmentsSnapshot = await get(appointmentsRef)
        
        if (appointmentsSnapshot.exists()) {
          const appointments = appointmentsSnapshot.val()
          const patientAppointments = Object.values(appointments).filter(
            (a: any) => a.patientId === appointment.patientId && a.status === 'completed'
          )

          // Combine prescription and appointment data
          const visits = patientPrescriptions.map((prescription: any) => {
            const matchingAppointment = patientAppointments.find(
              (a: any) => a.id === prescription.appointmentId
            ) as Appointment | undefined
            
            return {
              id: prescription.id,
              date: prescription.date,
              doctorId: prescription.doctorId,
              doctorName: prescription.doctorName,
              symptoms: matchingAppointment?.symptoms || [],
              diagnosis: matchingAppointment?.diagnosis || '',
              prescription: {
                id: prescription.id,
                medicines: prescription.medicines,
                instructions: prescription.instructions
              }
            } as Visit
          })

          // Sort visits by date (most recent first)
          visits.sort((a: Visit, b: Visit) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )

          setPastVisits(visits)
        }
      }
    } catch (error) {
      console.error("Error fetching past visits:", error)
      toast({
        title: "Error",
        description: "Failed to fetch past visits. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingVisits(false)
    }
  }

  useEffect(() => {
    if (showHistory) {
      fetchPastVisits()
    }
  }, [showHistory, appointment.patientId])

  const PastHistoryModal = ({ isOpen, onClose, visits }: { isOpen: boolean; onClose: () => void; visits: Visit[] }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Medical History</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {isLoadingVisits ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : visits.length > 0 ? (
            <div className="space-y-6">
              {visits.map((visit) => (
                <div key={visit.id} className="border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{new Date(visit.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Doctor: {visit.doctorName}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Symptoms</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {visit.symptoms.map((symptom, idx) => (
                          <Badge key={idx} className="bg-blue-100 text-blue-800">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Diagnosis</h4>
                      <p className="text-sm">{visit.diagnosis}</p>
                    </div>
                    
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-gray-500">Prescription</h4>
                      <div className="mt-1 space-y-2">
                        {visit.prescription.medicines.map((medicine, idx) => (
                          <div key={idx} className="text-sm">
                            <p className="font-medium">{medicine.name}</p>
                            <p className="text-gray-600">
                              {medicine.dosage} - {medicine.frequency} for {medicine.duration}
                            </p>
                            {medicine.notes && (
                              <p className="text-gray-500 italic">{medicine.notes}</p>
                            )}
                          </div>
                        ))}
                        <p className="text-sm text-gray-600 mt-2">
                          Instructions: {visit.prescription.instructions}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No past visits found
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Patient Profile: {appointment.patientName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Age:</span> {appointment.patientAge} years
              </p>
              <p>
                <span className="font-medium">Gender:</span> {appointment?.gender}
              </p>
              <p>
                <span className="font-medium">Contact:</span> {appointment?.mobileNumber}
              </p>
              <p>
                <span className="font-medium">Patient ID:</span> {appointment.patientId}
              </p>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Current Symptoms</h4>
              <div className="flex flex-wrap gap-2">
                {appointment.symptoms.map((symptom, index) => (
                  <Badge key={index} className="bg-blue-100 text-blue-800">
                    {symptom}
                  </Badge>
                ))}
              </div>
            </div>

            {patient?.medicalHistory?.allergies && patient.medicalHistory.allergies.length > 0 && (
              <div className="mt-4">
                <h4 className="flex items-center text-sm font-medium text-gray-500 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                  Allergies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {patient.medicalHistory.allergies.map((allergy, index) => (
                    <Badge key={index} className="bg-red-100 text-red-800">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="flex items-center text-sm font-medium text-gray-500 mb-2">
              <Clock className="h-4 w-4 mr-1" />
              Medical History
            </h3>
            {patient?.medicalHistory?.chronicConditions && (
              <div>
                <h4 className="text-sm font-medium mb-2">Chronic Conditions</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {patient.medicalHistory.chronicConditions.map((condition, index) => (
                    <li key={index}>{condition}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setShowHistory(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <History className="h-4 w-4" />
              View Past Visits
            </button>
          </div>
        </div>

        <PastHistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          visits={pastVisits}
        />
      </CardContent>
    </Card>
  )
}