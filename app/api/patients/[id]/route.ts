import { NextResponse } from "next/server"
import { mockPatients } from "@/lib/mock-data"
import type { Patient } from "@/lib/types"

const patients = [...mockPatients]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const patient = patients.find((p) => p.id === id)

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 })
  }

  return NextResponse.json(patient)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const updatedData: Partial<Patient> = await request.json()

    const patientIndex = patients.findIndex((p) => p.id === id)

    if (patientIndex === -1) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    patients[patientIndex] = {
      ...patients[patientIndex],
      ...updatedData,
    }

    return NextResponse.json(patients[patientIndex])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update patient" }, { status: 400 })
  }
}
