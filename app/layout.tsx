import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";

// Font configuration for the application
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO and metadata configuration for the application
export const metadata: Metadata = {
  // Page titles with template for dynamic pages
  title: {
    default: "Opentern | Apply Open Source",
    template: "%s | Opentern",
  },
  description:
    "Track your internship applications with Opentern, the open-source application tracker. Organize applications by status, discover opportunities, and streamline your job search workflow.",
  // SEO keywords for search engine optimization
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
  // Author and publisher information
  authors: [{ name: "Opentern Team" }],
  creator: "Opentern",
  publisher: "Opentern",
  // Disable automatic format detection for contact info
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Base URL and canonical link configuration
  metadataBase: new URL("https://opentern.io"),
  alternates: {
    canonical: "/",
  },
  // Open Graph metadata for social media sharing
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
        url: "/1200x630-OG.png",
        width: 1200,
        height: 630,
        alt: "Opentern | Apply Open Source",
      },
    ],
  },
  // Twitter Card metadata for Twitter sharing
  twitter: {
    card: "summary_large_image",
    title: "Opentern | Apply Open Source",
    description:
      "Track your internship applications with Opentern, the open-source application tracker. Organize applications by status, discover opportunities, and streamline your job search workflow.",
    images: ["/1200x630-OG.png"],
    creator: "@opentern",
  },
  // Search engine crawling and indexing configuration
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
  // Favicon and app icon configuration
  icons: {
    icon: [
      { url: "/opentern.png", sizes: "any" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
  },
  // Web app manifest for PWA capabilities
  manifest: "/manifest.json",
  category: "technology",
};

/**
 * Root layout component that wraps all pages in the application.
 *
 * Provides:
 * - Font configuration (Geist Sans and Mono)
 * - Authentication provider setup
 * - Convex client provider for database access
 * - Global styling and HTML structure
 *
 * @param children - The page content to be rendered
 * @returns {JSX.Element} The complete HTML structure with providers
 */
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
