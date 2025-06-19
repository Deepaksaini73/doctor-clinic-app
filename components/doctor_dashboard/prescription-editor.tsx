"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Medicine, Appointment, Template } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Checkbox } from "@/components/ui/checkbox"
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

import { handleGetAISuggestions } from "./ai_prescription_component/utils/handlegetAISuggestion"
import { handleSavePrescription } from "./ai_prescription_component/utils/handleSavePrescription"
import { 
  applyTemplate,
  loadDoctorTemplates
} from "./ai_prescription_component/utils/handleTemplate"
import { handleExportPDF } from "./ai_prescription_component/utils/handleExportPdf"

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

  // Add new state
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)

  // Add these new states after other state declarations
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)

  useEffect(() => {
    if (appointment) {
      // Reset prescription when appointment changes
      setMedicines([])
      setInstructions("")
      setFollowUp("No follow-up needed")
    }
  }, [appointment])

  const onClickGetAISuggestions = () => {
    handleGetAISuggestions({
      symptoms,
      appointment,
      database,
      setDiagnosis,
      setMedicines,
      setIsSuggesting,
      toast,
    });
  };

  const onClickSavePrescription = () => {
    handleSavePrescription({
      appointment,
      medicines,
      diagnosis,
      instructions,
      followUp,
      symptoms,
      database,
      toast,
      setIsLoading,
      setMedicines,
      setInstructions,
      setFollowUp,
      setIsSaved,
      onClose,
      router,
      saveAsTemplate // Add this line
    });
  };
  const onClickExportPDF = () => {
  handleExportPDF({
    appointment,
    diagnosis,
    medicines,
    instructions,
    followUp,
    toast
  });
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



  const handleEditMedicine = (index: number) => {
    const medicineToEdit = medicines[index];
    setNewMedicine({
      name: medicineToEdit.name,
      dosage: medicineToEdit.dosage,
      frequency: medicineToEdit.frequency,
      duration: medicineToEdit.duration,
      notes: medicineToEdit.notes || "",
    });
    setEditingMedicineIndex(index);
    setIsEditDialogOpen(true);
  }

  const handleUpdateMedicine = () => {
    if (editingMedicineIndex === null) return;

    if (!newMedicine.name || !newMedicine.dosage || !newMedicine.frequency || !newMedicine.duration) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedMedicines = [...medicines];
      updatedMedicines[editingMedicineIndex] = { ...newMedicine };
      setMedicines(updatedMedicines);

      // Reset form and state
      setNewMedicine({
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        notes: "",
      });
      setEditingMedicineIndex(null);
      setIsEditDialogOpen(false);

      toast({
        title: "Success",
        description: "Medicine updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update medicine"
      });
    }
  }

  // Add this effect to load templates when dialog opens
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!showTemplateDialog || !appointment?.doctorId) return;
      
      setIsLoadingTemplates(true);
      try {
        const doctorTemplates = await loadDoctorTemplates(appointment.doctorId);
        setAvailableTemplates(doctorTemplates); // Remove the spread of prescriptionTemplates
      } catch (error) {
        console.error("Error loading templates:", error);
        toast({
          title: "Error",
          description: "Failed to load templates",
          variant: "destructive"
        });
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [showTemplateDialog, appointment?.doctorId, toast]);

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
              onClick={onClickGetAISuggestions}
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

            {/* Update the Templates Dialog section */}
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-green-200 hover:bg-green-50 hover:text-green-700"
                  onClick={() => setShowTemplateDialog(true)}
                >
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="text-black w-[95vw] max-w-[500px] p-4 md:p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Your Prescription Templates</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Select a saved template to quickly fill the prescription.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto">
                  {isLoadingTemplates ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      {availableTemplates.length > 0 ? (
                        availableTemplates.map((template) => (
                          <Button
                            key={template.id}
                            variant="outline"
                            className="w-full justify-start hover:bg-gray-50 px-3 py-2 h-auto"
                            onClick={() => {
                              setShowTemplateDialog(false);
                              applyTemplate(
                                template,
                                setDiagnosis,
                                setMedicines,
                                setInstructions,
                                setFollowUp,
                                toast
                              );
                            }}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <span className="truncate text-sm">
                                {template.name}
                              </span>
                            </div>
                          </Button>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No saved templates available
                        </div>
                      )}
                    </>
                  )}
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

        {/* Add Template Checkbox */}
        <div className="flex items-center space-x-2 border-t border-gray-100 pt-4">
          <Checkbox
            id="saveTemplate"
            checked={saveAsTemplate}
            onCheckedChange={(checked) => setSaveAsTemplate(checked as boolean)}
            className="data-[state=checked]:bg-doctor data-[state=checked]:border-doctor"
          />
          <Label
            htmlFor="saveTemplate"
            className="text-sm text-gray-600 cursor-pointer select-none"
          >
            Save this diagnosis and medicines as a template for future use
          </Label>
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
          onClick={onClickExportPDF}
          disabled={!medicines.length || !diagnosis.trim()}
        >
          <Download className="mr-2 h-4 w-4" /> Export PDF
        </Button>
        <Button
          onClick={onClickSavePrescription}
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

      {/* Edit Medicine Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Medicine</DialogTitle>
            <DialogDescription className="text-gray-600">Update medicine details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-medicine-name" className="text-sm font-medium text-gray-700">Name</Label>
                <Input
                  id="edit-medicine-name"
                  value={newMedicine.name}
                  onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                  className="mt-1.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="edit-medicine-dosage" className="text-sm font-medium text-gray-700">Dosage</Label>
                <Input
                  id="edit-medicine-dosage"
                  value={newMedicine.dosage}
                  onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                  className="mt-1.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-medicine-frequency" className="text-sm font-medium text-gray-700">Frequency</Label>
                <Input
                  id="edit-medicine-frequency"
                  value={newMedicine.frequency}
                  onChange={(e) => setNewMedicine({ ...newMedicine, frequency: e.target.value })}
                  className="mt-1.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="edit-medicine-duration" className="text-sm font-medium text-gray-700">Duration</Label>
                <Input
                  id="edit-medicine-duration"
                  value={newMedicine.duration}
                  onChange={(e) => setNewMedicine({ ...newMedicine, duration: e.target.value })}
                  className="mt-1.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-medicine-notes" className="text-sm font-medium text-gray-700">Notes (Optional)</Label>
              <Input
                id="edit-medicine-notes"
                value={newMedicine.notes}
                onChange={(e) => setNewMedicine({ ...newMedicine, notes: e.target.value })}
                className="mt-1.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewMedicine({
                  name: "",
                  dosage: "",
                  frequency: "",
                  duration: "",
                  notes: "",
                });
                setEditingMedicineIndex(null);
                setIsEditDialogOpen(false);
              }}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateMedicine}
              className="bg-doctor hover:bg-green-700"
            >
              Update Medicine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
