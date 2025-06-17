"use client"

import { Pill, Calendar, Clock, User, AlertCircle, Stethoscope } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

const formatSafeDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return dateString
    }
    return format(date, "MMMM d, yyyy 'at' h:mm a")
  } catch (error) {
    console.error("Date formatting error:", error)
    return dateString
  }
}

interface Prescription {
  id: string
  date: string
  doctorName: string
  department?: string
  status?: string
  symptoms?: string[]
  medications: {
    name: string
    dosage: string
    frequency: string
    duration: string
    notes?: string
  }[]
  instructions?: string
  followUp?: string
}

interface EnhancedMedicalHistoryProps {
  prescriptions: Prescription[]
  isLoading: boolean
}

export default function MedicalHistory({ prescriptions, isLoading }: EnhancedMedicalHistoryProps) {
  return (
    <Card className="h-[600px]">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-blue-600" />
          Medical History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-[500px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="h-[500px] overflow-y-auto px-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <div className="space-y-4 py-4">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Header with date and status */}
                  <div className="bg-blue-50 p-4 border-b hover:bg-blue-100 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          {formatSafeDate(prescription.date)}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="capitalize bg-white border-blue-200 text-blue-700"
                      >
                        {prescription.status || "Prescribed"}
                      </Badge>
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="p-4 space-y-4">
                    {/* Doctor Information */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Dr. {prescription.doctorName}</h3>
                        <p className="text-sm text-gray-600">{prescription.department || "General Medicine"}</p>
                      </div>
                    </div>

                    {/* Symptoms if available */}
                    {prescription.symptoms && prescription.symptoms.length > 0 && (
                      <div className="border-t pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Symptoms</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {prescription.symptoms.map((symptom, idx) => (
                            <Badge key={idx} variant="secondary">{symptom}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medications */}
                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Pill className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Medications</span>
                      </div>
                      <div className="space-y-3">
                        {prescription.medications.map((med, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-gray-900">{med.name}</h4>
                              <Badge>{med.dosage}</Badge>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{med.frequency}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{med.duration}</span>
                              </div>
                            </div>
                            {med.notes && (
                              <p className="text-sm text-gray-500 border-t mt-2 pt-2">
                                {med.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Instructions if available */}
                    {prescription.instructions && (
                      <div className="border-t pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Stethoscope className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Instructions</span>
                        </div>
                        <p className="text-sm text-gray-600">{prescription.instructions}</p>
                      </div>
                    )}

                    {/* Follow-up Details if available */}
                    {prescription.followUp && (
                      <div className="border-t pt-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-600">
                            Follow-up on {formatSafeDate(prescription.followUp)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {prescriptions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {isLoading ? "Loading..." : "No prescriptions found for this patient"}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}