import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; 

// Helper function to convert "DD/MM/YYYY" to "YYYY-MM-DD" for PostgreSQL
function formatDateForPostgres(dateStr: string | null) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const parts = dateStr.trim().split(/[\/\-]/);
  if (parts.length === 3) {
    let [day, month, year] = parts;
    // If it's already in YYYY-MM-DD format
    if (day.length === 4) return dateStr;
    // Convert DD/MM/YYYY -> YYYY-MM-DD
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase.from("guests").insert([
      {
        tab_category: body.tab_category,
        family: body.family,
        count: body.count,
        jain: body.jain === "Yes" || body.jain === true,
        mobile_no: body.mobile_no || null,
        side: body.side || null,

        // Safely format dates to YYYY-MM-DD
        arrival_date: formatDateForPostgres(body.arrival_date),
        arrival_time: body.arrival_time || null,
        origin_place: body.origin_place || null,
        transportaion_name: body.transportaion_name || null,

        departure_date: formatDateForPostgres(body.departure_date),
        departure_time: body.departure_time || null,
        transportation_departure: body.transportation_departure || null,

        room_no: null,
        hotel_name: null,
        arrived: false,
      },
    ]);

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}