"use client"

import { MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Patient {
  id: number
  name: string
  gender: string
  dateOfBirth: string
  address: string
  phone: string
  bloodType: string
}

interface EnhancedRecentPatientsProps {
  patients: Patient[]
}

export default function RecentPatients({ patients }: EnhancedRecentPatientsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Patients</CardTitle>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">No.</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Gender</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date of Birth</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Address</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Phone Number</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Blood Type</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, index) => (
                <tr key={patient.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4 font-medium">{patient.name}</td>
                  <td className="py-3 px-4">{patient.gender}</td>
                  <td className="py-3 px-4">{patient.dateOfBirth}</td>
                  <td className="py-3 px-4">{patient.address}</td>
                  <td className="py-3 px-4">{patient.phone}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline">{patient.bloodType}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
} 