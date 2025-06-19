// src/utils/templatesHelpers.ts

export const prescriptionTemplates = [
  {
    name: "Common Cold",
    medicines: [
      {
        name: "Paracetamol",
        dosage: "500mg",
        frequency: "Every 6 hours as needed",
        duration: "5 days",
      },
      {
        name: "Chlorpheniramine",
        dosage: "4mg",
        frequency: "Every 8 hours",
        duration: "5 days",
      },
    ],
    instructions: "Rest and drink plenty of fluids. Avoid cold foods and beverages.",
    followUp: "Only if symptoms persist after 5 days",
  },
  {
    name: "Migraine",
    medicines: [
      {
        name: "Sumatriptan",
        dosage: "50mg",
        frequency: "As needed, max 2 tablets per day",
        duration: "As needed",
      },
      {
        name: "Ibuprofen",
        dosage: "400mg",
        frequency: "Every 6 hours as needed",
        duration: "3 days",
      },
    ],
    instructions: "Rest in a quiet, dark room. Apply cold compress to forehead if helpful.",
    followUp: "2 weeks if migraines continue",
  },
];

// Generic helper to apply a template by name
export const applyTemplate = (
  templateName: string,
  setMedicines: (value: any) => void,
  setInstructions: (value: string) => void,
  setFollowUp: (value: string) => void,
  toast: (args: any) => void
) => {
  const template = prescriptionTemplates.find((t) => t.name === templateName);
  if (template) {
    setMedicines(template.medicines);
    setInstructions(template.instructions);
    setFollowUp(template.followUp);

    toast({
      title: "Template Applied",
      description: `Applied the ${templateName} prescription template.`,
    });
  }
};
