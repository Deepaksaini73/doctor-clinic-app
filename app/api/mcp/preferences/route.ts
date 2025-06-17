import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/firebase";
import { ref, query, orderByChild, limitToLast, get } from "firebase/database";

export async function GET(req: NextRequest) {
  try {
    const doctorId = req.nextUrl.searchParams.get("doctorId");
    const symptoms = req.nextUrl.searchParams.get("symptoms");

    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID is required" }, { status: 400 });
    }

    const prescriptionsRef = ref(database, `mcp/doctors/${doctorId}/prescriptions`);
    const prescriptionsQuery = query(
      prescriptionsRef,
      orderByChild("timestamp"),
      limitToLast(10)
    );

    const snapshot = await get(prescriptionsQuery);
    const frequencyMap: Record<string, number> = {};

    if (snapshot.exists()) {
      snapshot.forEach((childSnap) => {
        const data = childSnap.val();
        data.finalPrescription?.forEach((med: any) => {
          frequencyMap[med.name] = (frequencyMap[med.name] || 0) + 1;
        });
      });
    }

    const frequentMeds = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    return NextResponse.json({ frequentMeds });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}