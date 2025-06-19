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
}

export const handleGetAISuggestions = async ({
  symptoms,
  appointment,
  database,
  setDiagnosis,
  setMedicines,
  setIsSuggesting,
  toast
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

    for (const symptom of symptoms) {
      const symptomRef = ref(database, `symptoms_medicines/${symptom}`);
      const snapshot = await get(symptomRef);

      if (snapshot.exists()) {
        hasAnyExistingData = true;
        symptomSuggestions.set(symptom, snapshot.val());
      }
    }

    let doctorSpecificMeds: any[] = [];
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

    if (hasAnyExistingData || doctorSpecificMeds.length > 0) {
      const medicineScores = new Map<
        string,
        { medicine: Medicine; score: number; symptoms: Set<string> }
      >();

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

      const coveredSymptoms = new Set<string>();
      medicineScores.forEach(({ symptoms }) => {
        symptoms.forEach(s => coveredSymptoms.add(s));
      });

      let diagnosisText = "Based on analysis of symptoms:\n";
      symptoms.forEach(symptom => {
        diagnosisText += `- ${symptom}: ${coveredSymptoms.has(symptom)
          ? "Found common treatments"
          : "New symptom pattern"}\n`;
      });

      setDiagnosis(diagnosisText);
      setMedicines(sortedMedicines);

      const uncoveredSymptoms = symptoms.filter(s => !coveredSymptoms.has(s));
      if (uncoveredSymptoms.length > 0) {
        const aiResponse = await fetch("/api/medicines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symptoms: uncoveredSymptoms })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          setMedicines(prev => [...prev, ...aiData.medicines]);
          setDiagnosis(prev =>
            `${prev}\n\nAI Suggestions for new symptoms:\n${aiData.diagnosis}`
          );
        }
      }

      toast({
        title: "Suggestions Generated",
        description: `Combined ${coveredSymptoms.size} known patterns${uncoveredSymptoms.length ? " with AI suggestions" : ""}`,
      });
    } else {
      const response = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms })
      });

      if (!response.ok) throw new Error("Failed to get AI suggestions");

      const data = await response.json();
      setDiagnosis(data.diagnosis);
      setMedicines(data.medicines);

      toast({
        title: "AI Suggestions Generated",
        description: "Using AI model as no previous prescriptions found",
      });
    }
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
