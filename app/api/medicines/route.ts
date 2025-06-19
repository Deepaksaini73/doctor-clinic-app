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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symptoms, patientAge } = body;

    if (!symptoms || !Array.isArray(symptoms)) {
      return NextResponse.json({ error: "Symptoms array is required" }, { status: 400 });
    }

    const ageGroup = getAgeGroup(patientAge);
    const ageContext = patientAge ? 
      `for a ${patientAge} year old patient (${ageGroup.category}, ${ageGroup.range})` : 
      "for an adult patient";

    const prompt = `Given the following symptoms: ${symptoms.join(", ")} ${ageContext}, provide a concise clinical assessment including:
1. A clear, one-line medical diagnosis based on the symptoms.
2. A list of suitable medicines with precise dosage (use mg or ml, do not use "per day"), frequency, duration, and very short notes (1-2 lines maximum).

Strict instructions:
- Express dosage using mg or ml units only (avoid vague expressions like "per day").
- Keep notes very brief: maximum 1-2 lines of clear instructions.
- Ensure dosage, frequency, and duration are realistic for the specified age group (${ageContext}).
- Do not add any explanations or disclaimers — return **only** a valid JSON object using this exact format:

{
  "diagnosis": "one-line diagnosis",
  "medicines": [
    {
      "name": "medicine name",
      "dosage": "e.g. 250mg",
      "frequency": "e.g. Every 6 hours",
      "duration": "e.g. 5 days",
      "notes": "1-2 lines only"
    }
  ]
}

This will be verified by a physician. Return the JSON object only — no extra text.
`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: "Gemini API request failed", details: errorData }, { status: response.status });
    }

    const data = await response.json();
    const output = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!output) {
      return NextResponse.json({ error: "No response text from AI" }, { status: 500 });
    }

    try {
      const cleanedOutput = output.trim().replace(/^```json\n?|\n?```$/g, '');
      const result = JSON.parse(cleanedOutput);
      
      if (!result.diagnosis || !Array.isArray(result.medicines)) {
        throw new Error("Invalid response format from AI");
      }
      
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ 
        error: "Invalid response format from AI",
        details: { parseError: error instanceof Error ? error.message : String(error) }
      }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}

// Add this helper function
const getAgeGroup = (age?: number) => {
  if (!age) return { category: "adult", range: "18-65 years" };
  if (age < 2) return { category: "infant", range: "0-2 years" };
  if (age < 12) return { category: "child", range: "2-12 years" };
  if (age < 18) return { category: "teen", range: "12-18 years" };
  if (age < 65) return { category: "adult", range: "18-65 years" };
  return { category: "elderly", range: "65+ years" };
};
