// src/utils/templatesHelpers.ts
import { ref, get } from 'firebase/database'
import { database } from '@/lib/firebase'

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Template {
  id?: string;
  doctorId: string;
  name: string;
  diagnosis: string;
  medicines: Medicine[];
  instructions: string;
  followUp: string;
  createdAt?: string;
  updatedAt?: string;
}

export const applyTemplate = (
  template: Template,
  setDiagnosis: (value: string) => void,
  setMedicines: (value: Medicine[]) => void,
  setInstructions: (value: string) => void,
  setFollowUp: (value: string) => void,
  toast: (args: { title: string; description: string }) => void
) => {
  if (template) {
    setDiagnosis(template.diagnosis);
    setMedicines(template.medicines);
    setInstructions(template.instructions);
    setFollowUp(template.followUp);

    toast({
      title: "Template Applied",
      description: `Applied template: ${template.name}`,
    });
  }
};

export const loadDoctorTemplates = async (doctorId: string): Promise<Template[]> => {
  try {
    const templatesRef = ref(database, `doctor_templates/${doctorId}`);
    const snapshot = await get(templatesRef);
    
    if (!snapshot.exists()) return [];

    return Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
      id,
      ...data,
      doctorId,
      name: data.diagnosis // Using diagnosis as template name
    }));
  } catch (error) {
    console.error("Error loading templates:", error);
    return [];
  }
};
