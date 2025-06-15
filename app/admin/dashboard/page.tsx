"use client"

import { useState } from "react"
import { Users, UserCheck, Calendar, TrendingUp, Plus, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import MainLayout from "@/components/layout/main-layout"
import AnalyticsDashboard from "@/components/admin/analytics-dashboard"
import {
  EnhancedCard,
  EnhancedCardContent,
  EnhancedCardHeader,
  EnhancedCardTitle,
  StatCard,
} from "@/components/ui/enhanced-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { CardSkeleton, StatCardSkeleton } from "@/components/ui/loading-skeleton"

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalPatients: 734,
    totalDoctors: 625,
    totalAppointments: 192,
    roomAvailability: 221,
  })

  const [recentPatients, setRecentPatients] = useState([
    {
      id: 1,
      name: "Sabrina Marie Gomez",
      gender: "Female",
      dateOfBirth: "March 15, 1985",
      address: "123 Maple Street, Springfield, IL",
      phoneNumber: "021 1234 5678",
      bloodType: "O+",
    },
    {
      id: 2,
      name: "Cody James Fisher",
      gender: "Male",
      dateOfBirth: "April 22, 1992",
      address: "456 Oak Avenue, Riverside, TX",
      phoneNumber: "021 2345 6789",
      bloodType: "A-",
    },
    {
      id: 3,
      name: "Savannah Lee Nguyen",
      gender: "Female",
      dateOfBirth: "June 30, 1990",
      address: "789 Pine Road, Lakeview, CA",
      phoneNumber: "021 3456 7890",
      bloodType: "B+",
    },
  ])

  return (
    <MainLayout title="Welcome back, Sabrina!" subtitle="Here is the latest update for the last 7 days, check now.">
      <div className="space-y-6">
        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Total Patients"
                value={stats.totalPatients}
                change="↗ 8.5%"
                changeType="positive"
                icon={<Users className="h-6 w-6" />}
                color="blue"
              />
              <StatCard
                title="Total Doctors"
                value={stats.totalDoctors}
                change="↘ 10.3%"
                changeType="negative"
                icon={<UserCheck className="h-6 w-6" />}
                color="purple"
              />
              <StatCard
                title="Appointments"
                value={stats.totalAppointments}
                change="↗ 7.8%"
                changeType="positive"
                icon={<Calendar className="h-6 w-6" />}
                color="green"
              />
              <StatCard
                title="Room Availability"
                value={stats.roomAvailability}
                change="↘ 6.2%"
                changeType="negative"
                icon={<TrendingUp className="h-6 w-6" />}
                color="orange"
              />
            </>
          )}
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <AnalyticsDashboard />
          </div>

          {/* Enhanced Appointment List */}
          <EnhancedCard hover gradient>
            <EnhancedCardHeader gradient>
              <div className="flex items-center justify-between">
                <EnhancedCardTitle gradient>Appointment List</EnhancedCardTitle>
                <AnimatedButton size="sm" variant="gradient" animation="shimmer" icon={<Plus className="h-4 w-4" />}>
                  <span className="hidden sm:inline">New</span>
                </AnimatedButton>
              </div>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-4">
                {[
                  { name: "Dr. Sophia Langley", time: "April 23, 2025 • 9:20 pm", color: "blue" },
                  { name: "Dr. Oliver Westwood", time: "April 22, 2025 • 8:00 pm", color: "green" },
                  { name: "Dr. Victoria Ashford", time: "April 22, 2025 • 8:00 pm", color: "purple" },
                ].map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:border-blue-300"
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-${appointment.color}-100 flex items-center justify-center`}
                    >
                      <span className={`text-${appointment.color}-600 font-medium text-sm`}>
                        {appointment.name.split(" ")[1]?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{appointment.name}</p>
                      <p className="text-xs text-gray-500">{appointment.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>

        {/* Enhanced Recent Patients */}
        <EnhancedCard hover shadow="lg">
          <EnhancedCardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <EnhancedCardTitle>Recent Patients</EnhancedCardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <AnimatedButton variant="outline" size="sm" animation="glow">
                  Filter
                </AnimatedButton>
              </div>
            </div>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
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
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.map((patient, index) => (
                    <tr
                      key={patient.id}
                      className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200"
                    >
                      <td className="py-3 px-4 text-sm">{index + 1}</td>
                      <td className="py-3 px-4 text-sm font-medium">{patient.name}</td>
                      <td className="py-3 px-4 text-sm">{patient.gender}</td>
                      <td className="py-3 px-4 text-sm">{patient.dateOfBirth}</td>
                      <td className="py-3 px-4 text-sm">{patient.address}</td>
                      <td className="py-3 px-4 text-sm">{patient.phoneNumber}</td>
                      <td className="py-3 px-4 text-sm">
                        <Badge className="bg-blue-100 text-blue-800">{patient.bloodType}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <AnimatedButton variant="ghost" size="sm" animation="pulse">
                            <Edit className="h-4 w-4" />
                          </AnimatedButton>
                          <AnimatedButton variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </AnimatedButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {isLoading ? (
                <>
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </>
              ) : (
                recentPatients.map((patient, index) => (
                  <EnhancedCard key={patient.id} hover>
                    <EnhancedCardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{patient.name}</h3>
                          <p className="text-sm text-gray-500">
                            {patient.gender} • {patient.dateOfBirth}
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">{patient.bloodType}</Badge>
                      </div>

                      <div className="space-y-2 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          <span className="ml-1">{patient.phoneNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Address:</span>
                          <span className="ml-1">{patient.address}</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <AnimatedButton variant="outline" size="sm" icon={<Edit className="h-4 w-4" />}>
                          Edit
                        </AnimatedButton>
                        <AnimatedButton
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          icon={<Trash2 className="h-4 w-4" />}
                        >
                          Delete
                        </AnimatedButton>
                      </div>
                    </EnhancedCardContent>
                  </EnhancedCard>
                ))
              )}
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>
    </MainLayout>
  )
}
