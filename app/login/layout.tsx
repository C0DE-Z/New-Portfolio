import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin login | Code-Z",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
