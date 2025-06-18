import { NextResponse } from "next/server"

interface FormData {
  patientName: string
  patientAge: number
  gender: "male" | "female" | "other"
  mobileNumber: string
  symptoms: string
  doctorPreference: string
  priority: "routine" | "urgent" | "emergency"
  notes: string
}

const GEMINI_PROMPT = `You are a medical receptionist AI assistant. Extract patient appointment information from the text and return a strict JSON format.

Expected JSON format:
{
  "patientName": string (full name, capitalize first letters),
  "patientAge": number (convert text numbers to digits, e.g. "twenty five" → 25),
  "gender": "male" | "female" | "other" (convert any gender indication to these three options),
  "mobileNumber": string (extract numbers only, format: 10 digits),
  "symptoms": string (all symptoms as comma-separated list, remove duplicates),
  "doctorPreference": string (extract full doctor name if mentioned, with "Dr." prefix),
  "priority": "routine" | "urgent" | "emergency" (based on keywords),
  "notes": string (additional medical details, allergies, or special requirements)
}

Specific Rules:
1. Patient Name:
   - Extract full name
   - Capitalize first letters
   - Look for patterns like "name is", "patient", "for", "this is"

2. Age:
   - Convert all text numbers to digits
   - If range given, use the average
   - Default to 0 if not found

3. Gender:
   - Map variations to "male", "female", or "other"
   - Use "other" if unclear or not mentioned

4. Mobile Number:
   - Extract only numeric digits
   - Must be exactly 10 digits
   - Empty string if invalid

5. Symptoms:
   - List all mentioned symptoms
   - Separate by commas
   - Standardize common terms
   - Remove duplicates

6. Doctor Preference:
   - Include "Dr." prefix
   - Full name if available
   - Empty if not mentioned

7. Priority Mapping:
   - "emergency": critical, severe, immediate, urgent care
   - "urgent": soon, quick, priority
   - "routine": regular, normal, check-up

8. Notes:
   - Include medical history
   - Include allergies
   - Include special requirements
   - Include timing preferences

Important:
- Return ONLY valid JSON
- No additional text or markdown
- Use empty string "" for missing text fields
- Use 0 for missing numbers
- Ensure all fields are present

Example keywords:
- Priority: "needs immediate attention" → "emergency"
- Gender: "gentleman" → "male"
- Age: "mid thirties" → 35
- Symptoms: "coughing and fever" → "cough, fever"

Process the following text and return only the JSON object:`

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json()
    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables")
    }

    const geminiPayload = {
      contents: [{
        parts: [{
          text: `${GEMINI_PROMPT}\n\nText: "${transcript}"`
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        topK: 1,
        topP: 1
      }
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(geminiPayload)
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      throw new Error(`Gemini API error: ${errText}`)
    }

    const geminiData = await geminiRes.json()

    // Extract text and clean it
    let raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ""
    raw = raw.trim()
    // Remove ```json ... ``` if exists
    if (raw.startsWith("```")) {
      raw = raw.replace(/```json|```/g, "").trim()
    }

    let formData: FormData
    try {
      formData = JSON.parse(raw)
    } catch (e) {
      console.error("Failed to parse JSON:", e, "Raw:", raw)
      throw new Error("Gemini response is not valid JSON")
    }

    const responseData: FormData = {
      patientName: formData.patientName || "",
      patientAge: Number(formData.patientAge) || 0,
      gender: formData.gender || "other",
      mobileNumber: formData.mobileNumber || "",
      symptoms: formData.symptoms || "",
      doctorPreference: formData.doctorPreference || "",
      priority: formData.priority || "routine",
      notes: formData.notes || ""
    }

    return NextResponse.json(responseData)

  } catch (err) {
    console.error("Handler error:", err)
    return NextResponse.json(
      { error: (err as Error).message, timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}
