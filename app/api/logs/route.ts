import { NextResponse } from "next/server"
import { mockSystemLogs } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockSystemLogs)
}
