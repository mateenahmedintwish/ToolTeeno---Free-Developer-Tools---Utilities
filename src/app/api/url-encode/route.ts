// app/api/url-encode/route.ts
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
        // Encode URL
        result = encodeURIComponent(text);
      } else {
        // Decode URL
        result = decodeURIComponent(text);
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
            ? 'Failed to encode URL' 
            : 'Invalid URL-encoded string or decoding failed',
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
    message: 'URL Encoder/Decoder API',
    usage: {
      method: 'POST',
      endpoint: '/api/url-encode',
      contentType: 'application/json',
      body: {
        text: 'string (required) - The text or URL to encode or decode',
        mode: 'string (required) - Either "encode" or "decode"',
      },
      encodingInfo: {
        encode: 'Converts special characters to percent-encoded format (e.g., space → %20)',
        decode: 'Converts percent-encoded characters back to original text',
        safeCharacters: 'A-Z a-z 0-9 - _ . ! ~ * \' ( )',
        encodedCharacters: 'All other characters including spaces, symbols, and non-ASCII',
      },
      examples: {
        encode: {
          request: {
            text: 'https://example.com/search?q=hello world&lang=en',
            mode: 'encode',
          },
          response: {
            success: true,
            mode: 'encode',
            input: 'https://example.com/search?q=hello world&lang=en',
            output: 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den',
          },
        },
        decode: {
          request: {
            text: 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den',
            mode: 'decode',
          },
          response: {
            success: true,
            mode: 'decode',
            input: 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den',
            output: 'https://example.com/search?q=hello world&lang=en',
          },
        },
        specialCharacters: {
          request: {
            text: 'Hello! How are you? 你好',
            mode: 'encode',
          },
          response: {
            success: true,
            mode: 'encode',
            input: 'Hello! How are you? 你好',
            output: 'Hello!%20How%20are%20you%3F%20%E4%BD%A0%E5%A5%BD',
          },
        },
      },
      commonUseCases: [
        'Encoding query parameters in URLs',
        'Preparing text for URL transmission',
        'Decoding URL parameters from query strings',
        'Handling special characters in API requests',
        'Processing form data submissions',
      ],
    },
  });
}
