// app/api/base64/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, mode } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required and must be a string' },
        { status: 400 }
      );
    }

    if (!mode || !['encode', 'decode'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode: must be either "encode" or "decode"' },
        { status: 400 }
      );
    }

    let result: string;

    try {
      if (mode === 'encode') {
        // Encode to Base64
        result = btoa(unescape(encodeURIComponent(text)));
      } else {
        // Decode from Base64
        result = decodeURIComponent(escape(atob(text)));
      }

      return NextResponse.json({
        success: true,
        mode,
        input: text,
        output: result,
      });
    } catch (error) {
      return NextResponse.json(
        { 
          error: mode === 'encode' 
            ? 'Failed to encode text' 
            : 'Invalid Base64 string or decoding failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }
}

// Handle GET requests with usage information
export async function GET() {
  return NextResponse.json({
    message: 'Base64 Converter API',
    usage: {
      method: 'POST',
      endpoint: '/api/base64',
      contentType: 'application/json',
      body: {
        text: 'string (required) - The text to encode or decode',
        mode: 'string (required) - Either "encode" or "decode"',
      },
      examples: {
        encode: {
          request: {
            text: 'Hello, World!',
            mode: 'encode',
          },
          response: {
            success: true,
            mode: 'encode',
            input: 'Hello, World!',
            output: 'SGVsbG8sIFdvcmxkIQ==',
          },
        },
        decode: {
          request: {
            text: 'SGVsbG8sIFdvcmxkIQ==',
            mode: 'decode',
          },
          response: {
            success: true,
            mode: 'decode',
            input: 'SGVsbG8sIFdvcmxkIQ==',
            output: 'Hello, World!',
          },
        },
      },
    },
  });
}
