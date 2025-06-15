"use client"

import MainLayout from "@/components/layout/main-layout"
import AnalyticsDashboard from "@/components/admin/analytics-dashboard"
import EnhancedStatisticsCards from "@/components/admin_dashboard/Enhanced_Statistics_Cards"
import EnhancedAppointmentList from "@/components/admin_dashboard/Enhanced_Appointment_List"
import EnhancedRecentPatients from "@/components/admin_dashboard/Enhanced_Recent_Patients"

export default function AdminDashboardPage() {
  return (
    <MainLayout title="Welcome back, Sabrina!" subtitle="Here is the latest update for the last 7 days, check now.">
      <div className="space-y-6">
        {/* Enhanced Statistics Cards */}
        <EnhancedStatisticsCards />

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <AnalyticsDashboard />
          </div>

          {/* Enhanced Appointment List */}
          <EnhancedAppointmentList />
        </div>

        {/* Enhanced Recent Patients */}
        <EnhancedRecentPatients />
      </div>
    </MainLayout>
  )
}
