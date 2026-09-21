import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "content-type",
  "idempotency-key",
  "if-match",
  "last-event-id",
] as const;

const FORWARDED_RESPONSE_HEADERS = [
  "cache-control",
  "content-type",
  "etag",
  "location",
  "retry-after",
  "x-accel-buffering",
] as const;

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await context.params;
  const configuredBase = process.env.AGENT_API_URL || "http://oluto-finance-api:18790";
  const target = new URL(`/${path.map(encodeURIComponent).join("/")}`, configuredBase);
  target.search = request.nextUrl.search;

  let authorization = request.headers.get("authorization");
  if (!authorization) {
    const token = (await cookies()).get("oluto_access_token")?.value;
    if (token) authorization = `Bearer ${token}`;
  }
  if (!authorization) {
    return Response.json(
      { code: "authentication_required", detail: "Authentication required" },
      { status: 401 }
    );
  }

  const headers = new Headers({ authorization });
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const body =
    request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
    signal: request.signal,
  });
  const responseHeaders = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
