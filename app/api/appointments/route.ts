import { NextResponse } from "next/server"
import { mockAppointments } from "@/lib/mock-data"
import type { Appointment } from "@/lib/types"

const appointments = [...mockAppointments]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")
  const doctorId = searchParams.get("doctorId")

  let filteredAppointments = [...appointments]

  if (date) {
    filteredAppointments = filteredAppointments.filter((app) => app.date === date)
  }

  if (doctorId) {
    filteredAppointments = filteredAppointments.filter((app) => app.doctorId === doctorId)
  }

  return NextResponse.json(filteredAppointments)
}

export async function POST(request: Request) {
  try {
    const newAppointment: Appointment = await request.json()

    // Generate a unique ID
    newAppointment.id = `a${appointments.length + 1}`

    // Set default status if not provided
    if (!newAppointment.status) {
      newAppointment.status = "scheduled"
    }

    // Set default priority if not provided
    if (!newAppointment.priority) {
      newAppointment.priority = "routine"
    }

    appointments.push(newAppointment)

    return NextResponse.json(newAppointment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 400 })
  }
}
