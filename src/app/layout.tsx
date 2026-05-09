import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full bg-black">
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
