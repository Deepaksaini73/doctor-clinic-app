export interface Patient {
  id: string
  name: string
  age: number
  gender: "male" | "female" | "other"
  contact: string
  medicalHistory?: MedicalHistory
}

export interface MedicalHistory {
  allergies: string[]
  chronicConditions: string[]
  pastVisits: Visit[]
}

export interface Visit {
  id: string
  date: string
  doctorId: string
  doctorName: string
  symptoms: string[]
  diagnosis: string
  prescription: Prescription
}

export interface Doctor {
  id: string
  name: string
  specialization: string
  availability: {
    days: string[]
    hours: string
  }
  imageUrl?: string
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientAge: number
  gender: string
  mobileNumber: string
  doctorId: string
  doctorName: string
  date: string
  time: string
  symptoms?: string[]
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  priority: "routine" | "urgent" | "emergency"
  notes?: string
  diagnosis?: string
  createdAt: string
}

export interface Prescription {
  id: string
  medicines: Medicine[]
  instructions: string
  followUp?: string
  diagnosis: string
}

export interface Medicine {
  name: string
  dosage: string
  frequency: string
  duration: string
  notes?: string
}

export interface User {
  id: string
  name: string
  role: "receptionist" | "doctor" | "admin"
  email: string
}

export interface SystemLog {
  id: string
  timestamp: string
  action: string
  userId: string
  userName: string
  userRole: string
  details: string
}
