import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SkipLink from "@/components/SkipLink";
import { SettingsProvider } from "@/context/SettingsContext";
import EmergencyButton from "@/components/EmergencyButton";
import Footer from "@/components/Footer";
import QuickAccessFab from "@/components/QuickAccessFab";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Telemedicine UI",
  description: "Modern telemedicine platform UI built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SettingsProvider>
          <SkipLink />
          <Navbar />
          <main id="main" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
          <EmergencyButton />
          <QuickAccessFab />
        </SettingsProvider>
      </body>
    </html>
  );
}
