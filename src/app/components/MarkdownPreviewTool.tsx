"use client";

import React, { useState, useMemo } from 'react';
import { FileText, Eye, Copy, Check } from 'lucide-react';

// --- Simple Markdown to HTML Converter ---
// This function performs a basic conversion of common markdown elements
// to HTML using regular expressions.
const markdownToHtml = (markdown: string): string => {
  if (!markdown) return '<p class="text-gray-400 italic">Start typing your Markdown here...</p>';

  // 1. Escape HTML special characters before processing markdown
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Handle block-level elements (Headings, Paragraphs, Lists)
  const lines = html.split('\n');
  let processedHtml = '';
  let inList = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check for Headings
    if (trimmedLine.startsWith('### ')) {
      processedHtml += `<h3>${trimmedLine.substring(4)}</h3>`;
      inList = false;
    } else if (trimmedLine.startsWith('## ')) {
      processedHtml += `<h2>${trimmedLine.substring(3)}</h2>`;
      inList = false;
    } else if (trimmedLine.startsWith('# ')) {
      processedHtml += `<h1>${trimmedLine.substring(2)}</h1>`;
      inList = false;
    } 
    // Check for Lists
    else if (trimmedLine.match(/^(\*|-)\s/)) {
      const listItemContent = trimmedLine.substring(trimmedLine.indexOf(' ') + 1);
      if (!inList) {
        processedHtml += '<ul>';
        inList = true;
      }
      processedHtml += `<li>${listItemContent}</li>`;
    }
    // Check for Paragraphs/Blank Lines
    else if (trimmedLine === '') {
      if (inList) {
        processedHtml += '</ul>';
        inList = false;
      }
      // Add a paragraph break for separation
      processedHtml += '<br />';
    }
    // Default Paragraph line
    else {
      if (inList) {
        processedHtml += '</ul>';
        inList = false;
      }
      processedHtml += `<p>${trimmedLine}</p>`;
    }
  }

  if (inList) {
    processedHtml += '</ul>'; // Close any unclosed list at EOF
  }
  
  // 3. Inline elements (must be done after block processing)
  
  // Fix the temporary paragraph/list breaks
  processedHtml = processedHtml.replace(/<\/p><p>/g, ' ').replace(/<br \/>/g, ' ');

  // Inline Links: [text](url) - (Must be before bold/italic if they use similar characters)
  processedHtml = processedHtml.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-indigo-600 hover:underline">$1</a>');

  // Bold: **text**
  processedHtml = processedHtml.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); 

  // Italic: *text*
  processedHtml = processedHtml.replace(/\*(.*?)\*/g, '<em>$1</em>'); 

  // Code Block (basic inline code)
  processedHtml = processedHtml.replace(/`(.*?)`/g, '<code class="bg-gray-200 p-1 rounded font-mono text-sm">$1</code>');

  return processedHtml;
};
// --- End Simple Markdown to HTML Converter ---


export default function MarkdownPreviewTool() {
  const defaultMarkdown = `# Welcome to the Markdown Previewer!

## Features:
* Real-time conversion.
* Supports **bold** and *italic* text.
* Supports inline \`code blocks\`.
* [Links](https://example.com) are supported.

This is a paragraph of text.

### How to use:
Just type your Markdown in the left panel and see the results instantly on the right.`;

  const [markdownInput, setMarkdownInput] = useState<string>(defaultMarkdown);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Use useMemo to re-render the HTML output only when markdownInput changes
  const htmlOutput = useMemo(() => markdownToHtml(markdownInput), [markdownInput]);

  const handleCopy = () => {
    if (markdownInput) {
      navigator.clipboard.writeText(markdownInput);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 transition-colors duration-300">
      <header className="flex items-center space-x-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Markdown Previewer</h2>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Area (Editor) */}
        <div className="flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-2">
            <label className="flex text-lg font-medium text-gray-700 dark:text-gray-200 items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                Markdown Editor
            </label>
            <button
              onClick={handleCopy}
              className={`flex items-center px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                isCopied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800'
              }`}
            >
              {isCopied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            value={markdownInput}
            onChange={(e) => setMarkdownInput(e.target.value)}
            placeholder='Start typing your Markdown here...'
            className="grow p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm shadow-inner focus:ring-indigo-500 focus:border-indigo-500 resize-none outline-none"
            spellCheck="false"
          />
        </div>
        
        {/* Output Area (Preview) */}
        <div className="flex flex-col h-[500px]">
          <label className="flex text-lg font-medium text-gray-700 dark:text-gray-200 mb-2 items-center">
            <Eye className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
            Live Preview
          </label>
          <div
            className="grow p-4 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg shadow-inner overflow-y-auto prose dark:prose-invert prose-indigo max-w-none"
            // WARNING: Using dangerouslySetInnerHTML is necessary here but relies on trusted input.
            // Since this is a self-contained utility, we proceed.
            dangerouslySetInnerHTML={{ __html: htmlOutput }}
          />
        </div>
      </div>
      
      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
        This tool provides a live, client-side preview for basic Markdown syntax.
      </p>
    </div>
  );
}