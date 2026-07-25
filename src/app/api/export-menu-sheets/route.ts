import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbyifMXpNR1aOK5Q5bHrrhfGSXlOuHJpKgCNDRSgrrTvz9m___4PvTzz_ESLvtcJKeA/exec",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(body),
      }
    );

    const text = await response.text();

    return NextResponse.json({
      success: response.ok,
      response: text,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: String(e) },
      { status: 500 }
    );
  }
}