import type { Patient, Doctor, Appointment, Medicine, SystemLog } from "./types"

export const mockPatients: Patient[] = [
  {
    id: "p1",
    name: "John Smith",
    age: 45,
    gender: "male",
    contact: "555-123-4567",
    medicalHistory: {
      allergies: ["Penicillin", "Peanuts"],
      chronicConditions: ["Hypertension"],
      pastVisits: [
        {
          id: "v1",
          date: "2023-05-15",
          doctorId: "d1",
          doctorName: "Dr. Sarah Johnson",
          symptoms: ["Headache", "Dizziness"],
          diagnosis: "Migraine",
          prescription: {
            id: "pr1",
            medicines: [
              {
                name: "Sumatriptan",
                dosage: "50mg",
                frequency: "As needed",
                duration: "Max 2 tablets per day",
              },
            ],
            instructions: "Take in a quiet, dark room. Rest after taking medication.",
          },
        },
      ],
    },
  },
  {
    id: "p2",
    name: "Emily Johnson",
    age: 32,
    gender: "female",
    contact: "555-987-6543",
    medicalHistory: {
      allergies: ["Sulfa drugs"],
      chronicConditions: ["Asthma"],
      pastVisits: [
        {
          id: "v2",
          date: "2023-06-10",
          doctorId: "d2",
          doctorName: "Dr. Michael Chen",
          symptoms: ["Shortness of breath", "Wheezing"],
          diagnosis: "Asthma exacerbation",
          prescription: {
            id: "pr2",
            medicines: [
              {
                name: "Albuterol",
                dosage: "90mcg",
                frequency: "2 puffs every 4-6 hours",
                duration: "7 days",
              },
              {
                name: "Prednisone",
                dosage: "20mg",
                frequency: "Once daily",
                duration: "5 days",
              },
            ],
            instructions: "Use inhaler before physical activity. Avoid triggers.",
            followUp: "1 week",
          },
        },
      ],
    },
  },
  {
    id: "p3",
    name: "Robert Davis",
    age: 58,
    gender: "male",
    contact: "555-456-7890",
    medicalHistory: {
      allergies: [],
      chronicConditions: ["Type 2 Diabetes", "High Cholesterol"],
      pastVisits: [
        {
          id: "v3",
          date: "2023-07-05",
          doctorId: "d3",
          doctorName: "Dr. Lisa Wong",
          symptoms: ["Fatigue", "Increased thirst", "Frequent urination"],
          diagnosis: "Uncontrolled diabetes",
          prescription: {
            id: "pr3",
            medicines: [
              {
                name: "Metformin",
                dosage: "1000mg",
                frequency: "Twice daily with meals",
                duration: "30 days",
              },
              {
                name: "Atorvastatin",
                dosage: "20mg",
                frequency: "Once daily at bedtime",
                duration: "30 days",
              },
            ],
            instructions: "Monitor blood glucose levels daily. Follow diabetic diet.",
            followUp: "2 weeks",
          },
        },
      ],
    },
  },
]

export const mockDoctors: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Sarah Johnson",
    specialization: "Neurology",
    availability: {
      days: ["Monday", "Wednesday", "Friday"],
      hours: "9:00 AM - 5:00 PM",
    },
    imageUrl: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "d2",
    name: "Dr. Michael Chen",
    specialization: "Pulmonology",
    availability: {
      days: ["Monday", "Tuesday", "Thursday"],
      hours: "8:00 AM - 4:00 PM",
    },
    imageUrl: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "d3",
    name: "Dr. Lisa Wong",
    specialization: "Endocrinology",
    availability: {
      days: ["Tuesday", "Wednesday", "Friday"],
      hours: "10:00 AM - 6:00 PM",
    },
    imageUrl: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "d4",
    name: "Dr. James Miller",
    specialization: "General Practice",
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      hours: "9:00 AM - 5:00 PM",
    },
    imageUrl: "/placeholder.svg?height=200&width=200",
  },
]

// Generate today's date in YYYY-MM-DD format
const today = new Date().toISOString().split("T")[0]

export const mockAppointments: Appointment[] = [
  {
    id: "a1",
    patientId: "p1",
    patientName: "John Smith",
    patientAge: 45,
    doctorId: "d1",
    doctorName: "Dr. Sarah Johnson",
    date: today,
    time: "10:00 AM",
    symptoms: ["Severe headache", "Sensitivity to light"],
    status: "scheduled",
    priority: "urgent",
  },
  {
    id: "a2",
    patientId: "p2",
    patientName: "Emily Johnson",
    patientAge: 32,
    doctorId: "d2",
    doctorName: "Dr. Michael Chen",
    date: today,
    time: "11:30 AM",
    symptoms: ["Coughing", "Chest tightness"],
    status: "scheduled",
    priority: "routine",
  },
  {
    id: "a3",
    patientId: "p3",
    patientName: "Robert Davis",
    patientAge: 58,
    doctorId: "d3",
    doctorName: "Dr. Lisa Wong",
    date: today,
    time: "2:00 PM",
    symptoms: ["Dizziness", "Blurred vision"],
    status: "scheduled",
    priority: "routine",
  },
]

export const mockMedicines: Medicine[] = [
  {
    name: "Paracetamol",
    dosage: "500mg",
    frequency: "Every 6 hours",
    duration: "5 days",
  },
  {
    name: "Amoxicillin",
    dosage: "250mg",
    frequency: "Three times daily",
    duration: "7 days",
  },
  {
    name: "Ibuprofen",
    dosage: "400mg",
    frequency: "Every 8 hours",
    duration: "3 days",
  },
  {
    name: "Loratadine",
    dosage: "10mg",
    frequency: "Once daily",
    duration: "14 days",
  },
  {
    name: "Omeprazole",
    dosage: "20mg",
    frequency: "Once daily before breakfast",
    duration: "14 days",
  },
]

export const mockPrescriptionSuggestions = {
  Headache: [
    {
      name: "Paracetamol",
      dosage: "500mg",
      frequency: "Every 6 hours as needed",
      duration: "3 days",
    },
    {
      name: "Ibuprofen",
      dosage: "400mg",
      frequency: "Every 8 hours with food",
      duration: "3 days",
    },
  ],
  Fever: [
    {
      name: "Paracetamol",
      dosage: "500mg",
      frequency: "Every 6 hours as needed",
      duration: "3 days",
    },
  ],
  Cough: [
    {
      name: "Dextromethorphan",
      dosage: "15mg",
      frequency: "Every 6-8 hours as needed",
      duration: "5 days",
    },
    {
      name: "Guaifenesin",
      dosage: "200mg",
      frequency: "Every 4 hours",
      duration: "5 days",
    },
  ],
  "Sore Throat": [
    {
      name: "Benzocaine Lozenge",
      dosage: "1 lozenge",
      frequency: "Every 2 hours as needed",
      duration: "3 days",
    },
  ],
  Allergies: [
    {
      name: "Loratadine",
      dosage: "10mg",
      frequency: "Once daily",
      duration: "14 days",
    },
    {
      name: "Cetirizine",
      dosage: "10mg",
      frequency: "Once daily",
      duration: "14 days",
    },
  ],
}

export const mockSystemLogs: SystemLog[] = [
  {
    id: "log1",
    timestamp: "2023-08-01T09:15:23Z",
    action: "Appointment Created",
    userId: "u1",
    userName: "Jane Receptionist",
    userRole: "receptionist",
    details: "Created appointment for John Smith with Dr. Sarah Johnson",
  },
  {
    id: "log2",
    timestamp: "2023-08-01T10:30:45Z",
    action: "Prescription Updated",
    userId: "d1",
    userName: "Dr. Sarah Johnson",
    userRole: "doctor",
    details: "Updated prescription for patient Emily Johnson",
  },
  {
    id: "log3",
    timestamp: "2023-08-01T11:45:12Z",
    action: "User Login",
    userId: "a1",
    userName: "Admin User",
    userRole: "admin",
    details: "Admin logged into system",
  },
  {
    id: "log4",
    timestamp: "2023-08-01T13:20:33Z",
    action: "Appointment Status Changed",
    userId: "d2",
    userName: "Dr. Michael Chen",
    userRole: "doctor",
    details: "Changed appointment status to completed for Robert Davis",
  },
  {
    id: "log5",
    timestamp: "2023-08-01T14:05:19Z",
    action: "Patient Record Updated",
    userId: "d3",
    userName: "Dr. Lisa Wong",
    userRole: "doctor",
    details: "Updated medical history for patient John Smith",
  },
]

// Mock users for authentication
export const mockUsers = [
  {
    id: "u1",
    name: "Jane Receptionist",
    email: "receptionist@clinic.com",
    password: "password123", // In a real app, this would be hashed
    role: "receptionist",
  },
  {
    id: "d1",
    name: "Dr. Sarah Johnson",
    email: "sarah@clinic.com",
    password: "doctor123",
    role: "doctor",
  },
  {
    id: "a1",
    name: "Admin User",
    email: "admin@clinic.com",
    password: "admin123",
    role: "admin",
  },
]

// Function to get AI prescription suggestions based on symptoms
export function getAIPrescriptionSuggestions(symptoms: string[]) {
  let suggestions: Medicine[] = []

  symptoms.forEach((symptom) => {
    const normalizedSymptom = Object.keys(mockPrescriptionSuggestions).find((key) =>
      symptom.toLowerCase().includes(key.toLowerCase()),
    )

    if (normalizedSymptom && mockPrescriptionSuggestions[normalizedSymptom]) {
      suggestions = [...suggestions, ...mockPrescriptionSuggestions[normalizedSymptom]]
    }
  })

  // Remove duplicates
  const uniqueSuggestions = suggestions.filter(
    (med, index, self) => index === self.findIndex((m) => m.name === med.name),
  )

  return uniqueSuggestions.length > 0
    ? uniqueSuggestions
    : [
        {
          name: "No specific recommendation",
          dosage: "Consult with specialist",
          frequency: "N/A",
          duration: "N/A",
        },
      ]
}
