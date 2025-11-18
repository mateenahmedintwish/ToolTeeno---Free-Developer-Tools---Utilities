// app/about/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About ToolTeeno - Our Mission & Features",
  description: "Learn about ToolTeeno's mission to provide high-quality, free developer tools. Features include dark mode support, local processing for privacy, and no registration required.",
  keywords: ["about toolteeno", "developer tools mission", "free utilities", "privacy-focused tools", "local processing"],
  openGraph: {
    title: "About ToolTeeno - Our Mission & Features",
    description: "Learn about our mission to provide high-quality, free developer tools for everyone.",
    url: "https://toolteeno.com/about",
    type: "website",
  },
  alternates: {
    canonical: "https://toolteeno.com/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
