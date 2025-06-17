import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/firebase";
import { ref, get } from "firebase/database";

// Type definitions for medication data
interface MedicationPattern {
  name: string;
  count: number;
  dosages: string[];
  frequencies: string[];
  durations: string[];
  symptoms: string[];
}

interface RequestData {
  doctorId: string;
  doctorName: string;
  symptoms: string[];
}

interface MedicationResponse {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Extract request data
    const data: RequestData = await req.json();
    const { doctorId, doctorName, symptoms } = data;

    // Get doctor's prescription history
    const prefsRef = ref(database, `mcp/doctors/${doctorId}/symptom-patterns`);
    const snapshot = await get(prefsRef);

    // Initialize pattern storage
    let medicationPatterns: Record<string, MedicationPattern> = {};
    let symptomMedicationMap: Record<string, Set<string>> = {};

    if (snapshot.exists()) {
      const patterns = snapshot.val();
      
      // Process each symptom pattern
      Object.values(patterns).forEach((pattern: any) => {
        pattern.medications?.forEach((med: any) => {
          if (!medicationPatterns[med.name]) {
            medicationPatterns[med.name] = {
              name: med.name,
              count: 0,
              dosages: [],
              frequencies: [],
              durations: [],
              symptoms: []
            };
          }

          const currentPattern = medicationPatterns[med.name];
          currentPattern.count += med.count;

          // Add unique values to arrays
          med.patterns.forEach((p: any) => {
            if (!currentPattern.dosages.includes(p.dosage)) {
              currentPattern.dosages.push(p.dosage);
            }
            if (!currentPattern.frequencies.includes(p.frequency)) {
              currentPattern.frequencies.push(p.frequency);
            }
            if (!currentPattern.durations.includes(p.duration)) {
              currentPattern.durations.push(p.duration);
            }
          });

          // Map symptoms to medications
          if (!symptomMedicationMap[pattern.symptom]) {
            symptomMedicationMap[pattern.symptom] = new Set();
          }
          symptomMedicationMap[pattern.symptom].add(med.name);
        });
      });
    }

    // Get relevant medications for current symptoms
    const relevantMeds = new Set<string>();
    symptoms.forEach(symptom => {
      const relatedMeds = symptomMedicationMap[symptom] || new Set();
      relatedMeds.forEach(med => relevantMeds.add(med));
    });

    // Format medication patterns for prompt
    const medicationDetails = Object.values(medicationPatterns)
      .filter(pattern => relevantMeds.has(pattern.name))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(pattern => ({
        name: pattern.name,
        commonDosage: pattern.dosages[0],
        commonFrequency: pattern.frequencies[0],
        commonDuration: pattern.durations[0],
        prescriptionCount: pattern.count
      }));

    // Generate AI prompt
    const prompt = `
      Based on Dr. ${doctorName}'s prescription history:

      Current Symptoms: ${symptoms.join(", ")}

      Most frequently prescribed medications for these symptoms:
      ${medicationDetails.map(med => `
        - ${med.name}:
          * Prescribed ${med.prescriptionCount} times
          * Typical dosage: ${med.commonDosage}
          * Usually given: ${med.commonFrequency}
          * Common duration: ${med.commonDuration}
      `).join("\n")}

      Generate a prescription following these patterns and current medical best practices.
      Return ONLY a JSON array with this structure:
      [
        {
          "name": "Medicine Name",
          "dosage": "Dosage",
          "frequency": "Frequency",
          "duration": "Duration",
          "notes": "Special instructions"
        }
      ]
    `;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    // Process API response
    const aiResponse = await response.json();
    
    if (!aiResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response structure from Gemini API");
    }

    // Parse and validate AI response
    const output = aiResponse.candidates[0].content.parts[0].text;
    try {
      const cleanedOutput = output.trim().replace(/^```json\n?|\n?```$/g, '');
      const suggestions: MedicationResponse[] = JSON.parse(cleanedOutput);
      
      if (!Array.isArray(suggestions)) {
        throw new Error("Response is not an array");
      }

      return NextResponse.json({ suggestions });
    } catch (jsonError) {
      console.error("Error parsing Gemini response:", jsonError, "Raw output:", output);
      throw new Error("Invalid response format from AI");
    }

  } catch (error) {
    console.error("Error in Gemini API:", error);
    return NextResponse.json({ 
      error: "Failed to generate prescription",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}