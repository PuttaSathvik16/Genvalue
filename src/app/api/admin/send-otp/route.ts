import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

/** Proxy admin OTP requests to the backend API. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_URL}/auth/admin/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/admin/send-otp] proxy error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
