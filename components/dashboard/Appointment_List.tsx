"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Appointment {
  id: number
  doctor: string
  time: string
  avatar: string
}

interface EnhancedAppointmentListProps {
  appointments: Appointment[]
}

export default function AppointmentList({ appointments }: EnhancedAppointmentListProps) {
  return (
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
  )
} 