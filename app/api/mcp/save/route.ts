import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/firebase";
import { ref, get, set } from "firebase/database";

// Define interfaces for type safety
interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionData {
  doctorId: string;
  patientId: string;
  symptoms: string[];
  aiPrescription: Medication[];
  finalPrescription: Medication[];
}

interface MedicationPattern {
  name: string;
  count: number;
  lastUsed: string;
  patterns: {
    dosage: string;
    frequency: string;
    duration: string;
    useCount: number;
  }[];
}

interface SymptomPattern {
  symptom: string;
  medications: MedicationPattern[];
}

export async function POST(req: NextRequest) {
  try {
    const data: PrescriptionData = await req.json();
    
    // 1. Save current prescription
    const prescriptionRef = ref(
      database,
      `mcp/doctors/${data.doctorId}/prescriptions/${Date.now()}`
    );
    
    await set(prescriptionRef, {
      ...data,
      timestamp: new Date().toISOString(),
    });

    // 2. Update symptom patterns
    const patternsRef = ref(
      database,
      `mcp/doctors/${data.doctorId}/symptom-patterns`
    );

    const snapshot = await get(patternsRef);
    const patterns: Record<string, SymptomPattern> = snapshot.exists() 
      ? snapshot.val() 
      : {};

    // 3. Process each symptom
    data.symptoms.forEach(symptom => {
      if (!patterns[symptom]) {
        patterns[symptom] = { symptom, medications: [] };
      }

      // 4. Update medication patterns
      data.finalPrescription.forEach(med => {
        const existingMed = patterns[symptom].medications
          .find(m => m.name === med.name);
        
        if (existingMed) {
          // Update existing medication pattern
          existingMed.count++;
          existingMed.lastUsed = new Date().toISOString();

          const pattern = existingMed.patterns.find(
            p => p.dosage === med.dosage && 
                 p.frequency === med.frequency && 
                 p.duration === med.duration
          );

          if (pattern) {
            pattern.useCount++;
          } else {
            existingMed.patterns.push({
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
              useCount: 1
            });
          }
        } else {
          // Add new medication pattern
          patterns[symptom].medications.push({
            name: med.name,
            count: 1,
            lastUsed: new Date().toISOString(),
            patterns: [{
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
              useCount: 1
            }]
          });
        }
      });
    });

    // 5. Save updated patterns
    await set(patternsRef, patterns);

    return NextResponse.json({ 
      success: true,
      prescriptionId: prescriptionRef.key 
    });

  } catch (error) {
    console.error("Error saving prescription:", error);
    return NextResponse.json(
      { error: "Failed to save prescription data" }, 
      { status: 500 }
    );
  }
}