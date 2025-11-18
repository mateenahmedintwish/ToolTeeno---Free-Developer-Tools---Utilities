// app/tools/[slug]/page.tsx
import React, { JSX } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Import the new Color Picker component
import ColorPickerTool from "../../components/ColorPickerTool";
import JsonFormatterTool from "@/app/components/JsonFormatterTool";
import UrlEncoderDecoderTool from "@/app/components/UrlEncoderDecoderTool";
import PasswordGeneratorTool from "@/app/components/PasswordGeneratorTool";
import MarkdownPreviewTool from "@/app/components/MarkdownPreviewTool";
import Base64ConverterTool from "@/app/components/Base64ConverterTool";
import QrCodeGeneratorTool from "@/app/components/QrCodeGeneratorTool";
import JsonToTomlTool from "@/app/components/JsonToTomlTool";
import JsonToToonTool from "@/app/components/JsonToToonTool";

// --- Tool Data and Static Generation ---
type ToolData = {
  name: string;
  description: string;
  component?: () => JSX.Element;
};

const toolsData: Record<string, ToolData> = {
  "qr-code-generator": {
    name: "QR Code Generator",
    component: QrCodeGeneratorTool,
    description: "Generate QR codes for URLs, text, and more.",
  },
  "color-picker": {
    name: "Color Picker",
    component: ColorPickerTool,
    description: "Instantly pick a color and get HEX/RGB values.",
  },
  "json-formatter": {
    name: "JSON Formatter",
    component: JsonFormatterTool,
    description: "Beautify and validate JSON data instantly.",
  },
  "json-to-toml": {
    name: "JSON to TOML Converter",
    component: JsonToTomlTool,
    description: "Convert between JSON and TOML formats bidirectionally.",
  },
  "json-to-toon": {
    name: "JSON to TOON Converter",
    component: JsonToToonTool,
    description: "Reduce LLM token usage by ~50% with compact TOON format.",
  },
  "url-encoder-decoder": {
    name: "URL Encoder/Decoder",
    component: UrlEncoderDecoderTool,
    description: "Encode or decode URLs for safe transmission.",
  },
  "password-generator": {
    name: "Password Generator",
    component: PasswordGeneratorTool,
    description: "Create strong, random passwords.",
  },
  "markdown-preview": {
    name: "Markdown Preview",
    component: MarkdownPreviewTool,
    description: "See your Markdown rendered in real-time.",
  },
  "base64-converter": {
    name: "Base64 Converter",
    component: Base64ConverterTool,
    description: "Encode and decode Base64 strings.",
  },
};

const availableSlugs = Object.keys(toolsData);

export async function generateStaticParams() {
  return availableSlugs.map((slug) => ({
    slug: slug,
  }));
}

// Generate metadata for each tool page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = toolsData[slug as keyof typeof toolsData];

  if (!tool) {
    return {
      title: "Tool Not Found",
      description: "The requested tool could not be found.",
    };
  }

  const toolName = tool.name;
  const toolDescription = tool.description;

  // Enhanced descriptions for SEO
  const seoDescriptions: Record<string, string> = {
    "qr-code-generator": "Generate QR codes instantly for URLs, text, vCards, WiFi, and more. Download as PNG, JPG, or SVG. Customize size, colors, and error correction level. Free QR code generator tool.",
    "color-picker": "Advanced color picker tool with HEX, RGB, and HSL support. Pick colors from images, generate color palettes, and copy values instantly. Perfect for designers and developers.",
    "json-formatter": "Format, validate, and beautify JSON data online. Features syntax highlighting, error detection, minification, and tree view. Free JSON formatter and validator tool.",
    "json-to-toml": "Convert between JSON and TOML formats bidirectionally. Perfect for configuration files, Rust projects, and data transformation. Supports nested objects, arrays, and all data types. Free online converter.",
    "json-to-toon": "Reduce LLM token usage by approximately 50% with TOON format. Eliminate JSON redundancy for efficient data serialization. Perfect for feeding large datasets to language models while minimizing token costs. Free converter tool.",
    "url-encoder-decoder": "Encode and decode URLs for safe transmission. Convert special characters to URL-safe format and vice versa. Essential tool for web developers working with query strings and APIs.",
    "password-generator": "Generate strong, secure passwords with customizable length and character sets. Create random passwords with uppercase, lowercase, numbers, and special characters. Free password generator.",
    "markdown-preview": "Real-time Markdown editor and preview tool. Write Markdown and see instant HTML rendering. Supports GitHub Flavored Markdown, syntax highlighting, and tables. Free online Markdown editor.",
    "base64-converter": "Encode and decode Base64 strings online. Convert text, images, and files to Base64 format. Supports encoding and decoding with instant results. Free Base64 converter tool.",
  };

  const seoKeywords: Record<string, string[]> = {
    "qr-code-generator": ["qr code generator", "create qr code", "free qr code", "qr code maker", "custom qr code", "download qr code"],
    "color-picker": ["color picker", "hex color picker", "rgb color picker", "color palette", "eyedropper tool", "color code"],
    "json-formatter": ["json formatter", "json validator", "beautify json", "json parser", "format json online", "json viewer"],
    "json-to-toml": ["json to toml", "toml converter", "json toml converter", "config converter", "toml parser", "json parser", "configuration format"],
    "json-to-toon": ["json to toon", "toon format", "llm token optimization", "reduce tokens", "compact json", "token efficient", "llm data format", "ai token savings"],
    "url-encoder-decoder": ["url encoder", "url decoder", "encode url", "decode url", "uri encoder", "percent encoding"],
    "password-generator": ["password generator", "strong password", "random password", "secure password", "password creator", "generate password"],
    "markdown-preview": ["markdown editor", "markdown preview", "markdown to html", "md editor", "markdown viewer", "github markdown"],
    "base64-converter": ["base64 encoder", "base64 decoder", "base64 converter", "encode base64", "decode base64", "base64 tool"],
  };

  const description = seoDescriptions[slug] || toolDescription;
  const keywords = seoKeywords[slug] || [toolName.toLowerCase(), "free tool", "online tool"];

  return {
    title: `${toolName} - Free Online Tool`,
    description: description,
    keywords: keywords,
    openGraph: {
      title: `${toolName} - Free Online Tool | ToolTeeno`,
      description: description,
      url: `https://toolteeno.com/tools/${slug}`,
      type: "website",
    },
    alternates: {
      canonical: `https://toolteeno.com/tools/${slug}`,
    },
  };
}

// --- The Page Component ---
export default function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const tool = toolsData[slug as keyof typeof toolsData];

  if (!tool) {
    notFound();
  }

  // 2. Determine which component to render
  const ToolComponent = tool.component || null;

  // JSON-LD structured data for the tool page
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description,
    url: `https://toolteeno.com/tools/${slug}`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: 'Free, No registration required, Works offline, Privacy-focused',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="w-full">
        {/* Dynamic Content Area */}
        {ToolComponent ? (
        // Render the actual tool component if available
        <ToolComponent />
      ) : (
        // Placeholder for tools that don't have a component yet
        <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 text-center transition-colors duration-300">
          <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
            {tool.name} Tool
          </h1>
          <p className="text-xl mb-6 text-gray-600 dark:text-gray-400">{tool.description}</p>
          <p className="text-lg text-indigo-500 dark:text-indigo-400">
            This tool is currently under development. Check back soon!
          </p>
        </div>
      )}

      {/* Navigation (Moved to the end for better visual flow) */}
      <div className="max-w-4xl mx-auto mt-8 pt-6 border-t border-gray-300 dark:border-gray-700 flex justify-between">
        <Link
          href="/"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>
        <Link
          href="/tools"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
        >
          All Tools →
        </Link>
      </div>
      </div>
    </>
  );
}
