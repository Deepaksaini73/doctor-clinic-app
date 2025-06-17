"use client"

import { useState, useEffect } from "react"
import { User, Clock, AlertTriangle, History, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Patient } from "@/lib/types"
import { database } from "@/lib/firebase"
import { ref, get ,update } from "firebase/database"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus } from "lucide-react"
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from "@/components/ui/table"

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
  symptoms?: string[] // Make symptoms optional
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
    followUp: string
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
  const [newSymptom, setNewSymptom] = useState("")
  const [isUpdatingSymptoms, setIsUpdatingSymptoms] = useState(false)
  const { toast } = useToast()



  const handleAddSymptom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSymptom.trim() || !appointment) return

    setIsUpdatingSymptoms(true)
    try {
      const currentSymptoms = appointment.symptoms || []
      const updatedSymptoms = [...currentSymptoms, newSymptom.trim()]
      
      await update(ref(database, `appointments/${appointment.id}`), {
        symptoms: updatedSymptoms
      })
      
      appointment.symptoms = updatedSymptoms
      setNewSymptom("")
      toast({
        title: "Symptom Added",
        description: "The symptom has been added successfully."
      })
    } catch (error) {
      console.error("Error adding symptom:", error)
      toast({
        title: "Error",
        description: "Failed to add symptom. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingSymptoms(false)
    }
  }

  const handleRemoveSymptom = async (indexToRemove: number) => {
    if (!appointment?.symptoms) return
    
    setIsUpdatingSymptoms(true)
    try {
      const updatedSymptoms = appointment.symptoms.filter((_, index) => index !== indexToRemove)
      await update(ref(database, `appointments/${appointment.id}`), {
        symptoms: updatedSymptoms
      })
      
      appointment.symptoms = updatedSymptoms
      toast({
        title: "Symptom Removed",
        description: "The symptom has been removed successfully."
      })
    } catch (error) {
      console.error("Error removing symptom:", error)
      toast({
        title: "Error",
        description: "Failed to remove symptom. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingSymptoms(false)
    }
  }
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
              diagnosis: prescription.diagnosis || '',
              prescription: {
                id: prescription.id,
                medicines: prescription.medicines,
                instructions: prescription.instructions,
                followUp: prescription.followUp || ''
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Medical History</h2>
              <p className="text-sm text-gray-500 mt-1">View past visits and prescriptions</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {isLoadingVisits ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : visits.length > 0 ? (
            <div className="space-y-8">
              {visits.map((visit) => (
                <Card key={visit.id} className="border-doctor border-t-4 shadow-sm">
                  <CardHeader className="bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-semibold text-gray-900">Visit on {new Date(visit.date).toLocaleDateString()}</CardTitle>
                        <CardDescription className="mt-1 text-gray-600">Doctor: {visit.doctorName}</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-white text-gray-600">
                        {new Date(visit.date).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {visit.symptoms.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Symptoms</h3>
                        <div className="flex flex-wrap gap-2">
                          {visit.symptoms.map((symptom, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-100">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Diagnosis</h3>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="text-gray-700">{visit.diagnosis}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Medications</h3>
                      <div className="border rounded-lg overflow-hidden shadow-sm">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="font-semibold text-gray-700">Medicine</TableHead>
                              <TableHead className="font-semibold text-gray-700">Dosage</TableHead>
                              <TableHead className="font-semibold text-gray-700">Frequency</TableHead>
                              <TableHead className="font-semibold text-gray-700">Duration</TableHead>
                              {visit.prescription.medicines.some(med => med.notes) && (
                                <TableHead className="font-semibold text-gray-700">Notes</TableHead>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {visit.prescription.medicines.map((medicine, index) => (
                              <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <TableCell className="font-medium text-gray-900">{medicine.name}</TableCell>
                                <TableCell className="text-gray-700">{medicine.dosage}</TableCell>
                                <TableCell className="text-gray-700">{medicine.frequency}</TableCell>
                                <TableCell className="text-gray-700">{medicine.duration}</TableCell>
                                {visit.prescription.medicines.some(med => med.notes) && (
                                  <TableCell className="text-gray-600">{medicine.notes}</TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {visit.prescription.instructions && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Instructions</h3>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <p className="text-gray-700">{visit.prescription.instructions}</p>
                        </div>
                      </div>
                    )}

                    {visit.prescription.followUp && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Follow-up</h3>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <p className="text-gray-700">{visit.prescription.followUp}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8 border border-gray-100">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Past Visits</h3>
                <p className="text-gray-500">This patient has no previous visit records.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="border-doctor border-t-4 shadow-sm">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
          <User className="h-6 w-6 text-blue-600" />
          Patient Profile: {appointment.patientName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 w-24">Age:</span>
                  <span className="text-gray-900">{appointment.patientAge} years</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 w-24">Gender:</span>
                  <span className="text-gray-900">{appointment?.gender}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 w-24">Contact:</span>
                  <span className="text-gray-900">{appointment?.mobileNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 w-24">Patient ID:</span>
                  <span className="text-gray-900 font-mono">{appointment.patientId}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Symptoms</h4>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(appointment?.symptoms || []).map((symptom, index) => (
                    <Badge 
                      key={index} 
                      className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
                    >
                      {symptom}
                      <button
                        onClick={() => handleRemoveSymptom(index)}
                        className="ml-1 hover:text-red-600 focus:outline-none transition-colors"
                        disabled={isUpdatingSymptoms}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <form onSubmit={handleAddSymptom} className="flex gap-2">
                  <Input
                    type="text"
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                    placeholder="Add new symptom..."
                    className="flex-1 focus:ring-2 focus:ring-blue-500"
                    disabled={isUpdatingSymptoms}
                  />
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={!newSymptom.trim() || isUpdatingSymptoms}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add
                  </Button>
                </form>
                
                {isUpdatingSymptoms && (
                  <div className="text-sm text-blue-600 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                    Updating symptoms...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center text-lg font-semibold text-gray-900">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                Medical History
              </h3>
              <Button
                onClick={() => setShowHistory(true)}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-colors"
              >
                <History className="h-4 w-4 mr-2" />
                View Past Visits
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {patient?.medicalHistory?.chronicConditions && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Chronic Conditions</h4>
                  <ul className="space-y-2">
                    {patient.medicalHistory.chronicConditions.map((condition, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {patient?.medicalHistory?.allergies && patient.medicalHistory.allergies.length > 0 && (
                <div>
                  <h4 className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                    Allergies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {patient.medicalHistory.allergies.map((allergy, index) => (
                      <Badge key={index} className="bg-red-50 text-red-700 border border-red-100 px-3 py-1.5">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
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