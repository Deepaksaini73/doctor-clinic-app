"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Appointment } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Clock, CheckCircle, Calendar } from "lucide-react"

interface AppointmentListProps {
  onSelectAppointment: (appointment: Appointment) => void
}

export default function AppointmentList({ onSelectAppointment }: AppointmentListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")
  const { toast } = useToast()

  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      // In a real app, we would filter by the logged-in doctor's ID
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch(`/api/appointments?date=${today}`)

      if (!response.ok) throw new Error("Failed to fetch appointments")

      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast({
        title: "Error",
        description: "Failed to load appointments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()

    // Set up polling to refresh appointments every 30 seconds
    const intervalId = setInterval(fetchAppointments, 30000)

    return () => clearInterval(intervalId)
  }, [toast])

  const upcomingAppointments = appointments.filter((app) => app.status === "scheduled")

  const completedAppointments = appointments.filter((app) => app.status === "completed")

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Urgent</Badge>
      case "emergency":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Emergency</Badge>
      default:
        return <Badge variant="outline">Routine</Badge>
    }
  }

  const handleSelectAppointment = (appointment: Appointment) => {
    onSelectAppointment(appointment)
  }

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card
      key={appointment.id}
      className="mb-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-doctor"
      onClick={() => handleSelectAppointment(appointment)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{appointment.patientName}</h3>
            <p className="text-sm text-gray-500">Age: {appointment.patientAge}</p>
          </div>
          <div className="flex items-center">
            <span className="text-sm mr-2">{appointment.time}</span>
            {getPriorityBadge(appointment.priority)}
          </div>
        </div>

        <div className="mt-2">
          <p className="text-sm font-medium">Symptoms:</p>
          <p className="text-sm text-gray-600">{appointment.symptoms.join(", ")}</p>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Card className="h-full border-doctor border-t-4">
      <CardHeader>
        <CardTitle>Appointments</CardTitle>
        <CardDescription>{appointments.length} appointments scheduled for today</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>Upcoming</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Completed</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>All</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <>
                <TabsContent value="upcoming" className="mt-0">
                  {upcomingAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No upcoming appointments</div>
                  ) : (
                    upcomingAppointments.map(renderAppointmentCard)
                  )}
                </TabsContent>

                <TabsContent value="completed" className="mt-0">
                  {completedAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No completed appointments</div>
                  ) : (
                    completedAppointments.map(renderAppointmentCard)
                  )}
                </TabsContent>

                <TabsContent value="all" className="mt-0">
                  {appointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No appointments for today</div>
                  ) : (
                    appointments.map(renderAppointmentCard)
                  )}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
