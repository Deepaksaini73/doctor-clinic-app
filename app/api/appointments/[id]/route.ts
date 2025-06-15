import { NextResponse } from "next/server"
import { mockAppointments } from "@/lib/mock-data"
import type { Appointment } from "@/lib/types"

const appointments = [...mockAppointments]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const appointment = appointments.find((app) => app.id === id)

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
  }

  return NextResponse.json(appointment)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const updatedData: Partial<Appointment> = await request.json()

    const appointmentIndex = appointments.findIndex((app) => app.id === id)

    if (appointmentIndex === -1) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      ...updatedData,
    }

    return NextResponse.json(appointments[appointmentIndex])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 400 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const appointmentIndex = appointments.findIndex((app) => app.id === id)

  if (appointmentIndex === -1) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
  }

  appointments.splice(appointmentIndex, 1)

  return NextResponse.json({ message: "Appointment deleted successfully" })
}
