import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // adjust path to your supabase client

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract data sent from Google Apps Script
    const { family, count, tab_category, jain, mobile_no } = body;

    const { data, error } = await supabase.from("guests").insert([
      {
        family: family,
        count: count,
        tab_category: tab_category,
        jain: jain === "Yes", // assuming form sends "Yes"/"No"
        mobile_no: mobile_no || null,
        arrived: false
      }
    ]);

    if (error) throw error;
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}