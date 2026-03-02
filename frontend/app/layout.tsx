import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beat Claude — AI Hiring Companion",
  description: "AI-powered hiring assessment platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
