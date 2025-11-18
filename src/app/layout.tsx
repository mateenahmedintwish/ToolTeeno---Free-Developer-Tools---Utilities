import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Header from "./components/Header";
import Footer from "./components/Footer";

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
    default: "ToolTeeno - Free Developer Tools & Utilities",
    template: "%s | ToolTeeno"
  },
  description: "Simple, fast, and free developer tools for everyday tasks. QR codes, JSON formatting, Base64 encoding, password generation, and more. All processing done locally in your browser.",
  keywords: ["developer tools", "free tools", "online utilities", "JSON formatter", "Base64 converter", "URL encoder", "password generator", "QR code generator", "color picker", "markdown preview"],
  authors: [{ name: "ToolTeeno" }],
  creator: "ToolTeeno",
  publisher: "ToolTeeno",
  metadataBase: new URL('https://toolteeno.com'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://toolteeno.com",
    siteName: "ToolTeeno",
    title: "ToolTeeno - Free Developer Tools & Utilities",
    description: "Simple, fast, and free developer tools for everyday tasks. All processing done locally in your browser.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ToolTeeno - Developer Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolTeeno - Free Developer Tools & Utilities",
    description: "Simple, fast, and free developer tools for everyday tasks.",
    images: ["/og-image.png"],
    creator: "@toolteeno",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data for organization
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ToolTeeno',
    description: 'Free developer tools and utilities for everyday tasks',
    url: 'https://toolteeno.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://toolteeno.com/tools?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ToolTeeno',
      url: 'https://toolteeno.com',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center p-4 sm:p-8 font-sans transition-colors duration-300">
            <Header />
            <main className="w-full max-w-7xl flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
