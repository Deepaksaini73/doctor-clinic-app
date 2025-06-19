// src/utils/aiHelpers.ts

import { ref, get } from "firebase/database";

// Tip: Add your Medicine type if needed:
export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface HandleAISuggestionsParams {
  symptoms: string[];
  appointment: any;
  database: any;
  setDiagnosis: (text: string) => void;
  setMedicines: (medicines: Medicine[] | ((prev: Medicine[]) => Medicine[])) => void;
  setIsSuggesting: (value: boolean) => void;
  toast: (args: any) => void;
  doctorSpecificMeds?: Array<{ medicines: Medicine[] }>; // Add this line
}

interface AgeGroup {
  category: "infant" | "child" | "teen" | "adult" | "elderly";
  range: string;
  dosageModifier: number;
}

interface DosageAdjustment {
  medicines: Medicine[];
  adjustmentNotes: string;
}

// Add this function before handleGetAISuggestions
const getAgeGroup = (age: number): AgeGroup => {
  if (age < 2) return { category: "infant", range: "0-2 years", dosageModifier: 0.25 };
  if (age < 12) return { category: "child", range: "2-12 years", dosageModifier: 0.5 };
  if (age < 18) return { category: "teen", range: "12-18 years", dosageModifier: 0.75 };
  if (age < 65) return { category: "adult", range: "18-65 years", dosageModifier: 1 };
  return { category: "elderly", range: "65+ years", dosageModifier: 0.8 };
};

// Add this function to adjust medicines using Gemini
const adjustMedicinesForAge = async (
  medicines: Medicine[],
  patientAge: number
): Promise<Medicine[]> => {
  try {
    console.log("Adjusting medicines for age:", { medicines, patientAge });

    const response = await fetch("/api/adjust-medicines", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        medicines,
        patientAge
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Adjustment Error:", data);
      throw new Error(data.error || "Failed to adjust medicines");
    }

    if (!data.medicines || !Array.isArray(data.medicines)) {
      throw new Error("Invalid response format");
    }

    return data.medicines;

  } catch (error) {
    console.error("Medicine Adjustment Error:", error);
    return medicines.map(med => ({
      ...med,
      notes: `${med.notes || ""}\nWarning: Age adjustment failed. Please verify dosage manually.`
    }));
  }
};

// Modify the existing handleGetAISuggestions function
export const handleGetAISuggestions = async ({
  symptoms,
  appointment,
  database,
  setDiagnosis,
  setMedicines,
  setIsSuggesting,
  toast,
  doctorSpecificMeds = [] // Add default value
}: HandleAISuggestionsParams) => {
  if (!symptoms?.length) {
    toast({
      title: "No symptoms",
      description: "Please add symptoms to get AI suggestions.",
    });
    return;
  }

  setIsSuggesting(true);

  try {
    const symptomSuggestions = new Map<string, any>();
    let hasAnyExistingData = false;

    // First try to get existing data
    for (const symptom of symptoms) {
      const symptomRef = ref(database, `symptoms_medicines/${symptom}`);
      const snapshot = await get(symptomRef);

      if (snapshot.exists()) {
        hasAnyExistingData = true;
        symptomSuggestions.set(symptom, snapshot.val());
      }
    }

    // let doctorSpecificMeds: any[] = [];
    if (appointment?.doctorId) {
      const doctorPrescriptionsRef = ref(
        database,
        `doctors_prescriptions/${appointment.doctorId}`
      );
      const doctorSnapshot = await get(doctorPrescriptionsRef);
      if (doctorSnapshot.exists()) {
        const doctorData = doctorSnapshot.val();
        symptoms.forEach(symptom => {
          if (doctorData[symptom]?.medicines) {
            doctorSpecificMeds.push(...doctorData[symptom].medicines);
          }
        });
      }
    }

    // Update condition to check doctorSpecificMeds length
    if (hasAnyExistingData || doctorSpecificMeds.length > 0) {
      // Get AI diagnosis even if we have medicines
      const aiResponse = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          symptoms,
          patientAge: appointment?.patientAge 
        })
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        // Set the direct AI diagnosis
        setDiagnosis(aiData.diagnosis);
        
        // Process medicines as before
        const medicineScores = new Map<
          string,
          { medicine: Medicine; score: number; symptoms: Set<string> }
        >();

        // Update symptom coverage during medicine processing
        symptomSuggestions.forEach((medicines, symptom) => {
          Object.values(medicines).forEach((med: any) => {
            const key = med.name.toLowerCase();
            if (!medicineScores.has(key)) {
              medicineScores.set(key, {
                medicine: {
                  name: med.name,
                  dosage: med.dosage,
                  frequency: med.frequency,
                  duration: med.duration,
                  notes: ""
                },
                score: med.count || 1,
                symptoms: new Set([symptom])
              });
            } else {
              const existing = medicineScores.get(key)!;
              existing.score += med.count || 1;
              existing.symptoms.add(symptom);
            }
          });
        });

        doctorSpecificMeds.forEach(prescription => {
          prescription.medicines.forEach(med => {
            const key = med.name.toLowerCase();
            if (!medicineScores.has(key)) {
              medicineScores.set(key, {
                medicine: med,
                score: 2,
                symptoms: new Set()
              });
            } else {
              const existing = medicineScores.get(key)!;
              existing.score += 2;
            }
          });
        });

        const sortedMedicines = Array.from(medicineScores.values())
          .sort((a, b) => {
            const symptomDiff = b.symptoms.size - a.symptoms.size;
            if (symptomDiff !== 0) return symptomDiff;
            return b.score - a.score;
          })
          .slice(0, 5)
          .map(({ medicine }) => medicine);

        let finalMedicines = sortedMedicines;

        if (appointment?.patientAge) {
          try {
            const adjustedMedicines = await adjustMedicinesForAge(
              sortedMedicines,
              appointment.patientAge
            );
            if (Array.isArray(adjustedMedicines) && adjustedMedicines.length > 0) {
              finalMedicines = adjustedMedicines;
            }
          } catch (adjustError) {
            console.error("Age adjustment error:", adjustError);
          }
        }

        setMedicines(finalMedicines);
      }
    } else {
      // If no existing data, use AI completely
      const response = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          symptoms,
          patientAge: appointment?.patientAge 
        })
      });

      if (!response.ok) throw new Error("Failed to get AI suggestions");

      const data = await response.json();
      // Set direct AI diagnosis
      setDiagnosis(data.diagnosis);
      setMedicines(data.medicines);
    }

    toast({
      title: "Suggestions Generated",
      description: "AI diagnosis and prescriptions generated successfully",
    });

  } catch (error) {
    console.error("Error getting suggestions:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to get suggestions",
      variant: "destructive",
    });
  } finally {
    setIsSuggesting(false);
  }
};
