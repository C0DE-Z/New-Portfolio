import { NextRequest, NextResponse } from "next/server";

// Debug environment variables and configuration
console.log("API route loaded");
console.log("Environment variables:", {
  CODES: process.env.CODES,
  LINKS: process.env.LINKS
});

// Get codes and links from environment variables
const codes = (process.env.CODES || "").split(",").map(s => s.trim());
const links = (process.env.LINKS || "").split(",").map(s => s.trim());

console.log("Parsed codes:", codes);
console.log("Parsed links:", links);

export async function POST(request: NextRequest) {
    console.log("POST request received");
    try {
        const body = await request.json();
        console.log("Request body:", body);
        const { name } = body;

        const idx = codes.findIndex(code => code === name);
        console.log(`Code "${name}" found at index: ${idx}`);
        
        if (idx !== -1 && links[idx]) {
            const redirectUrl = links[idx];
            console.log("Redirecting to:", redirectUrl);
                        return NextResponse.redirect(new URL(redirectUrl), { status: 302 });
        }

        console.log("Invalid code, returning 404");
        return NextResponse.json({ error: 'Invalid code' }, { status: 404 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
