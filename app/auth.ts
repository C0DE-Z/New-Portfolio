import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const NAME = "session";
const TTL = 60 * 60 * 12;

const secret = () => process.env.AUTH_SECRET ?? "";
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("hex");

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || !secret()) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export function makeToken() {
  const exp = String(Math.floor(Date.now() / 1000) + TTL);
  return `${exp}.${sign(exp)}`;
}

export function validToken(token: string | undefined) {
  if (!token || !secret()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  const good = Buffer.from(sign(exp));
  const got = Buffer.from(sig);
  return good.length === got.length && timingSafeEqual(good, got);
}

export async function isAdmin() {
  return validToken((await cookies()).get(NAME)?.value);
}

export const cookieOptions = {
  name: NAME,
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: TTL,
};
