import { NextResponse } from "next/server"
import { mockDoctors } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockDoctors)
}
