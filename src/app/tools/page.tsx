// app/tools/page.tsx

import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
// Mock imports for demonstration. You must install lucide-react (npm install lucide-react).
import { Palette, Code, Link as LinkIcon, Lock, FileText, Binary, Zap, ChevronRight, FileJson } from 'lucide-react';

export const metadata: Metadata = {
  title: "All Tools - Complete Developer Utilities Catalog",
  description: "Browse all ToolTeeno's free developer tools: QR Code Generator, JSON Formatter, Base64 Converter, Password Generator, URL Encoder/Decoder, Color Picker, Markdown Preview, JSON to TOML Converter, and JSON to TOON Converter. Fast, secure, and completely free.",
  keywords: ["all developer tools", "utilities catalog", "free tools list", "online tools directory", "developer resources"],
  openGraph: {
    title: "All Tools - Complete Developer Utilities Catalog",
    description: "Browse our complete catalog of free developer tools designed for everyday use.",
    url: "https://toolteeno.com/tools",
    type: "website",
  },
  alternates: {
    canonical: "https://toolteeno.com/tools",
  },
};

// Icon mapping for easy component lookup
const IconMap = { Palette, Code, Link: LinkIcon, Lock, FileText, Binary, FileJson }; // Use LinkIcon to avoid conflict with Next.js Link

// Tool data mirroring the initial list, now including the slug for routing
const allTools = [
  { slug: 'qr-code-generator', name: 'QR Code Generator', icon: 'Zap', description: 'Generate QR codes for URLs, text, and more.' },
  { slug: 'color-picker', name: 'Color Picker', icon: 'Palette', description: 'Instantly pick a color and get HEX/RGB values.' },
  { slug: 'json-formatter', name: 'JSON Formatter', icon: 'Code', description: 'Beautify and validate JSON data instantly.' },
  { slug: 'json-to-toml', name: 'JSON to TOML Converter', icon: 'FileJson', description: 'Convert between JSON and TOML formats bidirectionally.' },
  { slug: 'json-to-toon', name: 'JSON to TOON Converter', icon: 'Zap', description: 'Reduce LLM token usage by ~50% with compact TOON format.' },
  { slug: 'url-encoder-decoder', name: 'URL Encoder/Decoder', icon: 'Link', description: 'Encode or decode URLs for safe transmission.' },
  { slug: 'password-generator', name: 'Password Generator', icon: 'Lock', description: 'Create strong, random passwords.' },
  { slug: 'markdown-preview', name: 'Markdown Preview', icon: 'FileText', description: 'See your Markdown rendered in real-time.' },
  { slug: 'base64-converter', name: 'Base64 Converter', icon: 'Binary', description: 'Encode and decode Base64 strings.' },
];

export default function AllToolsPage() {
  return (
    <div className="w-full">
      
      {/* Header */}
      <header className="w-full text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2">
          Explore All <span className="text-indigo-600 dark:text-indigo-400">Tools</span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          A full catalog of utilities designed for developers.
        </p>
      </header>

      {/* Tools Grid */}
      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allTools.map((tool, index) => {
            // Safely get the Icon Component
            const ToolIcon = IconMap[tool.icon as keyof typeof IconMap] || Zap;
            
            return (
              <Link
                key={index}
                href={`/tools/${tool.slug}`}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-indigo-500 dark:border-indigo-400 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center mb-3">
                    <div className="p-3 mr-3 rounded-full bg-indigo-50 dark:bg-indigo-900">
                      <ToolIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">{tool.name}</h4>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">{tool.description}</p>
                </div>
                
                <div className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium group-hover:text-indigo-800 dark:group-hover:text-indigo-300 transition-colors flex items-center">
                  Use Tool
                  <ChevronRight className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

    </div>
  );
}