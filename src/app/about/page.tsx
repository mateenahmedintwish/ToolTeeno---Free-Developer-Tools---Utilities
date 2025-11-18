// app/about/page.tsx
import React from 'react';
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

export default function AboutPage() {
  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">About ToolTeeno</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-6 text-gray-600 dark:text-gray-400">
            ToolTeeno is a collection of simple, fast, and free developer tools designed to make your life easier.
          </p>
          <p className="text-lg mb-6 text-gray-600 dark:text-gray-400">
            Our mission is to provide high-quality, easy-to-use utilities that developers need in their daily work,
            all in one convenient place, without the need for installation or registration.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>Fast and responsive design</li>
            <li>Dark mode support</li>
            <li>No registration required</li>
            <li>All processing done locally in your browser</li>
            <li>Completely free to use</li>
          </ul>
        </div>
      </div>
    </div>
  );
}