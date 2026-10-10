import { NextRequest, NextResponse } from "next/server";
import { checkPassword, cookieOptions, makeToken } from "../../auth";
import { clientIp, limited } from "../../limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (limited(`login:${clientIp(request.headers)}`, 5)) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }
  try {
    const { password } = await request.json();
    if (typeof password !== "string" || !password || password.length > 256 || !checkPassword(password)) {
      return NextResponse.json({ error: "Denied" }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set({ ...cookieOptions, value: makeToken() });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
