"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Medicine, Appointment } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Loader2, Plus, Trash2, Save, Download, Sparkles, Check, Pencil } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ref, push, set, get } from "firebase/database"
import { database } from "@/lib/firebase"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface PrescriptionEditorProps {
  appointment: Appointment | null
  symptoms?: string[]
  onClose?: () => void
  isEditing?: boolean
  initialPrescription?: {
    diagnosis: string
    medicines: Medicine[]
    instructions: string
    followUp: string
  }
}

export default function PrescriptionEditor({ 
  appointment, 
  symptoms = [],
  onClose,
  isEditing = false,
  initialPrescription
}: PrescriptionEditorProps) {
  const [medicines, setMedicines] = useState<Medicine[]>(initialPrescription?.medicines || [])
  const [instructions, setInstructions] = useState(initialPrescription?.instructions || "")
  const [followUp, setFollowUp] = useState(initialPrescription?.followUp || "No follow-up needed")
  const [diagnosis, setDiagnosis] = useState(initialPrescription?.diagnosis || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [medicineSearchResults, setMedicineSearchResults] = useState<Medicine[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // New medicine form state
  const [newMedicine, setNewMedicine] = useState<Medicine>({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    notes: "",
  })

  const [editingMedicineIndex, setEditingMedicineIndex] = useState<number | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    if (appointment) {
      // Reset prescription when appointment changes
      setMedicines([])
      setInstructions("")
      setFollowUp("No follow-up needed")
    }
  }, [appointment])

  const handleGetAISuggestions = async () => {
    // Add null check and length validation
    if (!symptoms?.length) {
      toast({
        title: "No symptoms",
        description: "Please add symptoms to get AI suggestions.",
      });
      return;
    }

    setIsSuggesting(true);

    try {
      console.log("Sending symptoms to API:", symptoms);
      const response = await fetch("/api/medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: symptoms.map(s => s.trim())
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(errorData.error || "Failed to get AI suggestions");
      }

      const data = await response.json();
      console.log("Received data from API:", data);

      if (!data.diagnosis || !Array.isArray(data.medicines)) {
        throw new Error("Invalid response format from API");
      }

      // Update both diagnosis and medicines
      setDiagnosis(data.diagnosis);
      setMedicines(data.medicines);
      setInstructions("");
      setFollowUp("");

      toast({
        title: "AI Suggestions Generated",
        description: "Diagnosis and prescription suggestions have been generated based on symptoms.",
      });
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  // Update handleAddMedicine function
  const handleAddMedicine = () => {
    if (!newMedicine.name || !newMedicine.dosage || !newMedicine.frequency || !newMedicine.duration) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      // Add medicine to list
      setMedicines(prev => [...prev, { ...newMedicine }])

      // Reset form
      setNewMedicine({
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        notes: "",
      })
      
      // Clear search
      setSearchQuery("")
      setMedicineSearchResults([])
      
      // Close dialog
      setOpen(false)

      toast({
        title: "Success",
        description: "Medicine added successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add medicine"
      })
    }
  }

  const handleRemoveMedicine = (index: number) => {
    const updatedMedicines = [...medicines]
    updatedMedicines.splice(index, 1)
    setMedicines(updatedMedicines)
  }

  const handleSavePrescription = async () => {
    if (!appointment) return

    if (!medicines.length) {
      toast({
        title: "Error",
        description: "Please add at least one medicine",
        variant: "destructive"
      })
      return
    }

    if (!diagnosis.trim()) {
      toast({
        title: "Error",
        description: "Please add a diagnosis",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      // Check if prescription already exists for this appointment
      const prescriptionsRef = ref(database, 'prescriptions')
      const snapshot = await get(prescriptionsRef)
      
      let prescriptionId = null
      if (snapshot.exists()) {
        const prescriptions = snapshot.val()
        const existingPrescription = Object.entries(prescriptions).find(
          ([_, prescription]: [string, any]) => prescription.appointmentId === appointment.id
        )
        if (existingPrescription) {
          prescriptionId = existingPrescription[0]
        }
      }

      const prescriptionData = {
        id: prescriptionId || push(prescriptionsRef).key,
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        date: new Date().toISOString(),
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        diagnosis: diagnosis,
        medicines: medicines.map(medicine => ({
          name: medicine.name,
          dosage: medicine.dosage,
          frequency: medicine.frequency,
          duration: medicine.duration,
          notes: medicine.notes || ''
        })),
        instructions,
        followUp
      }

      // If prescription exists, update it; otherwise create new
      const prescriptionRef = ref(database, `prescriptions/${prescriptionId || prescriptionData.id}`)
      await set(prescriptionRef, prescriptionData)

      // Update appointment status to completed
      const appointmentRef = ref(database, `appointments/${appointment.id}`)
      await set(appointmentRef, {
        ...appointment,
        status: 'completed'
      })

      // Update doctor's total patients count
      const doctorRef = ref(database, `doctors/${appointment.doctorId}`)
      const doctorSnapshot = await get(doctorRef)
      
      if (doctorSnapshot.exists()) {
        const doctorData = doctorSnapshot.val()
        const currentTotalPatients = doctorData.totalPatients || 0
        
        // Get all appointments for this doctor
        const appointmentsRef = ref(database, 'appointments')
        const appointmentsSnapshot = await get(appointmentsRef)
        
        if (appointmentsSnapshot.exists()) {
          const appointments = appointmentsSnapshot.val()
          // Count unique patients with completed appointments for this doctor
          const uniquePatients = new Set()
          
          Object.values(appointments).forEach((app: any) => {
            if (app.doctorId === appointment.doctorId && app.status === 'completed') {
              uniquePatients.add(app.patientId)
            }
          })
          
          // Update doctor's total patients count
          await set(doctorRef, {
            ...doctorData,
            totalPatients: uniquePatients.size
          })
        }
      }

      toast({
        title: "Prescription Saved",
        description: prescriptionId ? "Prescription has been updated successfully." : "Prescription has been saved successfully.",
      })
      
      // Reset states
      setMedicines([])
      setInstructions("")
      setFollowUp("No follow-up needed")
      setIsSaved(true)
      if (onClose) {
        onClose()
      }
      router.refresh()

    } catch (error) {
      console.error("Error saving prescription:", error)
      toast({
        title: "Error",
        description: "Failed to save prescription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

const handleSearchMedicine = async (query: string) => {
  setSearchQuery(query);

  if (!query.trim()) {
    setMedicineSearchResults([]);
    return;
  }

  try {
    const response = await fetch(`/api/medicines/searchmedicines?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Failed to search medicines");
    const data = await response.json();
    setMedicineSearchResults(data);  // ✅ should be an array of objects { name, dosage }
  } catch (error) {
    console.error("Error searching medicines:", error);
  }
};


  const handleSelectMedicine = (medicine: Medicine) => {
    setNewMedicine({
      ...newMedicine,
      name: medicine.name,
      dosage: medicine.dosage,
      frequency: medicine.frequency || "",
      duration: medicine.duration || "",
    })
    setSearchQuery("")
    setMedicineSearchResults([])
  }

  // Template presets for common conditions
  const prescriptionTemplates = [
    {
      name: "Common Cold",
      medicines: [
        {
          name: "Paracetamol",
          dosage: "500mg",
          frequency: "Every 6 hours as needed",
          duration: "5 days",
        },
        {
          name: "Chlorpheniramine",
          dosage: "4mg",
          frequency: "Every 8 hours",
          duration: "5 days",
        },
      ],
      instructions: "Rest and drink plenty of fluids. Avoid cold foods and beverages.",
      followUp: "Only if symptoms persist after 5 days",
    },
    {
      name: "Migraine",
      medicines: [
        {
          name: "Sumatriptan",
          dosage: "50mg",
          frequency: "As needed, max 2 tablets per day",
          duration: "As needed",
        },
        {
          name: "Ibuprofen",
          dosage: "400mg",
          frequency: "Every 6 hours as needed",
          duration: "3 days",
        },
      ],
      instructions: "Rest in a quiet, dark room. Apply cold compress to forehead if helpful.",
      followUp: "2 weeks if migraines continue",
    },
  ]

  const applyTemplate = (templateName: string) => {
    const template = prescriptionTemplates.find((t) => t.name === templateName)
    if (template) {
      setMedicines(template.medicines)
      setInstructions(template.instructions)
      setFollowUp(template.followUp)

      toast({
        title: "Template Applied",
        description: `Applied the ${templateName} prescription template.`,
      })
    }
  }

  const handleEditMedicine = (index: number) => {
    setNewMedicine(medicines[index])
    setEditingMedicineIndex(index)
    setIsEditDialogOpen(true)
  }

  const handleUpdateMedicine = () => {
    if (editingMedicineIndex === null) return

    if (!newMedicine.name || !newMedicine.dosage || !newMedicine.frequency || !newMedicine.duration) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedMedicines = [...medicines]
      updatedMedicines[editingMedicineIndex] = { ...newMedicine }
      setMedicines(updatedMedicines)

      // Reset form and state
      setNewMedicine({
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        notes: "",
      })
      setEditingMedicineIndex(null)
      setIsEditDialogOpen(false)

      toast({
        title: "Success",
        description: "Medicine updated successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update medicine"
      })
    }
  }

  const handleExportPDF = () => {
    if (!appointment) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Add header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Medical Prescription', pageWidth / 2, 20, { align: 'center' })
    
    // Add patient info
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Patient Name: ${appointment.patientName}`, 20, 40)
    doc.text(`Age: ${appointment.patientAge} years`, 20, 50)
    doc.text(`Gender: ${appointment.gender}`, 20, 60)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70)
    
    // Add diagnosis
    doc.setFont('helvetica', 'bold')
    doc.text('Diagnosis:', 20, 90)
    doc.setFont('helvetica', 'normal')
    const diagnosisLines = doc.splitTextToSize(diagnosis, pageWidth - 40)
    doc.text(diagnosisLines, 20, 100)
    
    // Add medicines table
    doc.setFont('helvetica', 'bold')
    doc.text('Prescribed Medicines:', 20, 120)
    
    const tableData = medicines.map(med => [
      med.name,
      med.dosage,
      med.frequency,
      med.duration,
      med.notes || ''
    ])
    
    autoTable(doc, {
      startY: 130,
      head: [['Medicine', 'Dosage', 'Frequency', 'Duration', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 40 }
      }
    })
    
    // Add instructions
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFont('helvetica', 'bold')
    doc.text('Instructions:', 20, finalY)
    doc.setFont('helvetica', 'normal')
    const instructionLines = doc.splitTextToSize(instructions, pageWidth - 40)
    doc.text(instructionLines, 20, finalY + 10)
    
    // Add follow-up
    const followUpY = finalY + 20 + (instructionLines.length * 7)
    doc.setFont('helvetica', 'bold')
    doc.text('Follow-up:', 20, followUpY)
    doc.setFont('helvetica', 'normal')
    doc.text(followUp, 20, followUpY + 10)
    
    // Add doctor info
    doc.setFont('helvetica', 'bold')
    doc.text('Doctor:', 20, followUpY + 30)
    doc.setFont('helvetica', 'normal')
    doc.text(appointment.doctorName, 20, followUpY + 40)
    
    // Save the PDF
    doc.save(`prescription_${appointment.patientName}_${new Date().toISOString().split('T')[0]}.pdf`)
    
    toast({
      title: "PDF Exported",
      description: "Prescription has been exported successfully.",
    })
  }

  if (!appointment) {
    return (
      <Card className="h-full flex items-center justify-center border-doctor border-t-4">
        <CardContent className="text-center py-12">
          <p className="text-lg text-gray-500">Select an appointment to create a prescription</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full border-doctor border-t-4 shadow-sm">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-semibold text-gray-900">{isEditing ? 'Edit Prescription' : 'Create Prescription'}</CardTitle>
            <CardDescription className="mt-1 text-gray-600">
              {isEditing ? 'Edit prescription for' : 'Create a prescription for'} {appointment?.patientName}
            </CardDescription>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGetAISuggestions}
              disabled={isSuggesting || !(symptoms?.length > 0)}
              className="border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {isSuggesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Suggest
                </>
              )}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50 hover:text-green-700">
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="text-black">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Prescription Templates</DialogTitle>
                  <DialogDescription className="text-gray-600">Select a template to quickly fill the prescription.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  {prescriptionTemplates.map((template) => (
                    <Button
                      key={template.name}
                      variant="outline"
                      className="justify-start hover:bg-gray-50"
                      onClick={() => {
                        applyTemplate(template.name)
                        setOpen(false)
                        document.querySelector('[data-state="open"]')?.setAttribute("data-state", "closed")
                      }}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Diagnosis</h3>
          <Textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Enter the diagnosis"
            className="min-h-[100px] resize-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Medicines</h3>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-doctor hover:bg-green-700 text-sm">
                  <Plus className="mr-2 h-4 w-4" /> Add Medicine
                </Button>
              </DialogTrigger>
              <DialogContent className="text-black">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Add Medicine</DialogTitle>
                  <DialogDescription className="text-gray-600">Add a new medicine to the prescription.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="relative">
                    <Label htmlFor="medicine-search" className="text-sm font-medium text-gray-700">Search Medicine</Label>
                    <Input
                      id="medicine-search"
                      placeholder="Type to search medicines..."
                      value={searchQuery}
                      onChange={(e) => handleSearchMedicine(e.target.value)}
                      className="mt-1.5 focus:ring-2 focus:ring-blue-500"
                    />
                    {medicineSearchResults.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                        {medicineSearchResults.map((medicine, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm"
                            onClick={() => handleSelectMedicine(medicine)}
                          >
                            {medicine.name} - {medicine.dosage}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medicine-name" className="text-sm font-medium text-gray-700">Name</Label>
                      <Input
                        id="medicine-name"
                        value={newMedicine.name}
                        onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                        className="mt-1.5 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="medicine-dosage" className="text-sm font-medium text-gray-700">Dosage</Label>
                      <Input
                        id="medicine-dosage"
                        value={newMedicine.dosage}
                        onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                        className="mt-1.5 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medicine-frequency" className="text-sm font-medium text-gray-700">Frequency</Label>
                      <Input
                        id="medicine-frequency"
                        value={newMedicine.frequency}
                        onChange={(e) => setNewMedicine({ ...newMedicine, frequency: e.target.value })}
                        className="mt-1.5 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="medicine-duration" className="text-sm font-medium text-gray-700">Duration</Label>
                      <Input
                        id="medicine-duration"
                        value={newMedicine.duration}
                        onChange={(e) => setNewMedicine({ ...newMedicine, duration: e.target.value })}
                        className="mt-1.5 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="medicine-notes" className="text-sm font-medium text-gray-700">Notes (Optional)</Label>
                    <Input
                      id="medicine-notes"
                      value={newMedicine.notes}
                      onChange={(e) => setNewMedicine({ ...newMedicine, notes: e.target.value })}
                      className="mt-1.5 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="button"
                    onClick={handleAddMedicine} 
                    className="bg-doctor hover:bg-green-700"
                  >
                    Add Medicine
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {medicines.length > 0 ? (
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Medicine</TableHead>
                    <TableHead className="font-semibold text-gray-700">Dosage</TableHead>
                    <TableHead className="font-semibold text-gray-700">Frequency</TableHead>
                    <TableHead className="font-semibold text-gray-700">Duration</TableHead>
                    <TableHead className="font-semibold text-gray-700">Notes</TableHead>
                    <TableHead className="w-[100px] font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicines.map((medicine, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <TableCell className="font-medium">{medicine.name}</TableCell>
                      <TableCell>{medicine.dosage}</TableCell>
                      <TableCell>{medicine.frequency}</TableCell>
                      <TableCell>{medicine.duration}</TableCell>
                      <TableCell className="text-gray-600">{medicine.notes}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditMedicine(index)}
                            className="hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveMedicine(index)}
                            className="hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
              <div className="flex flex-col items-center gap-2">
                <Plus className="h-8 w-8 text-gray-400" />
                <p>No medicines added yet</p>
                <p className="text-sm text-gray-400">Click "Add Medicine" to start</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Instructions</h3>
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Enter instructions for the patient"
            className="min-h-[100px] resize-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Follow-up</h3>
          <Select value={followUp} onValueChange={setFollowUp}>
            <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Select follow-up period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="No follow-up needed">No follow-up needed</SelectItem>
              <SelectItem value="1 week">1 week</SelectItem>
              <SelectItem value="2 weeks">2 weeks</SelectItem>
              <SelectItem value="1 month">1 month</SelectItem>
              <SelectItem value="3 months">3 months</SelectItem>
              <SelectItem value="As needed">As needed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
        <Button 
          variant="outline" 
          className="border-gray-200 hover:bg-gray-100"
          onClick={handleExportPDF}
          disabled={!medicines.length || !diagnosis.trim()}
        >
          <Download className="mr-2 h-4 w-4" /> Export PDF
        </Button>
        <Button 
          onClick={handleSavePrescription} 
          disabled={isLoading || !medicines.length || !diagnosis.trim()} 
          className="bg-doctor hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> {isEditing ? 'Update' : 'Save'} Prescription
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
