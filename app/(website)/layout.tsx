import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { getMetadataBase } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});



export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Summerhouse Bali",
    template: "%s | Summerhouse Bali",
  },
  description: "Luxury villas in Bali",
  openGraph: {
    type: "website",
    siteName: "Summerhouse Bali",
    title: "Summerhouse Bali",
    description: "Luxury villas in Bali",
    url: "/",
    images: [
      {
        url: "/Hero_Section.png",
        width: 1200,
        height: 630,
        alt: "Summerhouse Bali private villas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Summerhouse Bali",
    description: "Luxury villas in Bali",
    images: ["/Hero_Section.png"],
  },
};

import SmoothScrolling from "@/components/common/SmoothScrolling";
import { MotionPreferenceProvider } from "@/components/providers/MotionPreferenceProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AuthModalProvider } from "@/components/providers/AuthModalProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import SavedVillasNotifier from "@/components/villas/SavedVillasNotifier";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Only the icons the site draws, at the one style globals.css uses: ~3 KB instead of the 1.1 MB full font.
            shortcut: a new icon name must be added here (sorted A-Z) or it renders as its word; swap these for
            inline SVG icons if the list grows past ~20 or the Google Fonts request should go. */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0&icon_names=ac_unit,bathtub,bed,calendar_month,check_circle,deck,event_available,group,local_parking,skillet,wifi&display=block" rel="stylesheet" />
      </head>
      <body
        className={`${outfit.variable} antialiased`}
      >
        <MotionPreferenceProvider><AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              <SavedVillasNotifier />
              <AuthModalProvider>
                <SmoothScrolling>
                  {children}
                </SmoothScrolling>
              </AuthModalProvider>
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider></MotionPreferenceProvider>
      </body>
    </html>
  );
}
