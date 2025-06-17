"use client"

import { useState } from "react"
import { Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { database } from "@/lib/firebase"
import { ref, push, set, get } from "firebase/database"
import { useToast } from "@/hooks/use-toast"

// Add interface for Patient
interface Patient {
  patientId: string
  name: string
  age: number
  gender: "male" | "female" | "other"
  contact: string
}

// Add interface for Doctor
interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

export default function CreateAppointment({
  isOpen,
  onOpenChange,
  doctors = [],
  onSuccess
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  doctors: Doctor[]
  onSuccess: () => void
}) {
  const { toast } = useToast()
  const [patientType, setPatientType] = useState<"new" | "existing">("new")
  const [isSearching, setIsSearching] = useState(false)
  const [searchPatientId, setSearchPatientId] = useState("")
  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    patientGender: "",
    contactNumber: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    symptoms: "",
    priority: "routine"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validate required fields
      if (!formData.patientName || !formData.doctorId || !formData.appointmentDate) {
        throw new Error("Please fill all required fields")
      }

      let patientId = searchPatientId

      // If new patient, create patient record first
      if (patientType === "new") {
        patientId = `PAT${Date.now()}`
        const patientsRef = ref(database, 'patients')
        const newPatientRef = push(patientsRef)
        
        await set(newPatientRef, {
          patientId,
          name: formData.patientName,
          age: parseInt(formData.patientAge),
          gender: formData.patientGender,
          contact: formData.contactNumber,
          createdAt: new Date().toISOString()
        })
      }

      // Create appointment with patient reference
      const appointmentsRef = ref(database, 'appointments')
      const newAppointmentRef = push(appointmentsRef)
      
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId)
      if (!selectedDoctor) throw new Error("Doctor not found")

      // Format date and time properly
      const appointmentDate = new Date(formData.appointmentDate)
      const [hours, minutes] = formData.appointmentTime.split(':')
      appointmentDate.setHours(parseInt(hours), parseInt(minutes))

      const formattedDate = appointmentDate.toISOString().split('T')[0]
      const formattedTime = `${hours}:${minutes}`

      await set(newAppointmentRef, {
        id: newAppointmentRef.key,
        patientId,
        patientName: formData.patientName,
        patientAge: parseInt(formData.patientAge),
        gender: formData.patientGender,
        mobileNumber: formData.contactNumber,
        doctorId: formData.doctorId,
        doctorName: selectedDoctor.name,
        date: formattedDate, // Use consistent date format
        time: formattedTime,
        timestamp: appointmentDate.getTime(), // Add timestamp for easier filtering
        symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(Boolean),
        status: "scheduled",
        priority: formData.priority,
        createdAt: new Date().toISOString()
      })

      toast({
        title: "Success",
        description: patientType === "new" 
          ? `New patient created with ID: ${patientId} and appointment scheduled`
          : "Appointment created successfully",
      })

      onSuccess()
      onOpenChange(false)
      
      // Reset form
      setFormData({
        patientName: "",
        patientAge: "",
        patientGender: "",
        contactNumber: "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        symptoms: "",
        priority: "routine"
      })
      setSearchPatientId("")

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create appointment",
        variant: "destructive",
      })
    }
  }

  // Add patient search handler
  const handlePatientSearch = async () => {
    if (!searchPatientId) {
      toast({
        title: "Error",
        description: "Please enter a patient ID",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    try {
      const patientsRef = ref(database, 'patients')
      const snapshot = await get(patientsRef)

      if (snapshot.exists()) {
        const patientsData = snapshot.val()
        const patient = Object.values(patientsData).find((p: any) => p.patientId === searchPatientId) as Patient;

        if (patient) {
          setFormData({
            ...formData,
            patientName: patient.name,
            patientAge: patient.age.toString(),
            patientGender: patient.gender,
            contactNumber: patient.contact,
          })
          toast({
            title: "Success",
            description: "Patient information loaded successfully",
          })
        } else {
          toast({
            title: "Not Found",
            description: "No patient found with this ID",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error searching patient:", error)
      toast({
        title: "Error",
        description: "Failed to search patient",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="text-black max-w-[95vw] md:max-w-[800px] h-[90vh] md:h-auto overflow-y-auto rounded-lg shadow-xl p-6 md:p-8">
        <DialogHeader className="mb-6 text-center">
          <DialogTitle className="text-3xl font-extrabold text-blue-800">Create New Appointment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="p-5 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
                <RadioGroup
                  defaultValue="new"
                  value={patientType}
                  onValueChange={(value) => setPatientType(value as "new" | "existing")}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2 text-blue-800 font-medium">
                    <RadioGroupItem value="new" id="new" className="border-blue-400 text-blue-600 focus:ring-blue-500" />
                    <Label htmlFor="new" className="cursor-pointer">New Patient</Label>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-800 font-medium">
                    <RadioGroupItem value="existing" id="existing" className="border-blue-400 text-blue-600 focus:ring-blue-500" />
                    <Label htmlFor="existing" className="cursor-pointer">Existing Patient</Label>
                  </div>
                </RadioGroup>

                {patientType === "existing" && (
                  <div className="mt-6 space-y-3">
                    <Label className="text-gray-700">Patient ID</Label>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Enter patient ID"
                        value={searchPatientId}
                        onChange={(e) => setSearchPatientId(e.target.value)}
                        className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm placeholder:text-gray-400"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePatientSearch}
                        disabled={isSearching}
                        className="bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm w-12 h-10 flex items-center justify-center"
                      >
                        {isSearching ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Search className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="patientName" className="text-gray-700">Patient Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    required
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-gray-700">Age <span className="text-red-500">*</span></Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.patientAge}
                      onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-gray-700">Gender <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.patientGender}
                      onValueChange={(value) => setFormData({ ...formData, patientGender: value })}
                    >
                      <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm data-[placeholder]:text-gray-400">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 shadow-lg">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-gray-700">Contact Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="contact"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    required
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="doctor" className="text-gray-700">Select Doctor <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.doctorId}
                    onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm data-[placeholder]:text-gray-400">
                      <SelectValue placeholder={doctors.length ? "Select doctor" : "No doctors available"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 shadow-lg">
                      {doctors?.length > 0 ? (
                        doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name} ({doctor.specialization})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No doctors available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-gray-700">Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-gray-700">Time <span className="text-red-500">*</span></Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.appointmentTime}
                      onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms" className="text-gray-700">Symptoms</Label>
                  <Input
                    id="symptoms"
                    placeholder="Enter symptoms (comma separated)"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-gray-700">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm data-[placeholder]:text-gray-400">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 shadow-lg">
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 text-white hover:bg-blue-700 h-12 text-lg font-semibold shadow-md transition-all duration-200"
              disabled={!doctors?.length}
            >
              {doctors?.length ? "Create Appointment" : "No doctors available"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}