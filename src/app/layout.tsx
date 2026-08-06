"use client";

import "@/lib/suppress-next-themes-dev-warning";
import { DM_Sans, Kalam, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { BrandPreloader } from "@/components/ui/BrandPreloader";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { LiquidGlassFilter } from "@/components/ui/LiquidGlassFilter";
import { MotionPreferences } from "@/components/providers/MotionPreferences";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CoordsOverlay } from "@/components/ui/CoordsOverlay";
import { usePathname } from "next/navigation";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const kalam = Kalam({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-handwriting",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  const isInstructorPortal =
    pathname === "/instructor" || pathname?.startsWith("/instructor/");

  // Hide navbar and footer on auth pages, dashboard, instructor portal, and admin portals
  const hideNavbarFooter =
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/admin-portal") ||
    isInstructorPortal ||
    pathname?.startsWith("/admin");

  const hideCoords =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/admin-portal") ||
    isInstructorPortal ||
    pathname?.startsWith("/admin");

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme-aware favicons: Dark mark on dark OS theme, Light mark on light OS theme */}
        <link
          rel="icon"
          href="/favicon-light.svg"
          type="image/svg+xml"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/favicon-dark.svg"
          type="image/svg+xml"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      {/* TODO: Inject Google Analytics (gtag.js) using NEXT_PUBLIC_GA_ID so syllabus_download events from DownloadButton are received */}
      <body
        className={`${dmSans.variable} ${spaceGrotesk.variable} ${kalam.variable} ${dmSans.className} antialiased`}
      >
        <LiquidGlassFilter />
        {!hideCoords && <CoordsOverlay />}
        <ThemeProvider>
          <BrandPreloader />
          <MotionPreferences>
            {!hideNavbarFooter && (
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-md focus:bg-[#12266E] focus:px-4 focus:py-3 focus:text-base focus:font-semibold focus:text-white focus:shadow-lg focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#E8622E]"
              >
                Skip to main content
              </a>
            )}
            {!hideNavbarFooter && <Navbar />}
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            {!hideNavbarFooter && <Footer />}
          </MotionPreferences>
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
