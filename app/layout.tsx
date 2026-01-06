// Path: app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import ScrollToTop from "@/components/scroll-to-top";
import { ThemeProvider } from "./providers";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Image from "next/image";
import { NextAuthProvider } from "@/components/providers/session-provider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KINY GROUP",
    template: "%s | KINY GROUP",
  },
  description: "Transforming industries through innovation, excellence, and unwavering commitment to quality across our diverse portfolio of brands.",
  keywords: ["KINY GROUP", "business solutions", "premium services", "innovation", "brands"],
  authors: [{ name: "KINY GROUP" }],
  creator: "KINY GROUP",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kinygroup.com",
    title: "KINY GROUP | Premium Business Solutions",
    description: "Leading company with multiple brands providing exceptional services across various industries.",
    siteName: "KINY GROUP",
  },
  twitter: {
    card: "summary_large_image",
    title: "KINY GROUP | Premium Business Solutions",
    description: "Leading company with multiple brands providing exceptional services across various industries.",
    creator: "@kinygroup",
  },
  icons: {
    icon: "/logo.ico",
    shortcut: "/logo.ico",
    apple: "/logo.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
         <NextAuthProvider>
        <ThemeProvider
        >
          <div className="relative min-h-screen flex flex-col">
            {/* Background Pattern - Fixed */}
            <div className="fixed inset-0 -z-10">
              {/* Base background that changes with theme */}
              <div className="absolute inset-0 bg-background" />
              
              {/* Light mode specific patterns */}
              <div className="light-mode-patterns absolute inset-0 opacity-100 dark:opacity-0 transition-opacity duration-300">
                <div className="absolute inset-0 bg-linear-to-br from-navy-50 via-navy-100 to-navy-50" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(184,134,11,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(184,134,11,0.05)_1px,transparent_1px)] bg-size-[64px_64px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(184,134,11,0.1),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(184,134,11,0.08),transparent_50%)]" />
              </div>
              
              {/* Dark mode specific patterns */}
              <div className="dark-mode-patterns absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-linear-to-br from-navy-900 via-navy-800 to-navy-900" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(184,134,11,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(184,134,11,0.02)_1px,transparent_1px)] bg-size-[64px_64px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(184,134,11,0.08),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(184,134,11,0.06),transparent_50%)]" />
              </div>
            </div>

            {/* Header - Positioned absolutely over content */}
            {/* <Header /> */}
            
            {/* Main content - No top padding initially, content goes under header */}
            <main className="flex-1 relative -mt-16">  
              {children}
            </main>
            
            {/* <Footer /> */}
          </div>

          {/* Scroll to Top Button */}
          <ScrollToTop />
        </ThemeProvider>
         </NextAuthProvider>
      </body>
    </html>
  );
}