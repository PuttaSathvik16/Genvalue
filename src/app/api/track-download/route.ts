import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let filename = "";
  let page = "";

  try {
    const body = (await request.json()) as unknown;
    if (body && typeof body === "object") {
      const b = body as Record<string, unknown>;
      if (typeof b.filename === "string") filename = b.filename;
      if (typeof b.page === "string") page = b.page;
    }
  } catch {
    // Malformed JSON - still return success; log what we can
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  const timestamp = new Date().toISOString();

  // TODO: Replace console.log with your analytics service (Google Analytics, Mixpanel, etc.)
  console.log("[DOWNLOAD]", filename, page, timestamp, userAgent);

  return NextResponse.json({ success: true });
}
