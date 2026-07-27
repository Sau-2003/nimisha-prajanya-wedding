import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");

  if (code) {
    // Exchange the code for an active session natively
    await supabase.auth.exchangeCodeForSession(code);
  }

  // If it's a password recovery flow, send them back with the recovery flag
  if (type === "recovery") {
    return NextResponse.redirect(`${requestUrl.origin}/?type=recovery`);
  }

  // Default redirect to home dashboard
  return NextResponse.redirect(requestUrl.origin);
}