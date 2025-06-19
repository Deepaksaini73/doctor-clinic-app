"use client"

import { useState, useEffect } from "react"
import { UserPlus, Plus, Edit, Trash2, Bed, Clock, Activity, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import MainLayout from "@/components/layout/main-layout"
import { database } from "@/lib/firebase"
import { ref, onValue, push, set, remove } from "firebase/database"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Inpatient {
  id: string
  patientName: string
  age: number
  gender: string
  roomNumber: string
  admissionDate: string
  condition: string
  doctor: string
  status: "Stable" | "Improving" | "Critical"
  expectedDischarge: string
}

const inpatientSchema = z.object({
  patientName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(0).max(150),
  gender: z.string(),
  roomNumber: z.string(),
  condition: z.string(),
  doctor: z.string(),
  status: z.enum(["Stable", "Improving", "Critical"]),
  expectedDischarge: z.string(),
})

export default function InpatientsPage() {
  const [inpatients, setInpatients] = useState<Inpatient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAdmitDialog, setShowAdmitDialog] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Inpatient | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const form = useForm<z.infer<typeof inpatientSchema>>({
    resolver: zodResolver(inpatientSchema),
    defaultValues: {
      patientName: "",
      age: 0,
      gender: "Male",
      roomNumber: "",
      condition: "",
      doctor: "",
      status: "Stable",
      expectedDischarge: new Date().toISOString().split("T")[0],
    },
  })

  useEffect(() => {
    const inpatientsRef = ref(database, "inpatients")
    const unsubscribe = onValue(inpatientsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const inpatientsArray = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }))
        setInpatients(inpatientsArray)
      } else {
        setInpatients([])
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleAdmit = async (data: z.infer<typeof inpatientSchema>) => {
    try {
      const inpatientsRef = ref(database, "inpatients")
      const newPatientRef = push(inpatientsRef)
      await set(newPatientRef, {
        ...data,
        admissionDate: new Date().toISOString().split("T")[0],
      })
      toast({
        title: "Success",
        description: "Patient admitted successfully",
      })
      setShowAdmitDialog(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to admit patient",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async (data: z.infer<typeof inpatientSchema>) => {
    if (!editingPatient) return
    try {
      const patientRef = ref(database, `inpatients/${editingPatient.id}`)
      await set(patientRef, {
        ...data,
        admissionDate: editingPatient.admissionDate,
      })
      toast({
        title: "Success",
        description: "Patient details updated",
      })
      setEditingPatient(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update patient details",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deletingPatientId) return
    try {
      const patientRef = ref(database, `inpatients/${deletingPatientId}`)
      await remove(patientRef)
      toast({
        title: "Success",
        description: "Patient discharged",
      })
      setShowDeleteDialog(false)
      setDeletingPatientId(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to discharge patient",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Stable":
        return "bg-green-100 text-green-800"
      case "Improving":
        return "bg-blue-100 text-blue-800"
      case "Critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredInpatients = inpatients.filter((patient) =>
    patient.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalInpatients = inpatients.length
  const stablePatients = inpatients.filter((p) => p.status === "Stable").length
  const criticalPatients = inpatients.filter((p) => p.status === "Critical").length
  const improvingPatients = inpatients.filter((p) => p.status === "Improving").length

  return (
    <MainLayout title="Inpatient Management" subtitle="Monitor and manage hospitalized patients">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <UserPlus className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Total Inpatients</p>
                  <p className="text-2xl font-bold text-gray-900">{totalInpatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Stable</p>
                  <p className="text-2xl font-bold text-gray-900">{stablePatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Improving</p>
                  <p className="text-2xl font-bold text-gray-900">{improvingPatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Bed className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Critical</p>
                  <p className="text-2xl font-bold text-gray-900">{criticalPatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inpatients List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inpatient List</CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAdmitDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Admit Patient
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Patient Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Age/Gender</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Room</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Admission Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Condition</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Doctor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Expected Discharge</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInpatients.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{patient.patientName}</td>
                      <td className="py-3 px-4 text-sm">
                        {patient.age}y, {patient.gender}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">{patient.roomNumber}</td>
                      <td className="py-3 px-4 text-sm">{patient.admissionDate}</td>
                      <td className="py-3 px-4 text-sm">{patient.condition}</td>
                      <td className="py-3 px-4 text-sm">{patient.doctor}</td>
                      <td className="py-3 px-4 text-sm">
                        <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{patient.expectedDischarge}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPatient(patient)
                              form.setValue("patientName", patient.patientName)
                              form.setValue("age", patient.age)
                              form.setValue("gender", patient.gender)
                              form.setValue("roomNumber", patient.roomNumber)
                              form.setValue("condition", patient.condition)
                              form.setValue("doctor", patient.doctor)
                              form.setValue("status", patient.status)
                              form.setValue("expectedDischarge", patient.expectedDischarge)
                              setShowAdmitDialog(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setDeletingPatientId(patient.id)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admit Patient Dialog */}
      <Dialog open={showAdmitDialog} onOpenChange={setShowAdmitDialog}>
        <DialogContent className="text-black max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
            <DialogTitle>{editingPatient ? "Edit Patient Details" : "Admit New Patient"}</DialogTitle>
            <DialogDescription>
              {editingPatient
                ? "Update the details of the patient"
                : "Enter patient details for admission"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(editingPatient ? handleEdit : handleAdmit)} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Patient Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-9" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="h-9"
                            onChange={(e) => {
                              const value = e.target.value ? parseInt(e.target.value, 10) : 0;
                              field.onChange(value);
                            }}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="roomNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Room Number</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-9" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Condition</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-9" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="doctor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Doctor</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-9" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Stable">Stable</SelectItem>
                          <SelectItem value="Improving">Improving</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="expectedDischarge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Expected Discharge</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-9" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4 sticky bottom-0 bg-white">
                <Button type="button" variant="outline" onClick={() => setShowAdmitDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingPatient ? "Update Details" : "Admit Patient"}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle>Confirm Discharge</DialogTitle>
            <DialogDescription>
              Are you sure you want to discharge this patient? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Confirm Discharge
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
