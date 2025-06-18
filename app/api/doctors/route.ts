import { NextResponse } from "next/server"
import { database } from "@/lib/firebase"
import { ref, get, set, remove, push } from "firebase/database"

// GET all doctors
export async function GET() {
  try {
    const doctorsRef = ref(database, 'doctors')
    const snapshot = await get(doctorsRef)

    if (!snapshot.exists()) {
      return NextResponse.json({ doctors: [] })
    }

    const doctors = Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      ...data,
    }))

    return NextResponse.json({ doctors })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    )
  }
}

// POST new doctor
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const doctorsRef = ref(database, 'doctors')
    const newDoctorRef = push(doctorsRef)
    await set(newDoctorRef, data)

    return NextResponse.json({ 
      message: "Doctor created successfully",
      id: newDoctorRef.key
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create doctor" },
      { status: 500 }
    )
  }
}
