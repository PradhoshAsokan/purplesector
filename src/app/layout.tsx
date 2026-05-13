import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import PathTracker from "@/components/PathTracker";

export const metadata: Metadata = {
  title: "Purple Sector | F1 Live Pit Wall",
  description: "Real-time Formula 1 telemetry and race dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-asphalt">
      <body className="min-h-full flex flex-col antialiased">
        <Navbar />
        <PathTracker />
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
