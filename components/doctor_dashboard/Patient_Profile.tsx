"use client"

import { User, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Appointment, Patient } from "@/lib/types"

interface EnhancedPatientProfileProps {
  appointment: Appointment
  patient: Patient | null
}

export default function PatientProfile({ appointment, patient }: EnhancedPatientProfileProps) {
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
                <span className="font-medium">Last Visit:</span>{" "}
                {patient?.medicalHistory?.pastVisits?.[0]?.date || "First visit"}
              </p>
              <p>
                <span className="font-medium">Patient ID:</span> {appointment.patientId}
              </p>
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
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {patient.medicalHistory.chronicConditions.map((condition, index) => (
                  <li key={index}>{condition}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 