import { NextRequest, NextResponse } from "next/server";

console.log("Environment variables:", {
  CODES: process.env.CODES,
  LINKS: process.env.LINKS
});

const codes = (process.env.CODES || "").split(",").map(s => s.trim());
const links = (process.env.LINKS || "").split(",").map(s => s.trim());


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name } = body;
        
        const idx = codes.findIndex(code => code === name);
        
        if (idx !== -1 && links[idx]) {
            const redirectUrl = links[idx];

            try {
                const url = new URL(redirectUrl);
                return NextResponse.redirect(url, { status: 302 });
            } catch (e) {
                return NextResponse.json({ error: 'Invalid redirect URL configuration' }, { status: 500 });
            }
        }

        console.log("Invalid code, returning 404");
        return NextResponse.json({ error: 'Invalid code' }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}