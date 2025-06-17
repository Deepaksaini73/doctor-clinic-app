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
    const { symptoms } = body;

    if (!symptoms || !Array.isArray(symptoms)) {
      return NextResponse.json({ error: "Symptoms array is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `Given the following symptoms: ${symptoms.join(", ")}, provide a clinical assessment that includes:
    1. A likely medical diagnosis based on the presented symptoms
    2. A list of appropriate medicines with their dosage, frequency, duration, and any specific notes relevant to administration
    
    Format the output strictly as a JSON object using the structure below:
    {
      "diagnosis": "clear and concise medical diagnosis",
      "medicines": [
        {
          "name": "medicine name",
          "dosage": "e.g. 500mg",
          "frequency": "e.g. twice daily",
          "duration": "e.g. 5 days",
          "notes": "specific administration instructions, if any (avoid general health warnings)"
        }
      ]
    }
    
    This output will be reviewed by a supervising physician — no general health disclaimers, warnings, or follow-up advice should be included. Respond only with the JSON object and no additional text.`;
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
