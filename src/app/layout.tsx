import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PageTransition } from "@/components/ui/page-transition";
import PagePrefetcher from "@/components/ui/page-prefetcher";
import NavigationLoading from "@/components/ui/navigation-loading";
import { LoadingProvider } from "@/contexts/loading-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["monospace"],
});

export const metadata: Metadata = {
  title: "AnnaPurna - Your Smart Pantry Tracker",
  description:
    "Track your pantry inventory, monitor expiration dates, and reduce food waste with AnnaPurna - the smart pantry management system.",
  keywords: [
    "pantry",
    "food",
    "inventory",
    "expiration",
    "tracker",
    "waste reduction",
  ],
  authors: [{ name: "AnnaPurna Team" }],
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="dns-prefetch"
          href="https://rodbzkaufnmkpyxopspk.supabase.co"
        />
        <link
          rel="dns-prefetch"
          href="https://openrouter.ai"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        data-theme="dark"
      >
        <LoadingProvider>
          <NavigationLoading />
          <PagePrefetcher />
          <PageTransition>{children}</PageTransition>
        </LoadingProvider>
      </body>
    </html>
  );
}
