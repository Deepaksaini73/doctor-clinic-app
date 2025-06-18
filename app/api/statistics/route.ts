import { NextResponse } from "next/server"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"

export async function GET() {
  try {
    const [patientsSnap, doctorsSnap, appointmentsSnap] = await Promise.all([
      get(ref(database, 'patients')),
      get(ref(database, 'doctors')),
      get(ref(database, 'appointments'))
    ])

    const stats = {
      totalPatients: patientsSnap.exists() ? Object.keys(patientsSnap.val()).length : 0,
      totalDoctors: doctorsSnap.exists() ? Object.keys(doctorsSnap.val()).length : 0,
      totalAppointments: appointmentsSnap.exists() ? Object.keys(appointmentsSnap.val()).length : 0,
      roomAvailability: 221 // Keeping mocked value
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}