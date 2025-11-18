// app/page.tsx
import HomePage from './components/HomePage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Home - Free Online Developer Tools",
  description: "Discover ToolTeeno's collection of free developer tools including QR code generator, JSON formatter, Base64 converter, password generator, URL encoder/decoder, color picker, and markdown preview. All tools work offline in your browser.",
  keywords: ["developer tools", "free online tools", "web utilities", "JSON formatter", "Base64 converter", "QR code generator", "password generator", "URL encoder", "color picker", "markdown editor"],
  openGraph: {
    title: "ToolTeeno - Free Online Developer Tools",
    description: "Discover our collection of free developer tools. All processing done locally in your browser for privacy and speed.",
    url: "https://toolteeno.com",
    type: "website",
  },
  alternates: {
    canonical: "https://toolteeno.com",
  },
};

export default function Home() {
  return <HomePage />;
}