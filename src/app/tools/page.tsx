// app/tools/page.tsx

"use client";
import React, { useState } from 'react';
import Link from 'next/link';
// Mock imports for demonstration. You must install lucide-react (npm install lucide-react).
import { Palette, Code, Link as LinkIcon, Lock, FileText, Binary, Zap, ChevronRight, FileJson, Sparkles, Shield, RefreshCw, Clock, Maximize2, GitCompare, Hash, Paintbrush } from 'lucide-react';



// Icon mapping for easy component lookup
const IconMap = { Palette, Code, Link: LinkIcon, Lock, FileText, Binary, FileJson, Sparkles, Shield, RefreshCw, Clock, Maximize2, GitCompare, Hash, Paintbrush }; // Use LinkIcon to avoid conflict with Next.js Link

// Tool data mirroring the initial list, now including the slug for routing
const allTools = [
  { slug: 'qr-code-generator', name: 'QR Code Generator', icon: 'Zap', description: 'Generate QR codes for URLs, text, and more.', tags: ['Generator', 'Image', 'Utility'] },
  { slug: 'color-picker', name: 'Color Picker', icon: 'Palette', description: 'Instantly pick a color and get HEX/RGB values.', tags: ['Design', 'Image', 'Utility'] },
  { slug: 'json-formatter', name: 'JSON Formatter', icon: 'Code', description: 'Beautify and validate JSON data instantly.', tags: ['Developer', 'Formatter', 'Data'] },
  { slug: 'json-to-toml', name: 'JSON to TOML Converter', icon: 'FileJson', description: 'Convert between JSON and TOML formats bidirectionally.', tags: ['Converter', 'Developer', 'Data'] },
  { slug: 'json-to-toon', name: 'JSON to TOON Converter', icon: 'Zap', description: 'Reduce LLM token usage by ~50% with compact TOON format.', tags: ['Converter', 'Developer', 'AI'] },
  { slug: 'url-encoder-decoder', name: 'URL Encoder/Decoder', icon: 'Link', description: 'Encode or decode URLs for safe transmission.', tags: ['Developer', 'Encoder', 'Web'] },
  { slug: 'password-generator', name: 'Password Generator', icon: 'Lock', description: 'Create strong, random passwords.', tags: ['Generator', 'Security', 'Utility'] },
  { slug: 'markdown-preview', name: 'Markdown Preview', icon: 'FileText', description: 'See your Markdown rendered in real-time.', tags: ['Developer', 'Formatter', 'Documentation'] },
  { slug: 'base64-converter', name: 'Base64 Converter', icon: 'Binary', description: 'Encode and decode Base64 strings.', tags: ['Converter', 'Encoder', 'Developer'] },
  { slug: 'svg-optimizer', name: 'SVG Optimizer', icon: 'Sparkles', description: 'Reduce SVG file size by removing metadata and optimizing code.', tags: ['Optimizer', 'Image', 'Web'] },
  { slug: 'regex-tester', name: 'Regex Tester', icon: 'Code', description: 'Test and debug regular expressions with real-time matching.', tags: ['Developer', 'Testing', 'Utility'] },
  { slug: 'jwt-debugger', name: 'JWT Debugger', icon: 'Shield', description: 'Decode and inspect JSON Web Tokens (JWT) with signature validation.', tags: ['Developer', 'Security', 'Debugger'] },
  { slug: 'yaml-converter', name: 'YAML Converter', icon: 'RefreshCw', description: 'Convert between JSON, YAML, and XML formats.', tags: ['Converter', 'Developer', 'Data'] },
  { slug: 'unix-timestamp', name: 'Unix Timestamp Converter', icon: 'Clock', description: 'Convert between human-readable date/time and Unix timestamps.', tags: ['Converter', 'Developer', 'Utility'] },
  { slug: 'html-formatter', name: 'HTML Formatter', icon: 'Maximize2', description: 'Format or compress HTML code for readability or production.', tags: ['Formatter', 'Developer', 'Web'] },
  { slug: 'text-diff', name: 'Text Diff Checker', icon: 'GitCompare', description: 'Compare two pieces of text and highlight the differences.', tags: ['Developer', 'Comparison', 'Utility'] },
  { slug: 'hash-generator', name: 'Hash Generator', icon: 'Hash', description: 'Generate cryptographic hashes (MD5, SHA-256, etc.) from text.', tags: ['Security', 'Developer', 'Encoder'] },
  { slug: 'color-palette-generator', name: 'Color Palette Generator', icon: 'Paintbrush', description: 'Generate harmonious color palettes from a single color.', tags: ['Design', 'Generator', 'Utility'] },
];

export default function AllToolsPage() {
  const [selectedTag, setSelectedTag] = useState<string>('All');

  // Get all unique tags sorted by count (descending)
  const uniqueTags = Array.from(new Set(allTools.flatMap(tool => tool.tags)));
  const allTags = ['All', ...uniqueTags.sort((a, b) => {
    const countA = allTools.filter(tool => tool.tags.includes(a)).length;
    const countB = allTools.filter(tool => tool.tags.includes(b)).length;
    return countB - countA; // Sort by count descending
  })];

  // Filter tools based on selected tag
  const filteredTools = selectedTag === 'All' 
    ? allTools 
    : allTools.filter(tool => tool.tags.includes(selectedTag));

  return (
    <div className="w-full">
      
      {/* Header */}
      <header className="w-full text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2">
          Explore All <span className="text-indigo-600 dark:text-indigo-400">Tools</span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          A full catalog of utilities designed for developers.
        </p>
      </header>

      {/* Tag Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12 px-4">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm ${
              selectedTag === tag
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md'
            }`}
          >
            {tag}
            {tag !== 'All' && (
              <span className="ml-2 px-2 py-0.5 bg-black/10 dark:bg-white/10 rounded-full text-xs">
                {allTools.filter(tool => tool.tags.includes(tag)).length}
              </span>
            )}
            {tag === 'All' && (
              <span className="ml-2 px-2 py-0.5 bg-black/10 dark:bg-white/10 rounded-full text-xs">
                {allTools.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => {
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
                  <p className="text-gray-500 dark:text-gray-400 mb-3">{tool.description}</p>
                  
                  {/* Tag Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tool.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
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