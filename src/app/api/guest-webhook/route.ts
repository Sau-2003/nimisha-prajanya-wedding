import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // adjust path to your supabase client

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Insert the data into Supabase, mapping the webhook body to your database columns
    const { data, error } = await supabase.from("guests").insert([
      {
        tab_category: body.tab_category,
        family: body.family,
        count: body.count,
        jain: body.jain === "Yes" || body.jain === true, 
        mobile_no: body.mobile_no || null,
        
        // Staying Form Specific Fields
        arrival_date: body.arrival_date || null,
        arrival_time: body.arrival_time || null,
        origin_place: body.origin_place || null,
        transportaion_name: body.transportaion_name || null, // Matches your DB spelling
        
        departure_date: body.departure_date || null,
        departure_time: body.departure_time || null,
        transportation_departure: body.transportation_departure || null,
        
        // Default values for fields you fill out manually in the app later
        room_no: null,
        hotel_name: null,
        arrived: false
      }
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