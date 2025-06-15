"use client"

import { useState, useEffect } from "react"
import { User, Clock, AlertTriangle, Calendar } from "lucide-react"
import type { Appointment, Patient } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import MainLayout from "@/components/layout/main-layout"
import PrescriptionEditor from "@/components/doctor/prescription-editor"

export default function DoctorDashboardPage() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [currentSymptoms, setCurrentSymptoms] = useState("")

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true)
      try {
        const today = new Date().toISOString().split("T")[0]
        const response = await fetch(`/api/appointments?date=${today}`)
        if (!response.ok) throw new Error("Failed to fetch appointments")
        const data = await response.json()
        setAppointments(data)

        // Select the first appointment by default
        if (data.length > 0 && !selectedAppointment) {
          setSelectedAppointment(data[0])
        }
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  // Fetch patient data when appointment is selected
  useEffect(() => {
    if (selectedAppointment) {
      const fetchPatient = async () => {
        try {
          const response = await fetch(`/api/patients/${selectedAppointment.patientId}`)
          if (!response.ok) throw new Error("Failed to fetch patient data")
          const data = await response.json()
          setPatient(data)
          setCurrentSymptoms(selectedAppointment.symptoms.join(", "))
        } catch (error) {
          console.error("Error fetching patient:", error)
        }
      }

      fetchPatient()
    }
  }, [selectedAppointment])

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
  }

  const upcomingAppointments = appointments.filter((app) => app.status === "scheduled")
  const completedAppointments = appointments.filter((app) => app.status === "completed")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-orange-100 text-orange-800">Urgent</Badge>
      case "emergency":
        return <Badge className="bg-red-100 text-red-800">Emergency</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Routine</Badge>
    }
  }

  return (
    <MainLayout title="Welcome back, Dr. Smith!" subtitle="Patient management and AI-assisted prescriptions">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Today's Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search patients..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex border-b mb-4">
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === "upcoming" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === "completed" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                onClick={() => setActiveTab("completed")}
              >
                Completed
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === "all" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(activeTab === "upcoming"
                  ? upcomingAppointments
                  : activeTab === "completed"
                    ? completedAppointments
                    : appointments
                ).map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${selectedAppointment?.id === appointment.id ? "border-blue-600 border-l-4 bg-blue-50" : "border-gray-200"}`}
                    onClick={() => handleSelectAppointment(appointment)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">{appointment.patientName.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {appointment.patientName}{" "}
                          <span className="text-sm text-gray-500">({appointment.patientAge}y)</span>
                        </h3>
                        <p className="text-sm text-gray-600">{appointment.symptoms.join(", ")}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{appointment.time}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(appointment.status)}
                      {getPriorityBadge(appointment.priority)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Profile and Consultation */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAppointment ? (
            <>
              {/* Patient Profile */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Patient Profile: {selectedAppointment.patientName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h3>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Age:</span> {selectedAppointment.patientAge} years
                        </p>
                        <p>
                          <span className="font-medium">Last Visit:</span>{" "}
                          {patient?.medicalHistory?.pastVisits?.[0]?.date || "First visit"}
                        </p>
                        <p>
                          <span className="font-medium">Patient ID:</span> {selectedAppointment.patientId}
                        </p>
                      </div>

                      {patient?.medicalHistory?.allergies && patient.medicalHistory.allergies.length > 0 && (
                        <div className="mt-4">
                          <h4 className="flex items-center text-sm font-medium text-gray-500 mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                            Allergies
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {patient.medicalHistory.allergies.map((allergy, index) => (
                              <Badge key={index} className="bg-red-100 text-red-800">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="flex items-center text-sm font-medium text-gray-500 mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        Medical History
                      </h3>
                      {patient?.medicalHistory?.chronicConditions && (
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {patient.medicalHistory.chronicConditions.map((condition, index) => (
                            <li key={index}>{condition}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI-Assisted Prescription */}
              <PrescriptionEditor appointment={selectedAppointment} symptoms={selectedAppointment.symptoms} />
            </>
          ) : (
            <Card className="h-64 flex items-center justify-center">
              <CardContent>
                <p className="text-gray-500 text-center">Select a patient to view details and create prescriptions</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
