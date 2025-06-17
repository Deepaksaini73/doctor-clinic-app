"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/main-layout"
import AnalyticsDashboard from "@/components/admin_dashboard/analytics-dashboard"
import StatisticsCards from "@/components/admin_dashboard/Statistics_Cards"
import AppointmentList from "@/components/admin_dashboard/Appointment_List"
import RecentPatients from "@/components/admin_dashboard/Recent_Patients"
import { useToast } from "@/components/ui/use-toast"

interface AdminUser {
  id: string
  name: string
  role: string
}

export default function AdminDashboardPage() {
  const [adminName, setAdminName] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData) as AdminUser
        setAdminName(user.name)
      }
    } catch (error) {
      console.error("Error getting admin's name:", error)
      toast({
        title: "Error",
        description: "Failed to load admin information",
        variant: "destructive",
      })
    }
  }, [toast])

  return (
    <MainLayout 
      title={`Welcome back, ${adminName || 'Admin'}!`} 
      subtitle="Here is the latest update for the last 7 days, check now."
    >
      <div className="space-y-6">
        <StatisticsCards />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <AnalyticsDashboard />
          </div>
          <AppointmentList />
        </div>

        <RecentPatients />
      </div>
    </MainLayout>
  )
}