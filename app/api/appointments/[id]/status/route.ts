import { NextResponse } from "next/server"
import { database } from "@/lib/firebase"
import { ref, update } from "firebase/database"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()
    const appointmentRef = ref(database, `appointments/${params.id}`)
    await update(appointmentRef, { status })

    return NextResponse.json({ message: "Status updated successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    )
  }
}