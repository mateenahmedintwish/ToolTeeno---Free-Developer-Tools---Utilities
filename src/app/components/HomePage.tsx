// app/components/HomePage.tsx
"use client";
import React, { useRef, useState } from 'react';
import Link from 'next/link'; // Import Next.js Link
// Mock imports for demonstration.
import { Palette, Code, Link as LinkIcon, Lock, FileText, Binary, ChevronLeft, ChevronRight, Zap, Search, FileJson, Sparkles, Shield, RefreshCw, Clock, Maximize2, GitCompare, Hash, Paintbrush } from 'lucide-react';

// Icon mapping for easy component lookup
const IconMap = { Palette, Code, Link: LinkIcon, Lock, FileText, Binary, FileJson, Sparkles, Shield, RefreshCw, Clock, Maximize2, GitCompare, Hash, Paintbrush }; // Use LinkIcon to avoid conflict with Next.js Link

// Sample data for the tools
const initialTools = [
  { slug: 'qr-code-generator', name: 'QR Code Generator', icon: 'Zap', description: 'Generate QR codes for URLs, text, and more.', tags: ['Generator', 'Image', 'Utility'] },
  { slug: 'color-picker', name: 'Color Picker', icon: 'Palette', description: 'Extract colors from any image or screen.', tags: ['Design', 'Image', 'Utility'] },
  { slug: 'json-formatter', name: 'JSON Formatter', icon: 'Code', description: 'Beautify and validate JSON data instantly.', tags: ['Developer', 'Formatter', 'Data'] },
  { slug: 'json-to-toml', name: 'JSON to TOML Converter', icon: 'FileJson', description: 'Convert between JSON and TOML formats bidirectionally.', tags: ['Converter', 'Developer', 'Data'] },
  { slug: 'json-to-toon', name: 'JSON to TOON Converter', icon: 'Zap', description: 'Reduce LLM token usage by ~50% with compact TOON format.', tags: ['Converter', 'Developer', 'LLM'] },
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

// Duplicate the array to simulate a continuous, looping carousel effect
const CAROUSEL_TOOLS = [...initialTools, ...initialTools, ...initialTools];

/**
 * Main component for the ToolTeeno homepage.
 */
export default function HomePage() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');

  // Get all unique tags sorted by count (descending)
  const uniqueTags = Array.from(new Set(initialTools.flatMap(tool => tool.tags)));
  const allTags = ['All', ...uniqueTags.sort((a, b) => {
    const countA = initialTools.filter(tool => tool.tags.includes(a)).length;
    const countB = initialTools.filter(tool => tool.tags.includes(b)).length;
    return countB - countA; // Sort by count descending
  })];

  // Scroll handler for the carousel navigation buttons
  const scrollCarousel = (direction: string) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300; // Scroll by 300px
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Filter tools based on search query and selected tag
  const filteredTools = initialTools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTag = selectedTag === 'All' || tool.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  return (
    <>
      {/* --- Hero Section --- */}
      <section className="text-center mb-12 max-w-3xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 transition-colors duration-300">
          Simple, Fast, and Free <span className="text-indigo-600 dark:text-indigo-400">Developer Tools</span>
        </h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">
          Your favorite online utilities, designed with speed and simplicity in mind.
        </p>
        
      </section>

      {/* --- Logo Carousel (Featured Tools) --- */}
      <section className="w-full mb-12">
        <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center transition-colors duration-300">Featured Tools</h3>
        
        <div className="relative group">
          
          {/* Carousel Container - Enables horizontal scrolling and hides scrollbar */}
          <div
            ref={carouselRef}
            className="flex space-x-6 overflow-x-scroll snap-x snap-mandatory py-4 px-2 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties} // Hide scrollbar in modern browsers
          >
            {/* Map over duplicated tools for the looping effect */}
            {CAROUSEL_TOOLS.map((tool, index) => {
              const ToolIcon = IconMap[tool.icon as keyof typeof IconMap] || Zap;
              return (
                <Link 
                  key={index}
                  href={`/tools/${tool.slug}`}
                  className="shrink-0 w-36 h-36 sm:w-40 sm:h-40 bg-white dark:bg-gray-800 rounded-3xl p-4 flex flex-col items-center justify-center snap-center 
                             shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer 
                             ring-2 ring-transparent hover:ring-indigo-400"
                >
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-3 shadow-inner">
                    <ToolIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-center font-semibold text-gray-700 dark:text-gray-200 text-sm">{tool.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={() => scrollCarousel('left')}
            className="hidden lg:flex absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-3 rounded-full shadow-xl text-indigo-600 dark:text-indigo-400 opacity-80 hover:opacity-100 hover:shadow-2xl transition-all duration-200 z-10"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scrollCarousel('right')}
            className="hidden lg:flex absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-3 rounded-full shadow-xl text-indigo-600 dark:text-indigo-400 opacity-80 hover:opacity-100 hover:shadow-2xl transition-all duration-200 z-10"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        {/* CSS to hide scrollbar explicitly on the container */}
        <style jsx>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </section>

     <section className="w-full max-w-7xl mb-12">
        {/* Search Bar (Material Floating Input) */}
        <div className="relative w-full max-w-md mx-auto mb-8">
          <input
            type="text"
            placeholder="Search for a tool..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 pl-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full shadow-lg focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 outline-none"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Tag Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 px-4">
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
                  {initialTools.filter(tool => tool.tags.includes(tag)).length}
                </span>
              )}
              {tag === 'All' && (
                <span className="ml-2 px-2 py-0.5 bg-black/10 dark:bg-white/10 rounded-full text-xs">
                  {initialTools.length}
                </span>
              )}
            </button>
          ))}
        </div>
    </section>


      {/* --- Tool Grid (All Tools Preview) --- */}
      <section className="w-full">
        <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center transition-colors duration-300">Quick Access</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool, index) => {
              const ToolIcon = IconMap[tool.icon as keyof typeof IconMap] || Zap;
              return (
                <Link
                  key={index}
                  href={`/tools/${tool.slug}`}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-indigo-500 dark:border-indigo-400 cursor-pointer group"
                >
                  <div className="flex items-center mb-3">
                    <div className="p-3 mr-3 rounded-full bg-indigo-50 dark:bg-indigo-900">
                      <ToolIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">{tool.name}</h4>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-3">{tool.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tool.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium group-hover:text-indigo-800 dark:group-hover:text-indigo-300 transition-colors flex items-center">
                    Use Tool
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No tools found matching &quot;{searchQuery}&quot;</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </section>

    </>
  );
}