import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:18790";

export async function POST(request: NextRequest) {
  // Try Authorization header first, then httpOnly cookie
  let authHeader = request.headers.get("authorization");
  if (!authHeader) {
    const cookieStore = await cookies();
    const token = cookieStore.get("oluto_access_token")?.value;
    if (token) {
      authHeader = `Bearer ${token}`;
    }
  }

  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let body: BodyInit;
    const headers: Record<string, string> = {
      Authorization: authHeader,
    };

    if (contentType.includes("multipart/form-data")) {
      // Forward multipart as-is (file upload)
      body = await request.arrayBuffer();
      headers["Content-Type"] = contentType;
    } else {
      // JSON text message
      const json = await request.json();
      const formData = new FormData();
      formData.append("message", json.message || "");
      if (json.business_id) formData.append("business_id", json.business_id);
      if (json.timezone) formData.append("timezone", json.timezone);
      body = formData;
    }

    const response = await fetch(`${GATEWAY_URL}/webhook`, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(120_000),
    });

    const data = await response.json().catch(() => ({
      error: `Gateway returned ${response.status}`,
    }));

    return NextResponse.json(data, { status: response.ok ? 200 : response.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gateway error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
