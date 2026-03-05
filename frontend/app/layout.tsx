import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beat Claude — AI Hiring Companion",
  description:
    "AI-powered hiring assessment platform. Convert JDs into assessments, score candidates, rank on leaderboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full font-sans bg-[#080808] text-[#F0F0F0] antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
