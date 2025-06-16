"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Appointment, Doctor } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Download, BarChart, PieChart, LineChart } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AnalyticsDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch appointments
        const appointmentsResponse = await fetch("/api/appointments")
        if (!appointmentsResponse.ok) throw new Error("Failed to fetch appointments")
        const appointmentsData = await appointmentsResponse.json()
        setAppointments(appointmentsData)

        // Fetch doctors
        const doctorsResponse = await fetch("/api/doctors")
        if (!doctorsResponse.ok) throw new Error("Failed to fetch doctors")
        const doctorsData = await doctorsResponse.json()
        setDoctors(doctorsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Calculate analytics data
  const totalAppointments = appointments.length

  const appointmentsByStatus = {
    scheduled: appointments.filter((app) => app.status === "scheduled").length,
    inProgress: appointments.filter((app) => app.status === "in-progress").length,
    completed: appointments.filter((app) => app.status === "completed").length,
    cancelled: appointments.filter((app) => app.status === "cancelled").length,
  }

  const appointmentsByPriority = {
    routine: appointments.filter((app) => app.priority === "routine").length,
    urgent: appointments.filter((app) => app.priority === "urgent").length,
    emergency: appointments.filter((app) => app.priority === "emergency").length,
  }

  const appointmentsByDoctor = doctors.map((doctor) => ({
    doctorName: doctor.name,
    count: appointments.filter((app) => app.doctorId === doctor.id).length,
  }))

  // Mock time distribution data
  const timeDistribution = [
    { hour: "9:00 AM", count: 3 },
    { hour: "10:00 AM", count: 5 },
    { hour: "11:00 AM", count: 7 },
    { hour: "12:00 PM", count: 2 },
    { hour: "1:00 PM", count: 1 },
    { hour: "2:00 PM", count: 4 },
    { hour: "3:00 PM", count: 6 },
    { hour: "4:00 PM", count: 3 },
  ]

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-800">
          <strong>ML Integration Point:</strong> This dashboard will be enhanced with predictive analytics from your ML
          system to forecast patient volume and resource needs.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Appointments"
          value={totalAppointments}
          description="All appointments"
          icon={<BarChart className="h-4 w-4 text-admin" />}
          color="admin"
        />
        <StatCard
          title="Scheduled"
          value={appointmentsByStatus.scheduled}
          description="Pending appointments"
          icon={<BarChart className="h-4 w-4 text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={appointmentsByStatus.completed}
          description="Finished appointments"
          icon={<BarChart className="h-4 w-4 text-green-600" />}
          color="green"
        />
        <StatCard
          title="Urgent/Emergency"
          value={appointmentsByPriority.urgent + appointmentsByPriority.emergency}
          description="High priority cases"
          icon={<BarChart className="h-4 w-4 text-red-600" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-admin border-t-4">
          <CardHeader>
            <CardTitle>Appointments by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-32 w-32 mx-auto text-gray-300" />
              <p className="mt-4 text-sm text-gray-500">Chart visualization would appear here</p>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full grid grid-cols-4 gap-2 text-center text-sm">
              <div>
                <div className="font-medium">{appointmentsByStatus.scheduled}</div>
                <div className="text-gray-500">Scheduled</div>
              </div>
              <div>
                <div className="font-medium">{appointmentsByStatus.inProgress}</div>
                <div className="text-gray-500">In Progress</div>
              </div>
              <div>
                <div className="font-medium">{appointmentsByStatus.completed}</div>
                <div className="text-gray-500">Completed</div>
              </div>
              <div>
                <div className="font-medium">{appointmentsByStatus.cancelled}</div>
                <div className="text-gray-500">Cancelled</div>
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card className="border-admin border-t-4">
          <CardHeader>
            <CardTitle>Appointments by Priority</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-32 w-32 mx-auto text-gray-300" />
              <p className="mt-4 text-sm text-gray-500">Chart visualization would appear here</p>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <div className="font-medium">{appointmentsByPriority.routine}</div>
                <div className="text-gray-500">Routine</div>
              </div>
              <div>
                <div className="font-medium">{appointmentsByPriority.urgent}</div>
                <div className="text-gray-500">Urgent</div>
              </div>
              <div>
                <div className="font-medium">{appointmentsByPriority.emergency}</div>
                <div className="text-gray-500">Emergency</div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Card className="border-admin border-t-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hourly Distribution</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
          <CardDescription>Appointment distribution throughout the day</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <LineChart className="h-32 w-32 mx-auto text-gray-300" />
            <p className="mt-4 text-sm text-gray-500">Chart visualization would appear here</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-admin border-t-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Doctor Workload</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
          <CardDescription>Appointments per doctor</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <BarChart className="h-32 w-32 mx-auto text-gray-300" />
            <p className="mt-4 text-sm text-gray-500">Chart visualization would appear here</p>
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            {appointmentsByDoctor.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="truncate">{item.doctorName}</div>
                <div className="font-medium">{item.count}</div>
              </div>
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  icon,
  color = "gray",
}: {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  color?: string
}) {
  const getBorderClass = () => {
    switch (color) {
      case "admin":
        return "border-admin border-t-4"
      case "blue":
        return "border-blue-500 border-t-4"
      case "green":
        return "border-green-500 border-t-4"
      case "red":
        return "border-red-500 border-t-4"
      default:
        return "border-gray-500 border-t-4"
    }
  }

  return (
    <Card className={getBorderClass()}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
