import { NextResponse } from "next/server"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"

export async function GET() {
  try {
    // Fetch both appointments and doctors data
    const [appointmentsSnapshot, doctorsSnapshot] = await Promise.all([
      get(ref(database, 'appointments')),
      get(ref(database, 'doctors'))
    ]);

    const appointments = appointmentsSnapshot.exists() 
      ? Object.entries(appointmentsSnapshot.val()).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }))
      : [];

    const doctors = doctorsSnapshot.exists()
      ? Object.entries(doctorsSnapshot.val()).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }))
      : [];

    return NextResponse.json({
      appointments,
      doctors
    })
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    )
  }
}