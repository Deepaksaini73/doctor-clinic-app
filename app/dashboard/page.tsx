"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, Calendar, Building2, TrendingUp, TrendingDown, MoreHorizontal, Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      doctor: "Dr. Sophia Langley",
      time: "April 23, 2025 • 9:20 pm",
      avatar: "SL",
    },
    {
      id: 2,
      doctor: "Dr. Oliver Westwood",
      time: "April 22, 2025 • 8:00 pm",
      avatar: "OW",
    },
    {
      id: 3,
      doctor: "Dr. Victoria Ashford",
      time: "April 22, 2025 • 8:00 pm",
      avatar: "VA",
    },
  ])

  const [recentPatients, setRecentPatients] = useState([
    {
      id: 1,
      name: "Sabrina Marie Gomez",
      gender: "Female",
      dateOfBirth: "March 15, 1985",
      address: "123 Maple Street, Springfield, IL...",
      phone: "021 1234 5678",
      bloodType: "O+",
    },
    {
      id: 2,
      name: "Cody James Fisher",
      gender: "Male",
      dateOfBirth: "April 22, 1992",
      address: "456 Oak Avenue, Riverside, TX...",
      phone: "021 2345 6789",
      bloodType: "A-",
    },
    {
      id: 3,
      name: "Savannah Lee Nguyen",
      gender: "Female",
      dateOfBirth: "June 30, 1990",
      address: "789 Pine Road, Lakeview, CA 902...",
      phone: "021 3456 7890",
      bloodType: "B+",
    },
  ])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user.name}!</h1>
            <p className="text-gray-600">Here is the latest update for the last 7 days, check now.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Last updated: March 23, 2025</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Total Patient</p>
                  <p className="text-2xl font-semibold">734</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-600 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    40.81%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <UserCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Total Doctor</p>
                  <p className="text-2xl font-semibold">625</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-red-600 text-sm">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    10.35%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Book Appointment</p>
                  <p className="text-2xl font-semibold">192</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-600 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    7.14%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Room Availability</p>
                  <p className="text-2xl font-semibold">221</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-red-600 text-sm">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    6.72%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Statistics Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Patient Statistics</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Monthly
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Weekly</DropdownMenuItem>
                    <DropdownMenuItem>Monthly</DropdownMenuItem>
                    <DropdownMenuItem>Yearly</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-semibold">73</div>
                  <div className="flex items-center text-green-600 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    6.30% since last week
                  </div>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart visualization would appear here</p>
                </div>
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Patients</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Inpatient</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment List */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{appointment.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{appointment.doctor}</p>
                      <p className="text-xs text-gray-500">{appointment.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Patients */}
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
                  {recentPatients.map((patient, index) => (
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
      </div>
    </MainLayout>
  )
}
