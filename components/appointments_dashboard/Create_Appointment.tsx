"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { database } from "@/lib/firebase"
import { ref, onValue, push, set } from "firebase/database"
import { useToast } from "@/components/ui/use-toast"

interface Doctor {
  id: string
  name: string
  specialization: string
}

interface Patient {
  id: string
  name: string
  age: number
}

interface NewAppointment {
  patientName: string
  doctorName: string
  date: string
  status: string
  notes: string
}

interface EnhancedCreateAppointmentProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newAppointment: NewAppointment
  onNewAppointmentChange: (appointment: NewAppointment) => void
  onCreateAppointment: () => void
}

export default function CreateAppointment({
  isOpen,
  onOpenChange,
  newAppointment,
  onNewAppointmentChange,
  onCreateAppointment,
}: EnhancedCreateAppointmentProps) {
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
        }))
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
        }))
        setPatients(patientsArray)
      }
    })

    return () => {
      doctorsUnsubscribe()
      patientsUnsubscribe()
    }
  }, [])

  const handleCreateAppointment = async () => {
    try {
      const appointmentsRef = ref(database, 'appointments')
      const newAppointmentRef = push(appointmentsRef)
      
      await set(newAppointmentRef, {
        ...newAppointment,
        createdAt: new Date().toISOString()
      })

      toast({
        title: "Success",
        description: "Appointment created successfully",
      })

      onCreateAppointment()
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
                onValueChange={(value) => onNewAppointmentChange({ ...newAppointment, patientName: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.name}>
                      {patient.name} ({patient.age} years)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Doctor Name</Label>
              <Select
                value={newAppointment.doctorName}
                onValueChange={(value) => onNewAppointmentChange({ ...newAppointment, doctorName: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.name}>
                      {doctor.name} - {doctor.specialization}
                    </SelectItem>
                  ))}
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
                onChange={(e) => onNewAppointmentChange({ ...newAppointment, date: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={newAppointment.status}
                onValueChange={(value) => onNewAppointmentChange({ ...newAppointment, status: value })}
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
              placeholder="Enter appointment notes"
              value={newAppointment.notes}
              onChange={(e) => onNewAppointmentChange({ ...newAppointment, notes: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreateAppointment} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Create Appointment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 