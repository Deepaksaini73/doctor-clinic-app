"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Plus, MoreHorizontal } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([
    {
      id: 12,
      patientName: "Sabrina Gomez",
      notes: "I've been feeling really fatigued...",
      doctorName: "Dr. Mia Kensington",
      date: "March 15, 2026",
      status: "Completed",
    },
    {
      id: 13,
      patientName: "Alexandra Smith",
      notes: "I have a persistent headache...",
      doctorName: "Dr. Oliver Westwood",
      date: "April 20, 2026",
      status: "Completed",
    },
    {
      id: 14,
      patientName: "Benjamin Johnson",
      notes: "I've noticed some unusual br...",
      doctorName: "Dr. Sophia Langley",
      date: "May 5, 2026",
      status: "Scheduled",
    },
    {
      id: 15,
      patientName: "Avery Thompson",
      notes: "I feel short of breath even w...",
      doctorName: "Dr. Amelia Hawthorne",
      date: "June 10, 2026",
      status: "Completed",
    },
    {
      id: 16,
      patientName: "Olivia Brown",
      notes: "I've been having stomach pa...",
      doctorName: "Dr. Clara Whitmore",
      date: "July 25, 2026",
      status: "Scheduled",
    },
    {
      id: 17,
      patientName: "Brandon Davis",
      notes: "I keep experiencing sharp ch...",
      doctorName: "Dr. Elijah Stone",
      date: "August 30, 2026",
      status: "Scheduled",
    },
    {
      id: 18,
      patientName: "Amelia Wilson",
      notes: "I've had a cough that lingers...",
      doctorName: "Dr. Nathaniel Rivers",
      date: "September 15, 2026",
      status: "Cancelled",
    },
    {
      id: 19,
      patientName: "Charlotte Martinez",
      notes: "I'm feeling unusually anxious...",
      doctorName: "Dr. Victoria Ashford",
      date: "October 22, 2026",
      status: "Cancelled",
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    doctorName: "",
    date: "",
    status: "Scheduled",
    notes: "",
  })

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  const handleCreateAppointment = () => {
    const newId = Math.max(...appointments.map((a) => a.id)) + 1
    setAppointments([...appointments, { ...newAppointment, id: newId }])
    setNewAppointment({
      patientName: "",
      doctorName: "",
      date: "",
      status: "Scheduled",
      notes: "",
    })
    setIsCreateModalOpen(false)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">List Appointments</h1>
            <p className="text-gray-600">Here is the latest update for the last 7 days, check now.</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Patient Name</Label>
                    <Select
                      value={newAppointment.patientName}
                      onValueChange={(value) => setNewAppointment({ ...newAppointment, patientName: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sabrina Gomez">Sabrina Gomez</SelectItem>
                        <SelectItem value="Alexandra Smith">Alexandra Smith</SelectItem>
                        <SelectItem value="Benjamin Johnson">Benjamin Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Doctor Name</Label>
                    <Select
                      value={newAppointment.doctorName}
                      onValueChange={(value) => setNewAppointment({ ...newAppointment, doctorName: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dr. Tina">Dr. Tina</SelectItem>
                        <SelectItem value="Dr. Oliver Westwood">Dr. Oliver Westwood</SelectItem>
                        <SelectItem value="Dr. Sophia Langley">Dr. Sophia Langley</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Appointment Date</Label>
                    <Input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={newAppointment.status}
                      onValueChange={(value) => setNewAppointment({ ...newAppointment, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Keep up with our newsletters for the latest updates"
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAppointment} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Create Appointment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Appointments Table */}
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
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                  {filteredAppointments.map((appointment) => (
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
      </div>
    </MainLayout>
  )
}
