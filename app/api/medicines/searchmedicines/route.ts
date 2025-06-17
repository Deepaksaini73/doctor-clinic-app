import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.toLowerCase() || "";

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Return a JSON array of up to 5 medicine names starting with "${query}" and their common dosages. Return ONLY the JSON array without any formatting or explanation:
                  [
                    {
                      "name": "medicine name",
                      "dosage": "Standard Dosage",
                      "frequency": "Standard Frequency",
                      "duration": "Standard Duration"
                    }
                    ...
                  ]`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    let medicines = [];

    try {
      let textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (textOutput) {
        // Clean the response text
        textOutput = textOutput
          .replace(/```json\n?/g, '')  // Remove ```json
          .replace(/```\n?/g, '')      // Remove closing ```
          .trim();                     // Remove extra whitespace

        // Parse cleaned JSON
        medicines = JSON.parse(textOutput);

        // Validate structure
        if (!Array.isArray(medicines)) {
          throw new Error("Response is not an array");
        }

        // Validate each medicine object
        medicines = medicines.filter(medicine => 
          medicine &&
          typeof medicine === 'object' &&
          'name' in medicine &&
          'dosage' in medicine
        );
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      console.log("Raw text received:", data.candidates?.[0]?.content?.parts?.[0]?.text);
      return NextResponse.json([]);
    }

    return NextResponse.json(medicines);

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json([], { status: 500 });
  }
}