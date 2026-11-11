import { NextResponse } from "next/server";

// Client preview: there is no account backend. Every session route answers 503, except the
// "who is signed in" check, which answers 401 so pages show their normal signed-out state.
const MESSAGE = "Accounts are unavailable in this preview.";
const headers = { "Cache-Control": "no-store" };

const unavailable = () =>
  NextResponse.json({ success: false, message: MESSAGE }, { status: 503, headers });

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (path.join("/") === "auth/user") {
    return NextResponse.json({ success: false, message: MESSAGE }, { status: 401, headers });
  }
  return unavailable();
}

export const POST = unavailable;
export const PATCH = unavailable;
export const PUT = unavailable;
export const DELETE = unavailable;
