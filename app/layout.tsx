import AsciiField from "@/app/components/ascii-field";
import SiteUI from "@/app/components/site-ui";
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
  metadataBase: new URL("https://c0dez.vercel.app"),
  title: "Code-Z | Developer Portfolio",
  description: "Code-Z's developer portfolio: projects, code, and ways to get in touch.",
  applicationName: "Code-Z",
  openGraph: {
    title: "Code-Z | Developer Portfolio",
    description: "Projects, code, and ways to get in touch.",
    type: "website",
    siteName: "Code-Z",
    url: "/",
    images: [{ url: "/imgs/imgs/Web.png", alt: "Code-Z developer portfolio" }],
  },
  twitter: {
    card: "summary",
    title: "Code-Z | Developer Portfolio",
    description: "Projects, code, and ways to get in touch.",
    images: ["/imgs/imgs/Web.png"],
  },
  robots: { index: true, follow: true },
  other: { "theme-color": "#111111" },
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
        <SiteUI>
          <AsciiField />
          {children}
        </SiteUI>
      </body>
    </html>
  );
}
