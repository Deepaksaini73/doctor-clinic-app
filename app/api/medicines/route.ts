import { NextResponse } from "next/server"
import { mockMedicines } from "@/lib/mock-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.toLowerCase()

  if (query) {
    const filteredMedicines = mockMedicines.filter((medicine) => medicine.name.toLowerCase().includes(query))
    return NextResponse.json(filteredMedicines)
  }

  return NextResponse.json(mockMedicines)
}
