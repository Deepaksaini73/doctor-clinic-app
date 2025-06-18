import { NextResponse } from "next/server"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"

export async function GET() {
  try {
    const prescriptionsRef = ref(database, 'prescriptions')
    const snapshot = await get(prescriptionsRef)

    if (!snapshot.exists()) {
      return NextResponse.json({ prescriptions: [] })
    }

    const prescriptions = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
      id,
      ...data,
      medications: data.medicines || []
    }))

    return NextResponse.json({ prescriptions })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 }
    )
  }
}