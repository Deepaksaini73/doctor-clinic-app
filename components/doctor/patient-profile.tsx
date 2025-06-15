"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Appointment, Patient } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, Calendar, Clock } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PatientProfileProps {
  appointment: Appointment | null
  onSymptomsUpdate: (symptoms: string) => void
}

export default function PatientProfile({ appointment, onSymptomsUpdate }: PatientProfileProps) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [symptoms, setSymptoms] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (appointment) {
      setSymptoms(appointment.symptoms.join(", "))
      fetchPatient(appointment.patientId)
    } else {
      setPatient(null)
      setSymptoms("")
    }
  }, [appointment])

  const fetchPatient = async (patientId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/patients/${patientId}`)

      if (!response.ok) throw new Error("Failed to fetch patient data")

      const data = await response.json()
      setPatient(data)
    } catch (error) {
      console.error("Error fetching patient:", error)
      toast({
        title: "Error",
        description: "Failed to load patient data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSymptomsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSymptoms(e.target.value)
  }

  const handleUpdateSymptoms = () => {
    onSymptomsUpdate(symptoms)
  }

  if (!appointment) {
    return (
      <Card className="h-full flex items-center justify-center border-doctor border-t-4">
        <CardContent className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg text-gray-500">Select an appointment to view patient details</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full border-doctor border-t-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{appointment.patientName}</CardTitle>
            <CardDescription>
              Age: {appointment.patientAge} •
              {appointment.priority === "urgent" && (
                <Badge variant="destructive" className="ml-2">
                  Urgent
                </Badge>
              )}
              {appointment.priority === "emergency" && (
                <Badge variant="destructive" className="ml-2 bg-red-700">
                  Emergency
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="mr-1 h-4 w-4" />
              {appointment.date}
            </div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Clock className="mr-1 h-4 w-4" />
              {appointment.time}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            <strong>ML Integration Point:</strong> Patient history will be analyzed by your ML system to provide
            personalized care recommendations.
          </AlertDescription>
        </Alert>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            <div>
              <h3 className="font-medium mb-2">Current Symptoms</h3>
              <Textarea
                value={symptoms}
                onChange={handleSymptomsChange}
                className="min-h-[100px]"
                placeholder="Describe current symptoms"
              />
              <Button onClick={handleUpdateSymptoms} className="mt-2 bg-doctor hover:bg-green-700" size="sm">
                Update Symptoms
              </Button>
            </div>

            {patient && patient.medicalHistory && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="allergies">
                  <AccordionTrigger>Allergies</AccordionTrigger>
                  <AccordionContent>
                    {patient.medicalHistory.allergies.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {patient.medicalHistory.allergies.map((allergy, index) => (
                          <li key={index}>{allergy}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No known allergies</p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="conditions">
                  <AccordionTrigger>Chronic Conditions</AccordionTrigger>
                  <AccordionContent>
                    {patient.medicalHistory.chronicConditions.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {patient.medicalHistory.chronicConditions.map((condition, index) => (
                          <li key={index}>{condition}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No chronic conditions</p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="history">
                  <AccordionTrigger>Past Visits</AccordionTrigger>
                  <AccordionContent>
                    {patient.medicalHistory.pastVisits.length > 0 ? (
                      <div className="space-y-3">
                        {patient.medicalHistory.pastVisits.map((visit) => (
                          <div key={visit.id} className="border-l-2 border-gray-200 pl-3">
                            <p className="text-sm font-medium">
                              {visit.date} - {visit.doctorName}
                            </p>
                            <p className="text-sm">Diagnosis: {visit.diagnosis}</p>
                            <p className="text-sm text-gray-500">Symptoms: {visit.symptoms.join(", ")}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No past visits</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
