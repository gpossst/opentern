import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";
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
    default: "Opentern | Apply Open Source",
    template: "%s | Opentern",
  },
  description:
    "Track your internship applications with Opentern, the open-source application tracker. Organize applications by status, discover opportunities, and streamline your job search workflow.",
  keywords: [
    "internship tracker",
    "job application tracker",
    "open source",
    "internship applications",
    "job search",
    "application management",
    "developer tools",
    "career tracking",
    "internship opportunities",
    "job hunting",
  ],
  authors: [{ name: "Opentern Team" }],
  creator: "Opentern",
  publisher: "Opentern",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://opentern.io"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://opentern.io",
    title: "Opentern - Open Source Internship Application Tracker",
    description:
      "Track your internship applications with Opentern, the open-source application tracker. Organize applications by status, discover opportunities, and streamline your job search workflow.",
    siteName: "Opentern",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Opentern | Apply Open Source",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Opentern | Apply Open Source",
    description:
      "Track your internship applications with Opentern, the open-source application tracker. Organize applications by status, discover opportunities, and streamline your job search workflow.",
    images: ["/logo.png"],
    creator: "@opentern",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/convex.svg", sizes: "any" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-base-300`}
        >
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
