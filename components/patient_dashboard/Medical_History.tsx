"use client"

import { Pill, Calendar, Clock, User, AlertCircle, Stethoscope, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from "@/components/ui/table"

const formatSafeDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return dateString
    }
    return format(date, "dd/MM/yyyy")
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
  diagnosis: string
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

export default function EnhancedMedicalHistory({ prescriptions, isLoading }: EnhancedMedicalHistoryProps) {
  return (
    <Card className="h-full shadow-lg border-0">
      <CardHeader className="border-b bg-gray-50/50">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Stethoscope className="h-6 w-6 text-blue-600" />
          Medical History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Stethoscope className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Medical Records</h3>
            <p className="text-gray-500">No medical history available for this patient</p>
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto max-h-[700px] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {prescriptions.map((prescription) => (
              <Card key={prescription.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gray-50/50 border-b p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold">Visit on {formatSafeDate(prescription.date)}</CardTitle>
                      <CardDescription className="mt-1 text-gray-600">Doctor: {prescription.doctorName}</CardDescription>
                    </div>
                    {prescription.status && (
                      <Badge variant={prescription.status === 'completed' ? 'default' : 'secondary'}>
                        {prescription.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {prescription.symptoms && prescription.symptoms.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3 text-gray-900">Symptoms</h3>
                      <div className="flex flex-wrap gap-2">
                        {prescription.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium mb-3 text-gray-900">Diagnosis</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">{prescription.diagnosis}</p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3 text-gray-900">Medications</h3>
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead className="text-gray-700 font-semibold">Medicine</TableHead>
                            <TableHead className="text-gray-700 font-semibold">Dosage</TableHead>
                            <TableHead className="text-gray-700 font-semibold">Frequency</TableHead>
                            <TableHead className="text-gray-700 font-semibold">Duration</TableHead>
                            {prescription.medications.some(med => med.notes) && (
                              <TableHead className="text-gray-700 font-semibold">Notes</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {prescription.medications.map((medicine, index) => (
                            <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <TableCell className="font-medium text-gray-800">{medicine.name}</TableCell>
                              <TableCell className="text-gray-700">{medicine.dosage}</TableCell>
                              <TableCell className="text-gray-700">{medicine.frequency}</TableCell>
                              <TableCell className="text-gray-700">{medicine.duration}</TableCell>
                              {medicine.notes && (
                                <TableCell className="text-gray-700">{medicine.notes}</TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {prescription.instructions && (
                    <div>
                      <h3 className="font-medium mb-3 text-gray-900">Instructions</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">{prescription.instructions}</p>
                    </div>
                  )}

                  {prescription.followUp && (
                    <div>
                      <h3 className="font-medium mb-3 text-gray-900">Follow-up</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">{prescription.followUp}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}