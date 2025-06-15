"use client"

import { useState } from "react"
import { Search, Filter, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Appointment {
  id: number
  patientName: string
  notes: string
  doctorName: string
  date: string
  status: string
}

interface EnhancedAppointmentsListProps {
  appointments: Appointment[]
  onSearch: (query: string) => void
}

export default function EnhancedAppointmentsList({ appointments, onSearch }: EnhancedAppointmentsListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "Scheduled":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Scheduled</Badge>
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Appointments</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search"
                className="pl-10 w-64"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">No</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Patient Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Notes</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Doctor Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Appointment Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{appointment.id}</td>
                  <td className="py-3 px-4 font-medium">{appointment.patientName}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{appointment.notes}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">
                          {appointment.doctorName.split(" ")[1]?.charAt(0)}
                        </span>
                      </div>
                      {appointment.doctorName}
                    </div>
                  </td>
                  <td className="py-3 px-4">{appointment.date}</td>
                  <td className="py-3 px-4">{getStatusBadge(appointment.status)}</td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">Page 2 of 12</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm">
              &lt;
            </Button>
            <Button variant="outline" size="sm">
              1
            </Button>
            <Button size="sm" className="bg-blue-600 text-white">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              ...
            </Button>
            <Button variant="outline" size="sm">
              12
            </Button>
            <Button variant="outline" size="sm">
              &gt;
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 