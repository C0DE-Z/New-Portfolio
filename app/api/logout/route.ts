import { NextResponse } from "next/server";
import { cookieOptions } from "../../auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...cookieOptions, value: "", maxAge: 0 });
  return res;
}
