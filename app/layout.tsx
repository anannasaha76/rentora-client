import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import "react-toastify/dist/ReactToastify.css"
import { ToastContainer } from "react-toastify"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthToastProvider } from "@/components/auth-toast-provider"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Rentora — Equipment Rental Platform",
  description:
    "Rent heavy equipment, tools, cameras, and machinery with transparent pricing, flexible durations, and verified owners.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
    shortcut: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("scroll-smooth antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <ThemeProvider>
          <AuthToastProvider />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ToastContainer position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
