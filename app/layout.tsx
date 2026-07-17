import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { getMetadataBase } from "@/lib/site";
import "maplibre-gl/dist/maplibre-gl.css";
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
  alternates: {
    canonical: "/",
  },
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
import CustomCursor from "@/components/common/CustomCursor";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AuthModalProvider } from "@/components/providers/AuthModalProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

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
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${outfit.variable} antialiased`}
      >
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              <AuthModalProvider>
                <CustomCursor />
                <SmoothScrolling>
                  {children}
                </SmoothScrolling>
              </AuthModalProvider>
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
