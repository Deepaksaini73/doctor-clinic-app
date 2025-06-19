import { ref, get, set, push } from "firebase/database";

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface SavePrescriptionParams {
  appointment: any;
  medicines: Medicine[];
  diagnosis: string;
  instructions: string;
  followUp: string;
  symptoms: string[];
  database: any;
  toast: (args: any) => void;
  setIsLoading: (value: boolean) => void;
  setMedicines: (medicines: Medicine[]) => void;
  setInstructions: (value: string) => void;
  setFollowUp: (value: string) => void;
  setIsSaved: (value: boolean) => void;
  onClose?: () => void;
  router: any;
}

export const handleSavePrescription = async ({
  appointment,
  medicines,
  diagnosis,
  instructions,
  followUp,
  symptoms,
  database,
  toast,
  setIsLoading,
  setMedicines,
  setInstructions,
  setFollowUp,
  setIsSaved,
  onClose,
  router
}: SavePrescriptionParams) => {
    if (!appointment) return

    if (!medicines.length) {
      toast({
        title: "Error",
        description: "Please add at least one medicine",
        variant: "destructive"
      })
      return
    }

    if (!diagnosis.trim()) {
      toast({
        title: "Error",
        description: "Please add a diagnosis",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      // Check if prescription already exists for this appointment
      const prescriptionsRef = ref(database, 'prescriptions')
      const snapshot = await get(prescriptionsRef)
      
      let prescriptionId = null
      if (snapshot.exists()) {
        const prescriptions = snapshot.val()
        const existingPrescription = Object.entries(prescriptions).find(
          ([_, prescription]: [string, any]) => prescription.appointmentId === appointment.id
        )
        if (existingPrescription) {
          prescriptionId = existingPrescription[0]
        }
      }

      const prescriptionData = {
        id: prescriptionId || push(prescriptionsRef).key,
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        date: new Date().toISOString(),
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        doctorAge: appointment.patientAge,
        diagnosis: diagnosis,
        medicines: medicines.map(medicine => ({
          name: medicine.name,
          dosage: medicine.dosage,
          frequency: medicine.frequency,
          duration: medicine.duration,
          notes: medicine.notes || ''
        })),
        instructions,
        followUp
      }

      // If prescription exists, update it; otherwise create new
      const prescriptionRef = ref(database, `prescriptions/${prescriptionId || prescriptionData.id}`)
      await set(prescriptionRef, prescriptionData)

      // Update appointment status to completed
      const appointmentRef = ref(database, `appointments/${appointment.id}`)
      await set(appointmentRef, {
        ...appointment,
        status: 'completed'
      })

      // Update doctor's total patients count
      const doctorRef = ref(database, `doctors/${appointment.doctorId}`)
      const doctorSnapshot = await get(doctorRef)
      
      if (doctorSnapshot.exists()) {
        const doctorData = doctorSnapshot.val()
        const currentTotalPatients = doctorData.totalPatients || 0
        
        // Get all appointments for this doctor
        const appointmentsRef = ref(database, 'appointments')
        const appointmentsSnapshot = await get(appointmentsRef)
        
        if (appointmentsSnapshot.exists()) {
          const appointments = appointmentsSnapshot.val()
          // Count unique patients with completed appointments for this doctor
          const uniquePatients = new Set()
          
          Object.values(appointments).forEach((app: any) => {
            if (app.doctorId === appointment.doctorId && app.status === 'completed') {
              uniquePatients.add(app.patientId)
            }
          })
          
          // Update doctor's total patients count
          await set(doctorRef, {
            ...doctorData,
            totalPatients: uniquePatients.size
          })
        }
      }

      const updateSymptomMedicineData = async () => {
        try {
          // Get symptoms from the appointment
          const currentSymptoms = symptoms || [];
          
          // Reference to symptoms-medicines mapping
          const symptomsMedicinesRef = ref(database, 'symptoms_medicines');
          
          // For each symptom, update medicine frequencies
          for (const symptom of currentSymptoms) {
            const symptomRef = ref(database, `symptoms_medicines/${symptom}`);
            const symptomSnapshot = await get(symptomRef);
            const existingData = symptomSnapshot.exists() ? symptomSnapshot.val() : {};
            
            // Update frequencies for each medicine
            for (const medicine of medicines) {
              const medicineKey = medicine.name.toLowerCase().replace(/\s+/g, '_');
              existingData[medicineKey] = {
                name: medicine.name,
                dosage: medicine.dosage,
                frequency: medicine.frequency,
                duration: medicine.duration,
                count: (existingData[medicineKey]?.count || 0) + 1
              };
            }
            
            // Save updated data
            await set(symptomRef, existingData);
          }
          
          // Save doctor-specific prescriptions
          const doctorPrescriptionsRef = ref(
            database, 
            `doctors_prescriptions/${appointment.doctorId}`
          );
          
          const doctorSnapshot = await get(doctorPrescriptionsRef);
          const doctorPrescriptions = doctorSnapshot.exists() 
            ? doctorSnapshot.val() 
            : {};
          
          // Update for each symptom
          for (const symptom of currentSymptoms) {
            if (!doctorPrescriptions[symptom]) {
              doctorPrescriptions[symptom] = { medicines: [] };
            }
            
            // Add new prescription data
            doctorPrescriptions[symptom].medicines.push({
              diagnosis: diagnosis,
              medicines: medicines,
              date: new Date().toISOString(),
              patientId: appointment.patientId,
              prescriptionId: prescriptionData.id
            });
            
            // Keep only last 10 prescriptions per symptom
            if (doctorPrescriptions[symptom].medicines.length > 10) {
              doctorPrescriptions[symptom].medicines = 
                doctorPrescriptions[symptom].medicines.slice(-10);
            }
          }
          
          // Save doctor's prescription history
          await set(doctorPrescriptionsRef, doctorPrescriptions);

        } catch (error) {
          console.error("Error updating symptom-medicine data:", error);
          throw error;
        }
      };

      // Update symptom-medicine relationships
      await updateSymptomMedicineData();
      
      toast({
        title: "Prescription Saved",
        description: "Prescription and symptom data have been saved successfully.",
      })
      
      // Reset states
      setMedicines([])
      setInstructions("")
      setFollowUp("No follow-up needed")
      setIsSaved(true)
      if (onClose) {
        onClose()
      }
      router.refresh()

    } catch (error) {
      console.error("Error saving prescription:", error)
      toast({
        title: "Error",
        description: "Failed to save prescription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
}