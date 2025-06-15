"use client"

import { FileText, Pill } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MedicalRecord {
  id: string
  date: string
  diagnosis: string
  doctorName: string
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

interface EnhancedMedicalHistoryProps {
  medicalRecords: MedicalRecord[]
  prescriptions: Prescription[]
  isLoading: boolean
}

export default function EnhancedMedicalHistory({ medicalRecords, prescriptions, isLoading }: EnhancedMedicalHistoryProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Medical History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {medicalRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{record.diagnosis}</h3>
                      <p className="text-sm text-gray-600">Dr. {record.doctorName}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">{record.date}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{record.notes}</p>
                </div>
              ))}
              {medicalRecords.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No medical records found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600" />
            Prescriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-600">Dr. {prescription.doctorName}</p>
                    <Badge className="bg-blue-100 text-blue-800">{prescription.date}</Badge>
                  </div>
                  <div className="mt-2 space-y-2">
                    {prescription.medications.map((med, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded">
                        <p className="font-medium text-gray-900">{med.name}</p>
                        <p className="text-sm text-gray-600">
                          {med.dosage} - {med.frequency} for {med.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {prescriptions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No prescriptions found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 