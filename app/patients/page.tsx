"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/main-layout"
import AppointmentHistory from "@/components/patient_dashboard/Appointment_History"
import MedicalHistory from "@/components/patient_dashboard/Medical_History"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { useToast } from "@/components/ui/use-toast"

interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientAge: number
  gender: string
  mobileNumber: string
  doctorId: string
  doctorName: string
  date: string
  time: string
  symptoms: string[]
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  priority: "routine" | "urgent" | "emergency"
  notes?: string
  createdAt: string
}

interface MedicalRecord {
  id: string
  patientId: string
  date: string
  doctorId: string
  doctorName: string
  diagnosis: string
  treatment: string
  notes: string
}

interface Prescription {
  id: string
  date: string
  doctorName: string
  medications: {
    name: string
    dosage: string
    frequency: string
    duration: string
  }[]
}

export default function PatientPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Fetch appointments
    const appointmentsRef = ref(database, 'appointments')
    const appointmentsUnsubscribe = onValue(appointmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const appointmentsData = snapshot.val()
        const appointmentsArray = Object.entries(appointmentsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        })) as Appointment[]
        setAppointments(appointmentsArray)
      } else {
        setAppointments([])
      }
    })

    // Fetch medical records
    const medicalRecordsRef = ref(database, 'medicalRecords')
    const medicalRecordsUnsubscribe = onValue(medicalRecordsRef, (snapshot) => {
      if (snapshot.exists()) {
        const recordsData = snapshot.val()
        const recordsArray = Object.entries(recordsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        })) as MedicalRecord[]
        setMedicalRecords(recordsArray)
      } else {
        setMedicalRecords([])
      }
    })

    // Fetch prescriptions
    const prescriptionsRef = ref(database, 'prescriptions')
    const prescriptionsUnsubscribe = onValue(prescriptionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const prescriptionsData = snapshot.val()
        const prescriptionsArray = Object.entries(prescriptionsData).map(([id, data]: [string, any]) => ({
          id,
          ...data,
          medications: data.medicines || [] // Map medicines to medications to match the interface
        })) as Prescription[]
        setPrescriptions(prescriptionsArray)
      } else {
        setPrescriptions([])
      }
    })

    setIsLoading(false)

    // Cleanup subscriptions
    return () => {
      appointmentsUnsubscribe()
      medicalRecordsUnsubscribe()
      prescriptionsUnsubscribe()
    }
  }, [])

  return (
    <MainLayout title="Patient Dashboard" subtitle="View your appointments, medical history, and prescriptions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Patient Records</h1>
            <p className="text-gray-600">View and manage all patient information</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Add New Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePatient} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={newPatient.gender}
                      onValueChange={(value) => setNewPatient({ ...newPatient, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input
                    id="contact"
                    value={newPatient.contact}
                    onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newPatient.address}
                    onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                  <Input
                    id="allergies"
                    value={newPatient.allergies}
                    onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                    placeholder="e.g., Penicillin, Peanuts"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chronicConditions">Chronic Conditions (comma-separated)</Label>
                  <Input
                    id="chronicConditions"
                    value={newPatient.chronicConditions}
                    onChange={(e) => setNewPatient({ ...newPatient, chronicConditions: e.target.value })}
                    placeholder="e.g., Hypertension, Diabetes"
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
                  Create Patient
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder={searchType === "id" ? "Search by Patient ID..." : "Search by name..."}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Select
            value={searchType}
            onValueChange={(value: "id" | "name") => setSearchType(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">Patient ID</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} className="bg-blue-600 text-white hover:bg-blue-700">
            Search
          </Button>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Past Visits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.patientId}</TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.contact}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.medicalHistory.pastVisits.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  )
} 