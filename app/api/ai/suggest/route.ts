import { NextResponse } from "next/server"
import { getAIPrescriptionSuggestions } from "@/lib/mock-data"

export async function POST(request: Request) {
  try {
    const { symptoms } = await request.json()

    if (!symptoms || !Array.isArray(symptoms)) {
      return NextResponse.json({ error: "Invalid request. Symptoms array is required." }, { status: 400 })
    }

    const suggestions = getAIPrescriptionSuggestions(symptoms)

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      medicines: suggestions,
      instructions:
        symptoms.includes("fever") || symptoms.includes("headache")
          ? "Rest and drink plenty of fluids. Avoid strenuous activities."
          : "Follow the prescribed medication regimen. Contact if symptoms persist.",
      followUp: symptoms.some((s) => s.toLowerCase().includes("severe") || s.toLowerCase().includes("chronic"))
        ? "1 week"
        : "2 weeks if needed",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
