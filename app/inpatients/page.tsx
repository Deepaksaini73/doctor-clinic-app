"use client"

import { useState } from "react"
import { UserPlus, Plus, Edit, Trash2, Bed, Clock, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import MainLayout from "@/components/layout/main-layout"

export default function InpatientsPage() {
  const [inpatients, setInpatients] = useState([
    {
      id: 1,
      patientName: "John Smith",
      age: 45,
      gender: "Male",
      roomNumber: "101",
      admissionDate: "2024-03-10",
      condition: "Post-surgery recovery",
      doctor: "Dr. Sarah Johnson",
      status: "Stable",
      expectedDischarge: "2024-03-20",
    },
    {
      id: 2,
      patientName: "Emily Davis",
      age: 32,
      gender: "Female",
      roomNumber: "102",
      admissionDate: "2024-03-12",
      condition: "Pneumonia treatment",
      doctor: "Dr. Michael Chen",
      status: "Improving",
      expectedDischarge: "2024-03-18",
    },
    {
      id: 3,
      patientName: "Robert Wilson",
      age: 67,
      gender: "Male",
      roomNumber: "201",
      admissionDate: "2024-03-08",
      condition: "Cardiac monitoring",
      doctor: "Dr. Sarah Johnson",
      status: "Critical",
      expectedDischarge: "2024-03-25",
    },
    {
      id: 4,
      patientName: "Lisa Anderson",
      age: 28,
      gender: "Female",
      roomNumber: "202",
      admissionDate: "2024-03-14",
      condition: "Maternity care",
      doctor: "Dr. Victoria Ashford",
      status: "Stable",
      expectedDischarge: "2024-03-17",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Stable":
        return "bg-green-100 text-green-800"
      case "Improving":
        return "bg-blue-100 text-blue-800"
      case "Critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalInpatients = inpatients.length
  const stablePatients = inpatients.filter((p) => p.status === "Stable").length
  const criticalPatients = inpatients.filter((p) => p.status === "Critical").length
  const improvingPatients = inpatients.filter((p) => p.status === "Improving").length

  return (
    <MainLayout title="Inpatient Management" subtitle="Monitor and manage hospitalized patients">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <UserPlus className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Total Inpatients</p>
                  <p className="text-2xl font-bold text-gray-900">{totalInpatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Stable</p>
                  <p className="text-2xl font-bold text-gray-900">{stablePatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Improving</p>
                  <p className="text-2xl font-bold text-gray-900">{improvingPatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Bed className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Critical</p>
                  <p className="text-2xl font-bold text-gray-900">{criticalPatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inpatients List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inpatient List</CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Admit Patient
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Patient Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Age/Gender</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Room</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Admission Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Condition</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Doctor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Expected Discharge</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inpatients.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{patient.patientName}</td>
                      <td className="py-3 px-4 text-sm">
                        {patient.age}y, {patient.gender}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">{patient.roomNumber}</td>
                      <td className="py-3 px-4 text-sm">{patient.admissionDate}</td>
                      <td className="py-3 px-4 text-sm">{patient.condition}</td>
                      <td className="py-3 px-4 text-sm">{patient.doctor}</td>
                      <td className="py-3 px-4 text-sm">
                        <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{patient.expectedDischarge}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
