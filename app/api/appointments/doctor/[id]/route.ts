import { NextResponse } from "next/server"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentsRef = ref(database, 'appointments')
    const snapshot = await get(appointmentsRef)

    if (!snapshot.exists()) {
      return NextResponse.json({ 
        appointments: [],
        stats: { total: 0, completed: 0, remaining: 0 }
      })
    }

    const today = new Date().toISOString().split("T")[0]
    const appointmentsData = snapshot.val()
    
    const todayAppointments = Object.entries(appointmentsData)
      .map(([id, data]: [string, any]) => ({
        id,
        ...data,
      }))
      .filter(appointment => 
        appointment.doctorId === params.id && 
        appointment.date === today
      )

    const stats = {
      total: todayAppointments.length,
      completed: todayAppointments.filter(a => a.status === 'completed').length,
      remaining: todayAppointments.filter(a => a.status !== 'completed').length
    }

    return NextResponse.json({ 
      appointments: todayAppointments,
      stats
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    )
  }
}