import { NextResponse } from "next/server";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface AgeGroup {
  category: "infant" | "child" | "teen" | "adult" | "elderly";
  range: string;
  dosageModifier: number;
}

const getAgeGroup = (age: number): AgeGroup => {
  if (age < 2) return { category: "infant", range: "0-2 years", dosageModifier: 0.25 };
  if (age < 12) return { category: "child", range: "2-12 years", dosageModifier: 0.5 };
  if (age < 18) return { category: "teen", range: "12-18 years", dosageModifier: 0.75 };
  if (age < 65) return { category: "adult", range: "18-65 years", dosageModifier: 1 };
  return { category: "elderly", range: "65+ years", dosageModifier: 0.8 };
};

export async function POST(req: Request) {
  try {
    const { medicines, patientAge } = await req.json();

    if (!medicines?.length || typeof patientAge !== 'number') {
      return NextResponse.json({ 
        error: "Invalid request data" 
      }, { status: 400 });
    }

    const ageGroup = getAgeGroup(patientAge);

    const prompt = `As a medical AI, adjust these medicine prescriptions for a ${patientAge} year old patient (${ageGroup.category}).

Current prescriptions:
${JSON.stringify(medicines, null, 2)}

Requirements:
1. Return ONLY a valid JSON array
2. Keep medicine names exactly the same
3. Adjust dosages for ${ageGroup.range}
4. Add age-specific notes and precautions
5. Consider pediatric/geriatric guidelines
6.Give all data in less text not too much text

Example format:
[
  {
    "name": "Same as input medicine name",
    "dosage": "Age-adjusted dosage",
    "frequency": "Age-appropriate frequency(sort)",
    "duration": "Adjusted duration(sort)",
    "notes": "Age-specific precautions(sort)"
  }
]

Return the adjusted medicines array:`;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1
          }
        })
      }
    );

    if (!response.ok) {
      console.error("Gemini API Error:", await response.text());
      throw new Error("Failed to get AI suggestions");
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid AI response format");
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    try {
      const jsonStart = aiResponse.indexOf('[');
      const jsonEnd = aiResponse.lastIndexOf(']') + 1;
      const jsonStr = aiResponse.slice(jsonStart, jsonEnd);
      
      const adjustedMedicines = JSON.parse(jsonStr) as Medicine[];

      // Validate adjusted medicines
      if (!Array.isArray(adjustedMedicines) || 
          !adjustedMedicines.every(med => 
            med.name && med.dosage && med.frequency && med.duration)) {
        throw new Error("Invalid medicine data structure");
      }

      return NextResponse.json({ medicines: adjustedMedicines });
      
    } catch (parseError) {
      console.error("Parse Error:", parseError);
      return NextResponse.json({
        error: "Failed to parse AI response",
        originalResponse: aiResponse
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ 
      error: "Failed to process request",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}