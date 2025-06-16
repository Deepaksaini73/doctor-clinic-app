"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Medicine, Appointment } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash2, Save, Download, Sparkles } from "lucide-react"
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

interface PrescriptionEditorProps {
  appointment: Appointment | null
  symptoms: string[]
}

export default function PrescriptionEditor({ appointment, symptoms }: PrescriptionEditorProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [instructions, setInstructions] = useState("")
  const [followUp, setFollowUp] = useState("No follow-up needed")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [medicineSearchResults, setMedicineSearchResults] = useState<Medicine[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false);
  const { toast } = useToast()

  // New medicine form state
  const [newMedicine, setNewMedicine] = useState<Medicine>({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    notes: "",
  })

  useEffect(() => {
    if (appointment) {
      // Reset prescription when appointment changes
      setMedicines([])
      setInstructions("")
      setFollowUp("No follow-up needed")
    }
  }, [appointment])

  const handleGetAISuggestions = async () => {
    if (!symptoms.length) {
      toast({
        title: "No symptoms",
        description: "Please enter symptoms to get AI suggestions.",
      })
      return
    }

    setIsSuggesting(true)

    try {
      // This is where you would integrate with your ML prescription suggestion system
      // For now, we'll use the mock API
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms }),
      })

      if (!response.ok) throw new Error("Failed to get AI suggestions")

      const data = await response.json()

      setMedicines(data.medicines)
      setInstructions(data.instructions)
      setFollowUp(data.followUp || "No follow-up needed")

      toast({
        title: "AI Suggestions Generated",
        description: "Prescription suggestions have been generated based on symptoms.",
      })
    } catch (error) {
      console.error("Error getting AI suggestions:", error)
      toast({
        title: "Error",
        description: "Failed to get AI suggestions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSuggesting(false)
    }
  }

  const handleAddMedicine = () => {
    if (!newMedicine.name || !newMedicine.dosage || !newMedicine.frequency || !newMedicine.duration) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setMedicines([...medicines, { ...newMedicine }])

    // Reset form
    setNewMedicine({
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      notes: "",
    })
  }

  const handleRemoveMedicine = (index: number) => {
    const updatedMedicines = [...medicines]
    updatedMedicines.splice(index, 1)
    setMedicines(updatedMedicines)
  }

  const handleSavePrescription = async () => {
    if (!appointment) return

    setIsLoading(true)

    try {
      // In a real app, you would save the prescription to the database
      // For this demo, we'll just show a success message

      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      toast({
        title: "Prescription Saved",
        description: "Prescription has been saved successfully.",
      })
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
    setSearchQuery(query)

    if (!query.trim()) {
      setMedicineSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/medicines?q=${encodeURIComponent(query)}`)

      if (!response.ok) throw new Error("Failed to search medicines")

      const data = await response.json()
      setMedicineSearchResults(data)
    } catch (error) {
      console.error("Error searching medicines:", error)
    }
  }

  const handleSelectMedicine = (medicine: Medicine) => {
    setNewMedicine({
      ...newMedicine,
      name: medicine.name,
      dosage: medicine.dosage,
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
    <Card className="h-full border-doctor border-t-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Prescription</CardTitle>
            <CardDescription>Create a prescription for {appointment.patientName}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGetAISuggestions}
              disabled={isSuggesting || !symptoms.length}
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

            <Dialog >
              <DialogTrigger asChild >
                <Button variant="outline" size="sm">
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="text-black">
                <DialogHeader>
                  <DialogTitle>Prescription Templates</DialogTitle>
                  <DialogDescription>Select a template to quickly fill the prescription.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {prescriptionTemplates.map((template) => (
                    <Button
                      key={template.name}
                      variant="outline"
                      className="justify-start"
                      onClick={() => {

                        applyTemplate(template.name)
                        setOpen(false);
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
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            <strong>ML Integration Point:</strong> The AI Suggest button will be connected to your ML prescription
            recommendation engine.
          </AlertDescription>
        </Alert>

        <div>
          <h3 className="font-medium mb-2">Medicines</h3>

          {medicines.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicines.map((medicine, index) => (
                    <TableRow key={index}>
                      <TableCell>{medicine.name}</TableCell>
                      <TableCell>{medicine.dosage}</TableCell>
                      <TableCell>{medicine.frequency}</TableCell>
                      <TableCell>{medicine.duration}</TableCell>
                      <TableCell>{medicine.notes}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveMedicine(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 border rounded-md">No medicines added yet</div>
          )}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 bg-doctor hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" /> Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="text-black">
              <DialogHeader>
                <DialogTitle>Add Medicine</DialogTitle>
                <DialogDescription>Add a new medicine to the prescription.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="relative">
                  <Label htmlFor="medicine-search">Search Medicine</Label>
                  <Input
                    id="medicine-search"
                    placeholder="Type to search medicines..."
                    value={searchQuery}
                    onChange={(e) => handleSearchMedicine(e.target.value)}
                    className="mb-2"
                  />
                  {medicineSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {medicineSearchResults.map((medicine, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
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
                    <Label htmlFor="medicine-name">Name</Label>
                    <Input
                      id="medicine-name"
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="medicine-dosage">Dosage</Label>
                    <Input
                      id="medicine-dosage"
                      value={newMedicine.dosage}
                      onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="medicine-frequency">Frequency</Label>
                    <Input
                      id="medicine-frequency"
                      value={newMedicine.frequency}
                      onChange={(e) => setNewMedicine({ ...newMedicine, frequency: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="medicine-duration">Duration</Label>
                    <Input
                      id="medicine-duration"
                      value={newMedicine.duration}
                      onChange={(e) => setNewMedicine({ ...newMedicine, duration: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="medicine-notes">Notes (Optional)</Label>
                  <Input
                    id="medicine-notes"
                    value={newMedicine.notes}
                    onChange={(e) => setNewMedicine({ ...newMedicine, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddMedicine} className="bg-doctor hover:bg-green-700">
                  Add Medicine
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <h3 className="font-medium mb-2">Instructions</h3>
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Enter instructions for the patient"
            className="min-h-[100px]"
          />
        </div>

        <div>
          <h3 className="font-medium mb-2">Follow-up</h3>
          <Select value={followUp} onValueChange={setFollowUp}>
            <SelectTrigger>
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
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export PDF
        </Button>
        <Button onClick={handleSavePrescription} disabled={isLoading} className="bg-doctor hover:bg-green-700">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Prescription
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
