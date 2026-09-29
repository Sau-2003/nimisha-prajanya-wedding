import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; 

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Clean up the name (removes extra spaces at the beginning or end)
    const cleanFamilyName = payload.family ? payload.family.trim() : "Unknown";

    // 1. Check if this guest already exists (using ilike for case-insensitive matching)
    const { data: existingGuests, error: searchError } = await supabase
      .from("guests")
      .select("id")
      .ilike("family", cleanFamilyName) // Ignores uppercase/lowercase differences
      .eq("tab_category", payload.tab_category)
      .limit(1); // Prevents crashing if there are accidental duplicates

    if (searchError) throw searchError;

    if (existingGuests && existingGuests.length > 0) {
      // 2. IF THEY EXIST: Update their existing record
      const { error: updateError } = await supabase
        .from("guests")
        .update({
          ...payload,
          family: cleanFamilyName // Save the clean version
        })
        .eq("id", existingGuests[0].id);

      if (updateError) throw updateError;
      return NextResponse.json({ message: "Guest updated successfully" }, { status: 200 });
      
    } else {
      // 3. IF THEY ARE NEW: Insert a new record
      const { error: insertError } = await supabase
        .from("guests")
        .insert([{
          ...payload,
          family: cleanFamilyName // Save the clean version
        }]);

      if (insertError) throw insertError;
      return NextResponse.json({ message: "Guest added successfully" }, { status: 201 });
    }

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}