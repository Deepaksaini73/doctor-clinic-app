import { NextResponse } from "next/server"
import { database } from "@/lib/firebase"
import { ref, get, push, set } from "firebase/database"

export async function GET() {
  try {
    const appointmentsRef = ref(database, 'appointments')
    const snapshot = await get(appointmentsRef)

    if (!snapshot.exists()) {
      return NextResponse.json({ appointments: [] })
    }

    const appointments = Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      ...data,
    }))

    return NextResponse.json({ appointments })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const appointmentsRef = ref(database, 'appointments')
    const newAppointmentRef = push(appointmentsRef)
    await set(newAppointmentRef, data)

    return NextResponse.json({ 
      message: "Appointment created successfully",
      id: newAppointmentRef.key
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    )
  }
}
