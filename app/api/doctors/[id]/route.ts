import { NextResponse } from "next/server"
import { database } from "@/lib/firebase"
import { ref, get, update, remove } from "firebase/database"

// GET single doctor
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const doctorRef = ref(database, `doctors/${params.id}`)
    const snapshot = await get(doctorRef)

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ doctor: { id: params.id, ...snapshot.val() } })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch doctor" },
      { status: 500 }
    )
  }
}

// PUT update doctor
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const doctorRef = ref(database, `doctors/${params.id}`)
    await update(doctorRef, data)

    return NextResponse.json({ message: "Doctor updated successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update doctor" },
      { status: 500 }
    )
  }
}

// DELETE doctor
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const doctorRef = ref(database, `doctors/${params.id}`)
    await remove(doctorRef)

    return NextResponse.json({ message: "Doctor deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete doctor" },
      { status: 500 }
    )
  }
}