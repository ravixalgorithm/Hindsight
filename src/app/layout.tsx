import type { Metadata } from "next";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

import HangoverEffect from "@/components/HangoverEffect";

import Sidebar from "@/components/Sidebar";
import PolaroidBurnIn from "@/components/PolaroidBurnIn";

export const metadata: Metadata = {
  title: "Hindsight - What Happened?",
  description: "The night you'll never remember.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-row bg-bourbon text-parchment relative overflow-hidden">
        <PolaroidBurnIn />
        <Sidebar />
        <div className="flex-1 flex flex-col relative h-screen overflow-y-auto">
          <HangoverEffect />
          <svg className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.35]" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
          {children}
        </div>
      </body>
    </html>
  );
}
