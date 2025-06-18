import { NextResponse } from "next/server"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"

export async function GET() {
  try {
    const recordsRef = ref(database, 'medicalRecords')
    const snapshot = await get(recordsRef)

    if (!snapshot.exists()) {
      return NextResponse.json({ records: [] })
    }

    const records = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
      id,
      ...data
    }))

    return NextResponse.json({ records })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch medical records" },
      { status: 500 }
    )
  }
}