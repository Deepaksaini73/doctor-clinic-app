"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Doctor } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Search } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { database } from "@/lib/firebase"
import { ref, push, get, set, query, orderByChild, equalTo } from "firebase/database"

const formSchema = z.object({
  patientId: z.string().optional(),
  patientName: z.string().min(2, { message: "Patient name is required" }),
  patientAge: z.coerce
    .number()
    .min(1, { message: "Age must be at least 1" })
    .max(120, { message: "Age must be less than 120" }),
  gender: z.enum(["male", "female", "other"], { required_error: "Please select a gender" }),
  mobileNumber: z.string().min(10, { message: "Mobile number must be at least 10 digits" }),
  symptoms: z.string().min(3, { message: "Symptoms are required" }),
  doctorId: z.string().min(1, { message: "Please select a doctor" }),
  priority: z.enum(["routine", "urgent", "emergency"], { required_error: "Please select a priority" }),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AppointmentFormProps {
  transcript?: string
  onAppointmentCreated: () => void
}

interface Patient {
  patientId: string
  name: string
  age: number
  gender: "male" | "female" | "other"
  contact: string
  email?: string
  address?: string
  medicalHistory?: {
    allergies: string[]
    chronicConditions: string[]
    pastVisits: any[]
  }
}

export default function AppointmentForm({ transcript, onAppointmentCreated }: AppointmentFormProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      patientName: "",
      patientAge: 0,
      gender: "male",
      mobileNumber: "",
      symptoms: "",
      doctorId: "",
      priority: "routine",
      notes: "",
    },
  })

  useEffect(() => {
    // Fetch doctors from Firebase
    const fetchDoctors = async () => {
      try {
        const doctorsRef = ref(database, 'doctors')
        const snapshot = await get(doctorsRef)
        if (snapshot.exists()) {
          const doctorsData = snapshot.val()
          const doctorsArray = Object.entries(doctorsData).map(([id, data]: [string, any]) => ({
            id,
            ...data
          }))
          setDoctors(doctorsArray)
        }
      } catch (error) {
        console.error("Error fetching doctors:", error)
        toast({
          title: "Error",
          description: "Failed to load doctors. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchDoctors()
  }, [toast])

  const handlePatientSearch = async () => {
    const patientId = form.getValues("patientId")
    if (!patientId) {
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
        const patientsData = snapshot.val() as Record<string, Patient>
        const patient = Object.values(patientsData).find(p => p.patientId === patientId)

        if (patient) {
          form.setValue("patientName", patient.name)
          form.setValue("patientAge", patient.age)
          form.setValue("gender", patient.gender)
          form.setValue("mobileNumber", patient.contact)
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
      } else {
        toast({
          title: "Not Found",
          description: "No patients found in the database",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error searching patient:", error)
      toast({
        title: "Error",
        description: "Failed to search patient. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    if (transcript) {
      // Parse transcript to extract patient information
      // This is a simple implementation - in a real app, you'd use NLP
      const extractPatientName = (text: string) => {
        const nameMatch = text.match(/for\s+([A-Za-z\s]+),\s+\d+|for\s+([A-Za-z\s]+)\s+\d+|([A-Za-z\s]+),\s+\d+/)
        if (nameMatch) {
          return (nameMatch[1] || nameMatch[2] || nameMatch[3]).trim()
        }
        return ""
      }

      const extractAge = (text: string) => {
        const ageMatch = text.match(/(\d+)\s+years?\s+old|(\d+)\s+year|age\s+(\d+)|(\d+)\s+years/)
        if (ageMatch) {
          return ageMatch[1] || ageMatch[2] || ageMatch[3] || ageMatch[4]
        }
        return ""
      }

      const extractSymptoms = (text: string) => {
        const symptomsMatch = text.match(/with\s+([^.]+)(?=\.|$)/)
        if (symptomsMatch) {
          return symptomsMatch[1].trim()
        }

        // Alternative pattern
        const experiencingMatch = text.match(/experiencing\s+([^.]+)(?=\.|$)/)
        if (experiencingMatch) {
          return experiencingMatch[1].trim()
        }

        return ""
      }

      const extractDoctor = (text: string) => {
        const doctorMatch = text.match(/Dr\.\s+([A-Za-z\s]+)/i)
        if (doctorMatch && doctorMatch[1]) {
          const doctorName = doctorMatch[1].trim()
          const doctor = doctors.find((d) => d.name.includes(doctorName))
          return doctor?.id || ""
        }
        return ""
      }

      const extractPriority = (text: string) => {
        if (text.toLowerCase().includes("urgent")) return "urgent"
        if (text.toLowerCase().includes("emergency")) return "emergency"
        return "routine"
      }

      // Update form with extracted data
      form.setValue("patientName", extractPatientName(transcript))

      const age = extractAge(transcript)
      if (age) form.setValue("patientAge", Number.parseInt(age))

      form.setValue("symptoms", extractSymptoms(transcript))

      const doctorId = extractDoctor(transcript)
      if (doctorId) form.setValue("doctorId", doctorId)

      form.setValue("priority", extractPriority(transcript))
    }
  }, [transcript, doctors, form])

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)

    try {
      // Find doctor name from ID
      const doctor = doctors.find((d) => d.id === data.doctorId)

      // Generate new patient ID if not provided
      let patientId = data.patientId
      if (!patientId) {
        patientId = `PAT${Date.now()}`
        
        // Create new patient record
        const patientsRef = ref(database, 'patients')
        const newPatientRef = push(patientsRef)
        await set(newPatientRef, {
          patientId,
          name: data.patientName,
          age: data.patientAge,
          gender: data.gender,
          contact: data.mobileNumber,
          email: "", // You might want to add email field to the form
          address: "", // You might want to add address field to the form
          medicalHistory: {
            allergies: [],
            chronicConditions: [],
            pastVisits: []
          }
        })

        toast({
          title: "New Patient Created",
          description: `Patient ID: ${patientId} has been generated`,
        })
      }

      const appointmentData = {
        patientId,
        patientName: data.patientName,
        patientAge: data.patientAge,
        gender: data.gender,
        mobileNumber: data.mobileNumber,
        doctorId: data.doctorId,
        doctorName: doctor?.name || "",
        date: new Date().toISOString().split("T")[0], // Today's date
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        symptoms: data.symptoms.split(",").map((s) => s.trim()),
        status: "scheduled",
        priority: data.priority,
        notes: data.notes,
        createdAt: new Date().toISOString()
      }

      // Save to Firebase
      const appointmentsRef = ref(database, 'appointments')
      const newAppointmentRef = push(appointmentsRef)
      await set(newAppointmentRef, appointmentData)

      toast({
        title: "Success",
        description: "Appointment has been scheduled successfully.",
      })

      form.reset()
      onAppointmentCreated()
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-receptionist border-t-4">
      <CardHeader>
        <CardTitle>Schedule Appointment</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient ID (Optional)</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="Enter patient ID" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePatientSearch}
                        disabled={isSearching}
                        className="whitespace-nowrap"
                      >
                        {isSearching ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                        <span className="ml-2">Search</span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter patient name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="patientAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter age"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? '' : Number(value));
                          }}
                          value={field.value === undefined || field.value === null ? '' : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="Enter mobile number" 
                          {...field}
                          pattern="[0-9]{10}"
                          title="Please enter a valid 10-digit mobile number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symptoms</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe symptoms" className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Doctor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="routine" />
                        </FormControl>
                        <FormLabel className="font-normal">Routine</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="urgent" />
                        </FormControl>
                        <FormLabel className="font-normal">Urgent</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="emergency" />
                        </FormControl>
                        <FormLabel className="font-normal">Emergency</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional information" className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0 pt-4">
              <Button type="submit" className="w-full bg-receptionist hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Schedule Appointment"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
