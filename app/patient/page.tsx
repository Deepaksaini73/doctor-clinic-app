"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/main-layout"
import { database } from "@/lib/firebase"
import { ref, onValue, push, set, get } from "firebase/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Patient {
  id: string
  patientId: string
  name: string
  age: number
  gender: "male" | "female" | "other"
  contact: string
  email: string
  address: string
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

interface NewPatient {
  name: string
  age: string
  gender: "male" | "female" | "other"
  contact: string
  email: string
  address: string
  allergies: string
  chronicConditions: string
}

export default function PatientPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"id" | "name">("name")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newPatient, setNewPatient] = useState<NewPatient>({
    name: "",
    age: "",
    gender: "male",
    contact: "",
    email: "",
    address: "",
    allergies: "",
    chronicConditions: ""
  })
  const { toast } = useToast()

  useEffect(() => {
    const patientsRef = ref(database, 'patients')
    
    const unsubscribe = onValue(patientsRef, (snapshot) => {
      if (snapshot.exists()) {
        const patientsData = snapshot.val()
        const patientsArray = Object.entries(patientsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        })) as Patient[]
        setPatients(patientsArray)
      } else {
        setPatients([])
      }
    })

    return () => unsubscribe()
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If search is empty, fetch all patients
      const patientsRef = ref(database, 'patients')
      const snapshot = await get(patientsRef)
      if (snapshot.exists()) {
        const patientsData = snapshot.val()
        const patientsArray = Object.entries(patientsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        })) as Patient[]
        setPatients(patientsArray)
      }
      return
    }

    try {
      if (searchType === "id") {
        // Search by patient ID
        const patientsRef = ref(database, 'patients')
        const snapshot = await get(patientsRef)
        
        if (snapshot.exists()) {
          const patientsData = snapshot.val()
          const patientsArray = Object.entries(patientsData)
            .map(([id, data]: [string, any]) => ({
              id,
              ...data
            })) as Patient[]
          
          const filteredPatients = patientsArray.filter(
            patient => patient.patientId === searchQuery
          )
          
          if (filteredPatients.length > 0) {
            setPatients(filteredPatients)
          } else {
            setPatients([])
            toast({
              title: "Not Found",
              description: "No patient found with this ID",
              variant: "destructive",
            })
          }
        }
      } else {
        // Search by name
        const filteredPatients = patients.filter(
          (patient) => patient.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setPatients(filteredPatients)
      }
    } catch (error) {
      console.error("Error searching patients:", error)
      toast({
        title: "Error",
        description: "Failed to search patients",
        variant: "destructive",
      })
    }
  }

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const patientsRef = ref(database, 'patients')
      const newPatientRef = push(patientsRef)
      
      // Generate a unique patient ID (PAT + timestamp)
      const patientId = `PAT${Date.now()}`
      
      await set(newPatientRef, {
        patientId,
        name: newPatient.name,
        age: parseInt(newPatient.age),
        gender: newPatient.gender,
        contact: newPatient.contact,
        email: newPatient.email,
        address: newPatient.address,
        medicalHistory: {
          allergies: newPatient.allergies.split(',').map(item => item.trim()).filter(Boolean),
          chronicConditions: newPatient.chronicConditions.split(',').map(item => item.trim()).filter(Boolean),
          pastVisits: []
        }
      })

      toast({
        title: "Success",
        description: `Patient created successfully with ID: ${patientId}`,
      })

      setNewPatient({
        name: "",
        age: "",
        gender: "male",
        contact: "",
        email: "",
        address: "",
        allergies: "",
        chronicConditions: ""
      })
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error("Error creating patient:", error)
      toast({
        title: "Error",
        description: "Failed to create patient",
        variant: "destructive",
      })
    }
  }

  return (
    <MainLayout title="Patients" subtitle="Manage patient records and medical history">
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
                      onValueChange={(value: "male" | "female" | "other") => 
                        setNewPatient({ ...newPatient, gender: value })}
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
                  <TableCell className="capitalize">{patient.gender}</TableCell>
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