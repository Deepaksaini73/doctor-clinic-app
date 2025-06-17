"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { database } from "@/lib/firebase"
import { ref, onValue, push, set } from "firebase/database"
import { useToast } from "@/hooks/use-toast"

interface Doctor {
  id: string
  name: string
  specialization: string
  availability: {
    days: string[]
    hours: string
  }
  imageUrl: string
}

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  contact: string
  medicalHistory: {
    allergies: string[]
    chronicConditions: string[]
    pastVisits: Array<{
      id: string
      date: string
      doctorId: string
      doctorName: string
      symptoms: string[]
      diagnosis: string
      prescription: {
        id: string
        medicines: Array<{
          name: string
          dosage: string
          frequency: string
          duration: string
        }>
        instructions: string
      }
    }>
  }
}

interface CreateAppointmentProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newAppointment: {
    patientId: string
    doctorId: string
    date: string
    time: string
    symptoms: string[]
    status: string
    priority: string
  }
  onNewAppointmentChange: (appointment: any) => void
  onCreateAppointment: () => void
}

export default function CreateAppointment({
  isOpen,
  onOpenChange,
  newAppointment,
  onNewAppointmentChange,
  onCreateAppointment,
}: CreateAppointmentProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Fetch doctors
    const doctorsRef = ref(database, 'doctors')
    const doctorsUnsubscribe = onValue(doctorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const doctorsData = snapshot.val()
        const doctorsArray = Object.entries(doctorsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        })) as Doctor[]
        setDoctors(doctorsArray)
      }
    })

    // Fetch patients
    const patientsRef = ref(database, 'patients')
    const patientsUnsubscribe = onValue(patientsRef, (snapshot) => {
      if (snapshot.exists()) {
        const patientsData = snapshot.val()
        const patientsArray = Object.entries(patientsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        })) as Patient[]
        setPatients(patientsArray)
      }
    })

    return () => {
      doctorsUnsubscribe()
      patientsUnsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const appointmentsRef = ref(database, 'appointments')
      const newAppointmentRef = push(appointmentsRef)
      
      // Get selected patient and doctor details
      const selectedPatient = patients.find(p => p.id === newAppointment.patientId)
      const selectedDoctor = doctors.find(d => d.id === newAppointment.doctorId)

      if (!selectedPatient || !selectedDoctor) {
        throw new Error("Patient or doctor not found")
      }

      // Create appointment with the structure matching mock-data.ts
      await set(newAppointmentRef, {
        id: newAppointmentRef.key,
        patientId: newAppointment.patientId,
        patientName: selectedPatient.name,
        patientAge: selectedPatient.age,
        doctorId: newAppointment.doctorId,
        doctorName: selectedDoctor.name,
        date: newAppointment.date,
        time: newAppointment.time,
        symptoms: newAppointment.symptoms,
        status: newAppointment.status,
        priority: newAppointment.priority
      })

      // Update patient's medical history with new visit
      const patientRef = ref(database, `patients/${newAppointment.patientId}/medicalHistory/pastVisits`)
      const newVisitRef = push(patientRef)
      await set(newVisitRef, {
        id: newVisitRef.key,
        date: newAppointment.date,
        doctorId: newAppointment.doctorId,
        doctorName: selectedDoctor.name,
        symptoms: newAppointment.symptoms,
        diagnosis: "", // To be filled by doctor during visit
        prescription: {
          id: `pr${Date.now()}`,
          medicines: [],
          instructions: ""
        }
      })

      toast({
        title: "Success",
        description: "Appointment created successfully",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          Create Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Patient</Label>
            <Select
              value={newAppointment.patientId}
              onValueChange={(value) => onNewAppointmentChange({ ...newAppointment, patientId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} ({patient.age} years, {patient.gender})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor</Label>
            <Select
              value={newAppointment.doctorId}
              onValueChange={(value) => onNewAppointmentChange({ ...newAppointment, doctorId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialization})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newAppointment.date}
                onChange={(e) => onNewAppointmentChange({ ...newAppointment, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={newAppointment.time}
                onChange={(e) => onNewAppointmentChange({ ...newAppointment, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms</Label>
            <Input
              id="symptoms"
              value={newAppointment.symptoms.join(", ")}
              onChange={(e) => onNewAppointmentChange({ 
                ...newAppointment, 
                symptoms: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
              })}
              placeholder="Enter symptoms separated by commas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={newAppointment.priority}
              onValueChange={(value) => onNewAppointmentChange({ ...newAppointment, priority: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
            Create Appointment
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 