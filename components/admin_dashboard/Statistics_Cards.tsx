"use client"

import { useState } from "react"
import { Users, UserCheck, Calendar, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/ui/enhanced-card"
import { StatCardSkeleton } from "@/components/ui/loading-skeleton"

export default function StatisticsCards() {
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalPatients: 734,
    totalDoctors: 625,
    totalAppointments: 192,
    roomAvailability: 221,
  })

  return (
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
  )
}
