import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExportPDFParams {
  appointment: any;
  diagnosis: string;
  medicines: any[];
  instructions: string;
  followUp: string;
  toast: (args: any) => void;
}

export const handleExportPDF = ({
  appointment,
  diagnosis,
  medicines,
  instructions,
  followUp,
  toast
}: ExportPDFParams) => {
  if (!appointment) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryColor = [41, 128, 185]; // Professional blue
  const secondaryColor = [44, 62, 80]; // Dark slate
  const accentColor = [46, 204, 113]; // Mint green
  const lightGray = [236, 240, 241]; // Light background

  // === WATERMARK ===
  // Replace the rotate functionality with a simpler watermark
  doc.setFontSize(60);
  doc.setTextColor(245, 245, 245);
  doc.setGState(new doc.GState({ opacity: 0.2 }));
  doc.text("PRESCRIPTION", pageWidth/2, pageHeight/2, {
    align: "center",
    angle: 45
  });
  doc.setGState(new doc.GState({ opacity: 1 })); // Reset opacity

  // Alternative approach if angle property doesn't work:
  /*
  doc.setFontSize(60);
  doc.setTextColor(245, 245, 245);
  doc.setGState(new doc.GState({ opacity: 0.2 }));
  for (let i = 0; i < pageHeight; i += 100) {
    doc.text("PRESCRIPTION", pageWidth/2, i, {
      align: "center"
    });
  }
  doc.setGState(new doc.GState({ opacity: 1 }));
  */

  // === BORDER WITH DOUBLE LINES ===
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16, "S");
  doc.setLineWidth(0.2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20, "S");

  // === HEADER ===
  // Header background
  doc.setFillColor(...primaryColor);
  doc.rect(10, 10, pageWidth - 20, 25, "F");

  // Hospital/Clinic Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255);
  doc.text("HEALTHCARE CLINIC", pageWidth / 2, 22, { align: "center" });

  // Contact Info
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("123 Medical Center Drive, Healthcare City", pageWidth / 2, 28, { align: "center" });
  doc.text("📞 +1 234 567 890  |  📧 care@healthcare.com  |  🌐 www.healthcare.com", pageWidth / 2, 33, { align: "center" });

  // === DECORATIVE LINE ===
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.5);
  doc.line(15, 40, pageWidth - 15, 40);

  // === PATIENT INFO BOX ===
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, 45, pageWidth - 30, 35, 3, 3, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...secondaryColor);
  doc.text("PATIENT DETAILS", 20, 55);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Name: ${appointment.patientName}`, 20, 63);
  doc.text(`Age: ${appointment.patientAge} years`, 20, 70);
  doc.text(`Gender: ${appointment.gender}`, 20, 77);
  
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 60, 63);
  doc.text(`Patient ID: ${appointment.patientId || "N/A"}`, pageWidth - 60, 70);

  // === DIAGNOSIS SECTION ===
  doc.setFillColor(...primaryColor);
  doc.setTextColor(255);
  doc.roundedRect(15, 85, pageWidth - 30, 7, 2, 2, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("DIAGNOSIS", 20, 90);

  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const diagnosisLines = doc.splitTextToSize(diagnosis, pageWidth - 35);
  doc.text(diagnosisLines, 20, 98);

  // === MEDICINES TABLE ===
  const tableStartY = 105 + diagnosisLines.length * 6;

  autoTable(doc, {
    startY: tableStartY,
    head: [['Medicine', 'Dosage', 'Frequency', 'Duration', 'Notes']],
    body: medicines.map(med => [
      med.name,
      med.dosage,
      med.frequency,
      med.duration,
      med.notes || "-"
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50]
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 35 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35 },
      4: { cellWidth: 40 }
    },
    styles: {
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // === INSTRUCTIONS & FOLLOW-UP ===
  // Instructions box
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, finalY, pageWidth - 30, 40, 3, 3, "F");
  
  doc.setFillColor(...primaryColor);
  doc.setTextColor(255);
  doc.roundedRect(15, finalY, 80, 7, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("INSTRUCTIONS", 20, finalY + 5);

  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const instructionLines = doc.splitTextToSize(instructions, pageWidth - 35);
  doc.text(instructionLines, 20, finalY + 15);

  // Follow-up section
  const followUpY = finalY + 50;
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, followUpY, pageWidth - 30, 25, 3, 3, "F");
  
  doc.setFillColor(...primaryColor);
  doc.setTextColor(255);
  doc.roundedRect(15, followUpY, 80, 7, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.text("FOLLOW-UP", 20, followUpY + 5);

  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "normal");
  doc.text(followUp, 20, followUpY + 15);

  // === DOCTOR SIGNATURE SECTION ===
  const signatureY = followUpY + 35;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 80, signatureY, pageWidth - 20, signatureY);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(appointment.doctorName, pageWidth - 80, signatureY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Doctor's Signature & Stamp", pageWidth - 80, signatureY + 10);

  // === FOOTER ===
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "This is a digitally generated prescription authorized by Healthcare Clinic.",
    pageWidth / 2,
    pageHeight - 15,
    { align: "center" }
  );

  // Save the PDF
  doc.save(`Prescription_${appointment.patientName}_${new Date().toISOString().split('T')[0]}.pdf`);

  toast({
    title: "Prescription Generated",
    description: "PDF has been created successfully.",
  });
};