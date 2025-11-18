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
import SvgOptimizerTool from "@/app/components/SvgOptimizerTool";
import RegexTesterTool from "@/app/components/RegexTesterTool";
import JwtDebuggerTool from "@/app/components/JwtDebuggerTool";
import YamlConverterTool from "@/app/components/YamlConverterTool";
import UnixTimestampTool from "@/app/components/UnixTimestampTool";
import HtmlFormatterTool from "@/app/components/HtmlFormatterTool";
import TextDiffTool from "@/app/components/TextDiffTool";
import HashGeneratorTool from "@/app/components/HashGeneratorTool";
import ColorPaletteGeneratorTool from "@/app/components/ColorPaletteGeneratorTool";

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
  "svg-optimizer": {
    name: "SVG Optimizer",
    component: SvgOptimizerTool,
    description: "Reduce SVG file size by removing metadata and optimizing code.",
  },
  "regex-tester": {
    name: "Regex Tester",
    component: RegexTesterTool,
    description: "Test and debug regular expressions with real-time matching.",
  },
  "jwt-debugger": {
    name: "JWT Debugger",
    component: JwtDebuggerTool,
    description: "Decode and inspect JSON Web Tokens (JWT) with signature validation.",
  },
  "yaml-converter": {
    name: "YAML Converter",
    component: YamlConverterTool,
    description: "Convert between JSON, YAML, and XML formats.",
  },
  "unix-timestamp": {
    name: "Unix Timestamp Converter",
    component: UnixTimestampTool,
    description: "Convert between human-readable date/time and Unix timestamps.",
  },
  "html-formatter": {
    name: "HTML Formatter",
    component: HtmlFormatterTool,
    description: "Format or compress HTML code for readability or production.",
  },
  "text-diff": {
    name: "Text Diff Checker",
    component: TextDiffTool,
    description: "Compare two pieces of text and highlight the differences.",
  },
  "hash-generator": {
    name: "Hash Generator",
    component: HashGeneratorTool,
    description: "Generate cryptographic hashes (MD5, SHA-256, etc.) from text.",
  },
  "color-palette-generator": {
    name: "Color Palette Generator",
    component: ColorPaletteGeneratorTool,
    description: "Generate harmonious color palettes from a single color.",
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
    "svg-optimizer": "Optimize SVG files to reduce size by 30-70%. Remove unnecessary metadata, comments, and editor-specific code. Minify colors, round decimals, and compress whitespace. Perfect for web performance and Lighthouse scores. Free SVG optimization tool.",
    "regex-tester": "Test and debug regular expressions online with real-time matching. Visualize matches, capture groups, and pattern behavior. Supports all JavaScript regex flags (global, case-insensitive, multiline, dotall, unicode, sticky). Perfect for learning regex, validating patterns, and debugging complex expressions. Free regex testing tool.",
    "jwt-debugger": "Decode and inspect JSON Web Tokens (JWT) online. View header, payload, and signature with automatic base64url decoding. Verify JWT signatures with HMAC algorithms (HS256, HS384, HS512). Check token expiration, issued at, and not before timestamps. Perfect for debugging authentication, inspecting claims, and learning JWT structure. Free JWT decoder and validator.",
    "yaml-converter": "Convert between JSON, YAML, and XML formats with bidirectional support. Transform configuration files, API responses, and data structures between formats. Supports nested objects, arrays, and all data types. Perfect for Kubernetes configs, CI/CD pipelines, OpenAPI specs, and data migration. Instant conversion with pretty formatting. Free format converter tool.",
    "unix-timestamp": "Convert between Unix timestamps and human-readable dates online. Supports seconds and milliseconds formats. Convert timestamps to ISO 8601, UTC, and localized date formats. Extract date components (year, month, day, hour, minute, second). Timezone support for accurate conversions. Perfect for debugging APIs, scheduling tasks, and time calculations. Free timestamp converter.",
    "html-formatter": "Format and minify HTML code online. Prettify messy HTML with proper indentation or compress for production deployment. Remove comments, sort attributes, and customize indent size. Perfect for cleaning WYSIWYG editor output, standardizing code formatting, and optimizing HTML for faster page loads. Free HTML beautifier and compressor.",
    "text-diff": "Compare two text files and highlight differences online. Character, word, and line-by-line comparison modes. Unified and side-by-side diff views. Calculate similarity percentage and change statistics. Perfect for version control, code review, document comparison, and plagiarism detection. Free text comparison tool.",
    "hash-generator": "Generate cryptographic hashes online from any text. Support for MD5, SHA-1, SHA-256, SHA-384, SHA-512, and RIPEMD-160 algorithms. Instant hash generation with copy-to-clipboard functionality. Perfect for password hashing, data integrity verification, checksums, and security audits. Free hash generator tool.",
    "color-palette-generator": "Generate harmonious color palettes from a single color online. Support for monochromatic, analogous, complementary, triadic, tetradic, split-complementary, and double-complementary schemes. Export to CSS, SCSS, or JSON. Perfect for web design, UI/UX, branding, and creating cohesive color schemes. Free color palette generator.",
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
    "svg-optimizer": ["svg optimizer", "optimize svg", "compress svg", "minify svg", "svg file size", "reduce svg", "svg cleaner", "svg compression"],
    "regex-tester": ["regex tester", "regular expression tester", "regex validator", "test regex", "regex debugger", "pattern matcher", "regex playground", "regex tool"],
    "jwt-debugger": ["jwt debugger", "jwt decoder", "json web token decoder", "jwt validator", "jwt inspector", "decode jwt", "jwt parser", "jwt tool"],
    "yaml-converter": ["yaml converter", "json to yaml", "yaml to json", "xml converter", "json to xml", "yaml to xml", "format converter", "config converter"],
    "unix-timestamp": ["unix timestamp converter", "timestamp to date", "date to timestamp", "epoch converter", "time converter", "unix time", "timestamp decoder", "epoch time"],
    "html-formatter": ["html formatter", "html beautifier", "html minifier", "prettify html", "compress html", "html optimizer", "format html", "minify html"],
    "text-diff": ["text diff", "compare text", "diff checker", "text comparison", "compare files", "diff tool", "text difference", "compare documents"],
    "hash-generator": ["hash generator", "md5 generator", "sha256 generator", "sha512 generator", "cryptographic hash", "hash calculator", "checksum generator", "hash tool"],
    "color-palette-generator": ["color palette generator", "color scheme generator", "harmonious colors", "complementary colors", "analogous colors", "triadic colors", "color harmony", "palette creator"],
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
