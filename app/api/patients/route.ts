import { NextResponse } from "next/server"
import { mockPatients } from "@/lib/mock-data"
import type { Patient } from "@/lib/types"

const patients = [...mockPatients]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")?.toLowerCase()

  if (search) {
    const filteredPatients = patients.filter((patient) => patient.name.toLowerCase().includes(search))
    return NextResponse.json(filteredPatients)
  }

  return NextResponse.json(patients)
}

export async function POST(request: Request) {
  try {
    const newPatient: Patient = await request.json()

    // Generate a unique ID
    newPatient.id = `p${patients.length + 1}`

    patients.push(newPatient)

    return NextResponse.json(newPatient, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create patient" }, { status: 400 })
  }
}
