import AsciiField from "@/app/components/ascii-field";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Code-Z",
  description: "developer ",
  keywords: ["Code-Z", "Software", "Open Source","Code","Nick"],
  openGraph: {
    title: "Code-Z",
    description: "human",
    type: "website",
  },
  other: {
    "theme-color": "#111111",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <AsciiField />
        {children}
      </body>
    </html>
  );
}
