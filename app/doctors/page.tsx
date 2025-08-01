"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, UserCheck, Calendar, Clock, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import MainLayout from "@/components/layout/main-layout"
import { ref, onValue, push, remove, DataSnapshot, get, update } from "firebase/database"
import { database } from "@/lib/firebase"
import { Toaster } from "@/components/ui/toaster"

// Update Doctor interface
interface Doctor {
  id: string
  name: string
  email: string
  specialization: string
  phone: string
  experience: number
  qualification: string
  availability: {
    days: string[]
    hours: string
  }
  status: "active" | "inactive"
  joinDate: string
  doctorId: string
}

const fetchDoctorIdByEmail = async (email: string) => {
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const users = Object.values(snapshot.val());
      const doctor = users.find((user: any) => 
        user.email === email && user.role === 'doctor'
      );
      
      if (doctor) {
        return doctor.userId;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching doctor ID:', error);
    return null;
  }
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSpecialization, setFilterSpecialization] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const { toast } = useToast()

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return {
      value: `${hour.toString().padStart(2, '0')}:00`,
      label: `${hour12}:00 ${ampm}`
    };
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const emptyDoctor = {
    name: "",
    email: "",
    specialization: "",
    phone: "",
    experience: "",
    qualification: "",
    availableDays: [] as string[],
    availableTime: {
      start: "",
      end: ""
    },
    doctorId: "" // Initialize as empty string instead of generating
  };
  const [newDoctor, setNewDoctor] = useState(emptyDoctor);

  const specializations = [
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Orthopedics",
    "Dermatology",
    "Psychiatry",
    "Radiology",
    "Emergency Medicine",
    "Internal Medicine",
    "Surgery",
  ]

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  useEffect(() => {
    const doctorsRef = ref(database, 'doctors');
    const unsubscribe = onValue(doctorsRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        const doctorsList = Object.entries(data).map(([id, doctor]: [string, any]) => ({
          id,
          ...doctor
        }));
        setDoctors(doctorsList);
      } else {
        setDoctors([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.phone.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = filterSpecialization === "all" || doctor.specialization === filterSpecialization
    return matchesSearch && matchesSpecialization
  })

  const handleAddOrUpdateDoctor = async () => {
    if (!newDoctor.name || !newDoctor.email || !newDoctor.specialization || !newDoctor.doctorId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and ensure doctor email exists in users",
        variant: "destructive",
      })
      return
    }

    const doctorData = {
      name: newDoctor.name,
      email: newDoctor.email,
      specialization: newDoctor.specialization,
      phone: newDoctor.phone,
      experience: Number.parseInt(newDoctor.experience) || 0,
      qualification: newDoctor.qualification,
      availability: {
        days: newDoctor.availableDays,
        hours: `${newDoctor.availableTime.start} - ${newDoctor.availableTime.end}`,
      },
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      doctorId: newDoctor.doctorId,
    };

    try {
      const doctorsRef = ref(database, 'doctors');
      if (isEditMode && editingDoctor) {
        await update(ref(database, `doctors/${editingDoctor.id}`), doctorData);
        toast({
          title: "Success",
          description: "Doctor updated successfully",
        });
      } else {
        await push(doctorsRef, doctorData);
        toast({
          title: "Success",
          description: "Doctor added successfully",
        });
      }

      setNewDoctor(emptyDoctor);
      setIsAddDialogOpen(false);
      setIsEditMode(false);
      setEditingDoctor(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save doctor information",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    try {
      const doctorRef = ref(database, `doctors/${id}`);
      const snapshot = await get(doctorRef); // Get a snapshot to check if the doctor exists

      if (!snapshot.exists()) {
        toast({
          title: "Error",
          description: "Doctor not found in the database.",
          variant: "destructive",
        });
        return;
      }

      await remove(doctorRef); // Await the remove operation
      toast({
        title: "Success",
        description: "Doctor removed successfully from the database.",
      });
    } catch (error) {
      console.error("Error deleting doctor:", error);
      toast({
        title: "Error",
        description: "Failed to delete doctor. Please check your Firebase rules and try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = (id: string) => {
    setDoctors(
      doctors.map((doctor) =>
        doctor.id === id ? { ...doctor, status: doctor.status === "active" ? "inactive" : "active" } : doctor,
      ),
    )
  }

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsEditMode(true);
    setNewDoctor({
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      phone: doctor.phone || "",
      experience: doctor.experience?.toString() || "",
      qualification: doctor.qualification || "",
      availableDays: doctor.availability?.days || [],
      availableTime: {
        start: doctor.availability?.hours?.split(" - ")[0] || "",
        end: doctor.availability?.hours?.split(" - ")[1] || ""
      },
      doctorId: doctor.doctorId
    });
    setIsAddDialogOpen(true);
  };

  const stats = {
    totalDoctors: doctors.length,
    activeDoctors: doctors.filter((d) => d.status === "active").length,
  }

  return (
    <MainLayout title="Doctor Management" subtitle="Manage doctors, schedules, and availability">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                    <UserCheck className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                    <Calendar className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Active Doctors</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.activeDoctors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctors Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>All Doctors</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setIsEditMode(false);
                      setNewDoctor(emptyDoctor);
                      setIsAddDialogOpen(true);
                    }} 
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Doctor
                  </Button>
                </DialogTrigger>
                <DialogContent className="text-black max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={newDoctor.name}
                          onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                          placeholder="Dr. John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="doctorId">Doctor ID</Label>
                        <Input
                          id="doctorId"
                          value={newDoctor.doctorId || ''} // Add fallback empty string
                          readOnly
                          placeholder="auto fill by email"
                          className="bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newDoctor.email || ''} // Add fallback empty string
                          onChange={async (e) => {
                            const email = e.target.value;
                            setNewDoctor(prev => ({ ...prev, email })); // Update email first
                            
                            if (email && !isEditMode) {
                              try {
                                const doctorId = await fetchDoctorIdByEmail(email);
                                if (doctorId) {
                                  setNewDoctor(prev => ({ ...prev, doctorId }));
                                } else {
                                  toast({
                                    title: "Warning",
                                    description: "Doctor email not found in users database",
                                    variant: "destructive",
                                  });
                                  setNewDoctor(prev => ({ ...prev, doctorId: "" })); // Reset doctorId if not found
                                }
                              } catch (error) {
                                console.error("Error fetching doctor ID:", error);
                                toast({
                                  title: "Error",
                                  description: "Failed to fetch doctor ID",
                                  variant: "destructive",
                                });
                              }
                            }
                          }}
                          placeholder="john.doe@gamil.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newDoctor.phone}
                          onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                          placeholder="+91 9667737373"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="specialization">Specialization *</Label>
                        <Select 
                          value={newDoctor.specialization} 
                          onValueChange={(value) => setNewDoctor({ ...newDoctor, specialization: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                          <SelectContent>
                            {specializations.map((spec) => (
                              <SelectItem key={spec} value={spec}>
                                {spec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="experience">Experience (Years)</Label>
                        <Input
                          id="experience"
                          type="number"
                          value={newDoctor.experience}
                          onChange={(e) => setNewDoctor({ ...newDoctor, experience: e.target.value })}
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="qualification">Qualification</Label>
                        <Input
                          id="qualification"
                          value={newDoctor.qualification}
                          onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })}
                          placeholder="MD, MBBS"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Available Days</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {daysOfWeek.map((day) => (
                          <label key={day} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={newDoctor.availableDays.includes(day)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewDoctor({
                                    ...newDoctor,
                                    availableDays: [...newDoctor.availableDays, day],
                                  })
                                } else {
                                  setNewDoctor({
                                    ...newDoctor,
                                    availableDays: newDoctor.availableDays.filter((d) => d !== day),
                                  })
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{day.slice(0, 3)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Available Hours</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label>Start Time</Label>
                          <Select
                            value={newDoctor.availableTime.start}
                            onValueChange={(value) => 
                              setNewDoctor({
                                ...newDoctor,
                                availableTime: { ...newDoctor.availableTime, start: value }
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select start time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={time.value} value={time.value}>
                                  {time.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>End Time</Label>
                          <Select
                            value={newDoctor.availableTime.end}
                            onValueChange={(value) => 
                              setNewDoctor({
                                ...newDoctor,
                                availableTime: { ...newDoctor.availableTime, end: value }
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select end time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={time.value} value={time.value}>
                                  {time.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                      <Button onClick={handleAddOrUpdateDoctor} className="bg-blue-600 hover:bg-blue-700 flex-1">
                        {isEditMode ? "Update Doctor" : "Add Doctor"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Unified Search and Filter - Responsive for all screens */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 sticky top-0 bg-white z-10">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Doctor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Specialization</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Experience</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Doctor ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-medium text-sm">
                              {doctor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{doctor.name}</div>
                            <div className="text-sm text-gray-500">{doctor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{doctor.specialization}</td>
                      <td className="py-3 px-4 text-sm">{doctor.experience} years</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            doctor.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }
                          onClick={() => handleToggleStatus(doctor.id)}
                        >
                          {doctor.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditDoctor(doctor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteDoctor(doctor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-mono">{doctor.doctorId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile and Tablet Card View */}
            <div className="lg:hidden space-y-4">
              <div className="space-y-4 mt-4">
                {filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      {/* Doctor Header */}
                      <div className="p-4 bg-gray-50 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-lg">
                                {doctor.name.split(" ").map((n) => n[0]).join("")}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{doctor.name}</h3>
                              <p className="text-sm text-gray-600">{doctor.email}</p>
                            </div>
                          </div>
                          <Badge
                            className={`${
                              doctor.status === "active" 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : "bg-red-100 text-red-800 border-red-200"
                            } px-3 py-1 text-sm font-medium`}
                            onClick={() => handleToggleStatus(doctor.id)}
                          >
                            {doctor.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Doctor Details */}
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Specialization</p>
                            <p className="font-medium">{doctor.specialization}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Experience</p>
                            <p className="font-medium">{doctor.experience} years</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{doctor.phone || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Doctor ID</p>
                            <p className="font-mono text-sm">{doctor.doctorId}</p>
                          </div>
                        </div>

                        {/* Availability */}
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Available Days</p>
                          <div className="flex flex-wrap gap-1">
                            {doctor.availability?.days.map((day) => (
                              <Badge key={day} variant="secondary" className="bg-blue-50 text-blue-700">
                                {day.slice(0, 3)}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1 sm:flex-none h-10"
                            onClick={() => handleEditDoctor(doctor)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none h-10 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            onClick={() => handleDeleteDoctor(doctor.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredDoctors.length === 0 && (
                <div className="text-center py-12 px-4">
                  <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No doctors found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </div>

            {filteredDoctors.length === 0 && (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No doctors found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>

  )
}
