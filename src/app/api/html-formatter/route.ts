import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/html-formatter
 * 
 * Formats (prettifies) or minifies HTML code.
 * 
 * Request body:
 * {
 *   "html": string,              // HTML code to format
 *   "mode": "prettify" | "minify",
 *   "options"?: {
 *     "indentSize": number,      // Spaces per indent level (default: 2)
 *     "preserveNewlines": boolean, // Keep existing line breaks (default: false)
 *     "removeComments": boolean,   // Remove HTML comments (default: false for prettify, true for minify)
 *     "sortAttributes": boolean    // Sort element attributes alphabetically (default: false)
 *   }
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "mode": "prettify" | "minify",
 *   "input": string,
 *   "output": string,
 *   "stats": {
 *     "originalSize": number,
 *     "formattedSize": number,
 *     "reduction": number,        // Percentage reduction (for minify)
 *     "lines": number
 *   }
 * }
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { html, mode, options = {} } = body;

    // Validation
    if (!html) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'HTML code is required.' 
        },
        { status: 400 }
      );
    }

    if (!mode || !['prettify', 'minify'].includes(mode)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid mode. Must be "prettify" or "minify".' 
        },
        { status: 400 }
      );
    }

    // Default options
    const indentSize = options.indentSize || 2;
    const preserveNewlines = options.preserveNewlines || false;
    const removeComments = options.removeComments !== undefined 
      ? options.removeComments 
      : (mode === 'minify');
    const sortAttributes = options.sortAttributes || false;

    let output: string;
    const originalSize = html.length;

    if (mode === 'prettify') {
      output = prettifyHTML(html, {
        indentSize,
        preserveNewlines,
        removeComments,
        sortAttributes,
      });
    } else {
      output = minifyHTML(html, {
        removeComments,
        sortAttributes,
      });
    }

    const formattedSize = output.length;
    const reduction = originalSize > 0 
      ? ((originalSize - formattedSize) / originalSize * 100).toFixed(2) 
      : '0.00';
    const lines = output.split('\n').length;

    return NextResponse.json({
      success: true,
      mode,
      input: html,
      output,
      stats: {
        originalSize,
        formattedSize,
        reduction: mode === 'minify' ? parseFloat(reduction) : 0,
        lines,
      },
    });
  } catch (error) {
    console.error('HTML Formatter Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred.' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/html-formatter
 * 
 * Returns API documentation and usage examples.
 */
export async function GET() {
  const documentation = {
    endpoint: '/api/html-formatter',
    method: 'POST',
    description: 'Format (prettify) or compress (minify) HTML code for readability or production deployment.',
    requestBody: {
      html: {
        type: 'string',
        required: true,
        description: 'The HTML code to format or minify',
      },
      mode: {
        type: 'string',
        required: true,
        enum: ['prettify', 'minify'],
        description: 'Format mode: "prettify" for readable formatting, "minify" for compressed output',
      },
      options: {
        type: 'object',
        required: false,
        properties: {
          indentSize: {
            type: 'number',
            default: 2,
            description: 'Number of spaces per indentation level (prettify mode)',
          },
          preserveNewlines: {
            type: 'boolean',
            default: false,
            description: 'Preserve existing line breaks (prettify mode)',
          },
          removeComments: {
            type: 'boolean',
            default: 'false for prettify, true for minify',
            description: 'Remove HTML comments from output',
          },
          sortAttributes: {
            type: 'boolean',
            default: false,
            description: 'Sort element attributes alphabetically',
          },
        },
      },
    },
    response: {
      success: 'boolean',
      mode: 'string',
      input: 'string (original HTML)',
      output: 'string (formatted HTML)',
      stats: {
        originalSize: 'number (bytes)',
        formattedSize: 'number (bytes)',
        reduction: 'number (percentage, for minify mode)',
        lines: 'number',
      },
    },
    examples: [
      {
        title: 'Prettify HTML',
        request: {
          html: '<html><head><title>Test</title></head><body><div class="container"><h1>Hello World</h1><p>This is a test.</p></div></body></html>',
          mode: 'prettify',
          options: {
            indentSize: 2,
            removeComments: false,
          },
        },
        response: {
          success: true,
          mode: 'prettify',
          output: `<html>
  <head>
    <title>Test</title>
  </head>
  <body>
    <div class="container">
      <h1>Hello World</h1>
      <p>This is a test.</p>
    </div>
  </body>
</html>`,
          stats: {
            originalSize: 128,
            formattedSize: 157,
            reduction: 0,
            lines: 11,
          },
        },
      },
      {
        title: 'Minify HTML',
        request: {
          html: `<html>
  <head>
    <title>Test</title>
  </head>
  <body>
    <div class="container">
      <h1>Hello World</h1>
      <p>This is a test.</p>
    </div>
  </body>
</html>`,
          mode: 'minify',
          options: {
            removeComments: true,
          },
        },
        response: {
          success: true,
          mode: 'minify',
          output: '<html><head><title>Test</title></head><body><div class="container"><h1>Hello World</h1><p>This is a test.</p></div></body></html>',
          stats: {
            originalSize: 157,
            formattedSize: 128,
            reduction: 18.47,
            lines: 1,
          },
        },
      },
      {
        title: 'Remove Comments',
        request: {
          html: '<!-- Header --><header><h1>Title</h1></header><!-- Footer --><footer><p>Copyright 2024</p></footer>',
          mode: 'prettify',
          options: {
            indentSize: 4,
            removeComments: true,
          },
        },
        response: {
          success: true,
          mode: 'prettify',
          output: `<header>
    <h1>Title</h1>
</header>
<footer>
    <p>Copyright 2024</p>
</footer>`,
          stats: {
            originalSize: 103,
            formattedSize: 72,
            reduction: 0,
            lines: 6,
          },
        },
      },
      {
        title: 'Sort Attributes',
        request: {
          html: '<div id="main" class="container" data-value="test" aria-label="Main">Content</div>',
          mode: 'prettify',
          options: {
            sortAttributes: true,
          },
        },
        response: {
          success: true,
          mode: 'prettify',
          output: '<div aria-label="Main" class="container" data-value="test" id="main">Content</div>',
          stats: {
            originalSize: 83,
            formattedSize: 83,
            reduction: 0,
            lines: 1,
          },
        },
      },
    ],
    useCases: [
      'Format messy HTML code for better readability',
      'Minify HTML for faster page load times in production',
      'Standardize HTML formatting across team projects',
      'Remove comments and whitespace from production HTML',
      'Clean up HTML from WYSIWYG editors or generated code',
      'Prepare HTML for version control with consistent formatting',
    ],
    notes: [
      'Prettify mode adds proper indentation and line breaks',
      'Minify mode removes unnecessary whitespace and line breaks',
      'Comments can be removed in both modes',
      'Attribute sorting helps with consistent code formatting',
      'Self-closing tags are preserved (e.g., <img />, <br />)',
      'Script and style content is preserved as-is',
    ],
  };

  return NextResponse.json(documentation, { status: 200 });
}

/**
 * Prettify HTML with proper indentation and formatting
 */
function prettifyHTML(
  html: string,
  options: {
    indentSize: number;
    preserveNewlines: boolean;
    removeComments: boolean;
    sortAttributes: boolean;
  }
): string {
  const { indentSize, preserveNewlines, removeComments, sortAttributes } = options;
  
  // Remove comments if requested
  if (removeComments) {
    html = html.replace(/<!--[\s\S]*?-->/g, '');
  }

  // Remove extra whitespace but preserve content
  html = html.trim();

  let formatted = '';
  let indentLevel = 0;
  const indent = ' '.repeat(indentSize);
  let inTag = false;
  let tagBuffer = '';
  let inScript = false;
  let inStyle = false;

  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    const nextChar = html[i + 1];

    if (char === '<') {
      // Check if this is a closing tag
      const isClosingTag = nextChar === '/';
      
      // Check if entering script or style tag
      const tagMatch = html.substring(i).match(/^<(script|style)(\s|>)/i);
      const closingTagMatch = html.substring(i).match(/^<\/(script|style)>/i);
      
      if (tagMatch) {
        inScript = tagMatch[1].toLowerCase() === 'script';
        inStyle = tagMatch[1].toLowerCase() === 'style';
      }
      
      if (closingTagMatch) {
        inScript = false;
        inStyle = false;
      }

      // Add content before tag if any
      if (tagBuffer.trim()) {
        formatted += tagBuffer.trim();
        tagBuffer = '';
      }

      // Add newline and indentation for closing tags
      if (isClosingTag) {
        indentLevel = Math.max(0, indentLevel - 1);
        formatted += '\n' + indent.repeat(indentLevel);
      }

      inTag = true;
    }

    if (inTag) {
      tagBuffer += char;
    } else if (inScript || inStyle) {
      // Preserve script/style content as-is
      formatted += char;
    } else {
      // Regular content outside tags
      if (char !== '\n' || preserveNewlines) {
        tagBuffer += char;
      }
    }

    if (char === '>') {
      inTag = false;
      
      // Process the complete tag
      let tag = tagBuffer;
      
      // Sort attributes if requested
      if (sortAttributes && tag.includes(' ')) {
        tag = sortTagAttributes(tag);
      }

      formatted += tag;
      tagBuffer = '';

      // Check if this is a self-closing or void tag
      const isSelfClosing = html[i - 1] === '/' || 
        /^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)(\s|>)/i.test(tag);
      
      const isOpeningTag = tag[1] !== '/' && !isSelfClosing;
      
      // Increase indent for opening tags
      if (isOpeningTag && !inScript && !inStyle) {
        indentLevel++;
        formatted += '\n' + indent.repeat(indentLevel);
      } else if (isSelfClosing || tag[1] === '/') {
        // Add newline after self-closing or closing tags
        if (html[i + 1] === '<') {
          formatted += '\n' + indent.repeat(indentLevel);
        }
      }
    }
  }

  // Add any remaining content
  if (tagBuffer.trim()) {
    formatted += tagBuffer.trim();
  }

  // Clean up extra blank lines
  formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return formatted.trim();
}

/**
 * Minify HTML by removing whitespace and comments
 */
function minifyHTML(
  html: string,
  options: {
    removeComments: boolean;
    sortAttributes: boolean;
  }
): string {
  const { removeComments, sortAttributes } = options;

  // Remove comments
  if (removeComments) {
    html = html.replace(/<!--[\s\S]*?-->/g, '');
  }

  // Remove whitespace between tags
  html = html.replace(/>\s+</g, '><');
  
  // Remove leading/trailing whitespace
  html = html.trim();
  
  // Collapse multiple spaces into one (but preserve spaces in content)
  html = html.replace(/\s{2,}/g, ' ');

  // Sort attributes if requested
  if (sortAttributes) {
    html = html.replace(/<([a-z][a-z0-9]*)\s+([^>]+)>/gi, (match, tagName, attrs) => {
      return `<${tagName} ${sortAttributesString(attrs)}>`;
    });
  }

  return html;
}

/**
 * Sort attributes within a tag
 */
function sortTagAttributes(tag: string): string {
  const match = tag.match(/^<([a-z][a-z0-9]*)\s+([^>]+)(\/?)>$/i);
  if (!match) return tag;

  const [, tagName, attrsString, selfClosing] = match;
  const sortedAttrs = sortAttributesString(attrsString);
  
  return `<${tagName} ${sortedAttrs}${selfClosing}>`;
}

/**
 * Sort attribute string alphabetically
 */
function sortAttributesString(attrsString: string): string {
  // Parse attributes
  const attrRegex = /([a-z][a-z0-9-]*)(?:="([^"]*)"|='([^']*)'|=([^\s>]+))?/gi;
  const attributes: Array<{ name: string; value: string; quote: string }> = [];
  
  let match;
  while ((match = attrRegex.exec(attrsString)) !== null) {
    const name = match[1];
    const value = match[2] || match[3] || match[4] || '';
    const quote = match[2] !== undefined ? '"' : match[3] !== undefined ? "'" : '';
    attributes.push({ name, value, quote: quote || (value ? '"' : '') });
  }

  // Sort alphabetically
  attributes.sort((a, b) => a.name.localeCompare(b.name));

  // Rebuild attribute string
  return attributes
    .map(attr => {
      if (attr.value) {
        return `${attr.name}=${attr.quote}${attr.value}${attr.quote}`;
      }
      return attr.name;
    })
    .join(' ');
}
