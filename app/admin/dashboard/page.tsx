"use client"

import MainLayout from "@/components/layout/main-layout"
import AnalyticsDashboard from "@/components/admin_dashboard/analytics-dashboard"
import StatisticsCards from "@/components/admin_dashboard/Statistics_Cards"
import AppointmentList from "@/components/admin_dashboard/Appointment_List"
import RecentPatients from "@/components/admin_dashboard/Recent_Patients"

export default function AdminDashboardPage() {
  return (
    <MainLayout title="Welcome back, Sabrina!" subtitle="Here is the latest update for the last 7 days, check now.">
      <div className="space-y-6">
        {/* Enhanced Statistics Cards */}
        <StatisticsCards />

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <AnalyticsDashboard />
          </div>

          {/* Enhanced Appointment List */}
          <AppointmentList />
        </div>

        {/* Enhanced Recent Patients */}
        <RecentPatients />
      </div>
    </MainLayout>
  )
}
