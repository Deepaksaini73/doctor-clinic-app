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
    console.log("Received request body:", body);
    
    const { symptoms } = body;

    if (!symptoms || !Array.isArray(symptoms)) {
      console.error("Invalid symptoms input:", symptoms);
      return NextResponse.json({ error: "Symptoms array is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Create a prompt for Gemini
    const prompt = `Given these symptoms: ${symptoms.join(", ")}, suggest appropriate medicines with their dosage, frequency, and duration. 
    Format the response as a JSON array of objects with the following structure:
    [
      {
        "name": "medicine name",
        "dosage": "dosage amount",
        "frequency": "how often to take",
        "duration": "how long to take"
      }
    ]
    Only return the JSON array, no other text.`;

    console.log("Sending prompt to Gemini:", prompt);

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
      console.error("Gemini API error response:", errorData);
      return NextResponse.json({ 
        error: "Gemini API request failed", 
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log("Complete Gemini API response:", JSON.stringify(data, null, 2));

    if (!data.candidates || data.candidates.length === 0) {
      console.error("No candidates in Gemini response:", data);
      return NextResponse.json({ 
        error: "Invalid response structure from AI",
        details: data 
      }, { status: 500 });
    }

    const output = data.candidates[0]?.content?.parts?.[0]?.text;
    
    if (!output) {
      console.error("No output in Gemini response. Full response:", JSON.stringify(data, null, 2));
      return NextResponse.json({ 
        error: "No response text from AI",
        details: data 
      }, { status: 500 });
    }

    console.log("Raw text output from Gemini:", output);

    try {
      // Clean the output string to ensure it's valid JSON
      const cleanedOutput = output.trim().replace(/^```json\n?|\n?```$/g, '');
      console.log("Cleaned output:", cleanedOutput);
      
      // Parse the JSON response from Gemini
      const medicines = JSON.parse(cleanedOutput);
      
      if (!Array.isArray(medicines)) {
        throw new Error("Response is not an array");
      }
      
      console.log("Parsed medicines:", medicines);
      return NextResponse.json(medicines, { status: 200 });
    } catch (error) {
      console.error("Error parsing Gemini response:", error, "Raw output:", output);
      return NextResponse.json({ 
        error: "Invalid response format from AI",
        details: { 
          output, 
          parseError: error instanceof Error ? error.message : String(error)
        }
      }, { status: 500 });
    }
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
