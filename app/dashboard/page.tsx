"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import StatisticsCards from "@/components/dashboard/Statistics_Cards"
import PatientStatistics from "@/components/dashboard/Patient_Statistics"
import AppointmentList from "@/components/dashboard/Appointment_List"
import RecentPatients from "@/components/dashboard/Recent_Patients"

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

  const stats = {
    totalPatients: 734,
    totalDoctors: 625,
    totalAppointments: 192,
    roomAvailability: 221,
  }

  return (
    <MainLayout title="Dashboard">
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
        <StatisticsCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Statistics Chart */}
          <PatientStatistics totalPatients={73} growthRate={6.30} />

          {/* Appointment List */}
          <AppointmentList appointments={appointments} />
        </div>

        {/* Recent Patients */}
        <RecentPatients patients={recentPatients} />
      </div>
    </MainLayout>
  )
}
