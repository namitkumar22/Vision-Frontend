import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vision — AI Diabetic Retinopathy Screening",
  description:
    "Vision uses AI to analyze retinal images and detect diabetic retinopathy grades instantly. Secure, fast, and clinically-informed.",
  keywords: ["diabetic retinopathy", "AI screening", "retina scan", "eye health", "Vision"],
  authors: [{ name: "Vision Health" }],
  openGraph: {
    title: "Vision — AI Retinal Screening",
    description: "Detect diabetic retinopathy grades with AI-powered retinal imaging.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#020510",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
