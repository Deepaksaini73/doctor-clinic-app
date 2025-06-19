"use client"

import { useState, useEffect } from "react"
import { Users, UserCheck, Calendar, UserCog } from "lucide-react"
import { StatCard } from "@/components/ui/enhanced-card"
import { StatCardSkeleton } from "@/components/ui/loading-skeleton"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { useToast } from "@/hooks/use-toast"

export default function StatisticsCards() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalReceptionists: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    let loadedCount = 0
    const totalLoads = 4 // Updated for patients, doctors, appointments, receptionists

    const checkLoadingComplete = () => {
      loadedCount++
      if (loadedCount === totalLoads) {
        setIsLoading(false)
      }
    }

    const patientsRef = ref(database, 'patients')
    const unsubscribePatients = onValue(patientsRef, (snapshot) => {
      if (snapshot.exists()) {
        setStats(prev => ({ ...prev, totalPatients: Object.keys(snapshot.val()).length }))
      } else {
        setStats(prev => ({ ...prev, totalPatients: 0 }))
      }
      checkLoadingComplete()
    }, (error) => {
      console.error("Error fetching patients:", error)
      toast({
        title: "Error",
        description: "Failed to load patient count.",
        variant: "destructive",
      })
      checkLoadingComplete()
    })

    const doctorsRef = ref(database, 'doctors')
    const unsubscribeDoctors = onValue(doctorsRef, (snapshot) => {
      if (snapshot.exists()) {
        setStats(prev => ({ ...prev, totalDoctors: Object.keys(snapshot.val()).length }))
      } else {
        setStats(prev => ({ ...prev, totalDoctors: 0 }))
      }
      checkLoadingComplete()
    }, (error) => {
      console.error("Error fetching doctors:", error)
      toast({
        title: "Error",
        description: "Failed to load doctor count.",
        variant: "destructive",
      })
      checkLoadingComplete()
    })

    const appointmentsRef = ref(database, 'appointments')
    const unsubscribeAppointments = onValue(appointmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        setStats(prev => ({ ...prev, totalAppointments: Object.keys(snapshot.val()).length }))
      } else {
        setStats(prev => ({ ...prev, totalAppointments: 0 }))
      }
      checkLoadingComplete()
    }, (error) => {
      console.error("Error fetching appointments:", error)
      toast({
        title: "Error",
        description: "Failed to load appointment count.",
        variant: "destructive",
      })
      checkLoadingComplete()
    })

    // New listener for receptionists
    const usersRef = ref(database, 'users')
    const unsubscribeReceptionists = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const users = snapshot.val()
        const receptionistCount = Object.values(users).filter(
          (user: any) => user.role === 'receptionist'
        ).length
        setStats(prev => ({ ...prev, totalReceptionists: receptionistCount }))
      } else {
        setStats(prev => ({ ...prev, totalReceptionists: 0 }))
      }
      checkLoadingComplete()
    }, (error) => {
      console.error("Error fetching receptionists:", error)
      toast({
        title: "Error",
        description: "Failed to load receptionist count.",
        variant: "destructive",
      })
      checkLoadingComplete()
    })

    return () => {
      unsubscribePatients()
      unsubscribeDoctors()
      unsubscribeAppointments()
      unsubscribeReceptionists()
    }
  }, [toast])

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
          title="Receptionists" 
          value={stats.totalReceptionists}
          change="↗ 5.2%"
          changeType="positive"
          icon={<UserCog className="h-6 w-6 text-yellow-500" />} // Added text color class
          color="yellow"
        />
        </>
      )}
    </div>
  )
}