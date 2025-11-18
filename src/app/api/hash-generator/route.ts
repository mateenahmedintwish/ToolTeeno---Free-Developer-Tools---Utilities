// app/api/hash-generator/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

/**
 * Hash Generator API
 * 
 * Generates cryptographic hashes from input text using various algorithms.
 * Supports multiple hash algorithms including MD5, SHA-1, SHA-256, SHA-384, and SHA-512.
 * 
 * @route POST /api/hash-generator
 * @route GET /api/hash-generator (for documentation)
 */

interface HashRequest {
  text: string;
  algorithms?: string[];
}

interface HashResult {
  algorithm: string;
  hash: string;
  length: number;
}

interface HashResponse {
  success: boolean;
  results?: HashResult[];
  input?: {
    text: string;
    textLength: number;
  };
  error?: string;
}

// Supported hash algorithms
const SUPPORTED_ALGORITHMS = [
  'md5',
  'sha1',
  'sha256',
  'sha384',
  'sha512',
  'ripemd160',
];

/**
 * Generate hash for given text using specified algorithm
 */
function generateHash(text: string, algorithm: string): string {
  try {
    return createHash(algorithm).update(text, 'utf8').digest('hex');
  } catch (error) {
    throw new Error(`Failed to generate ${algorithm} hash: ${error}`);
  }
}

/**
 * GET handler - Returns API documentation
 */
export async function GET() {
  const documentation = {
    endpoint: '/api/hash-generator',
    method: 'POST',
    description: 'Generate cryptographic hashes from input text using various algorithms',
    supportedAlgorithms: SUPPORTED_ALGORITHMS,
    requestBody: {
      text: 'string (required) - The text to hash',
      algorithms: 'string[] (optional) - Array of algorithms to use. If not provided, all algorithms will be used.',
    },
    exampleRequest: {
      text: 'Hello, World!',
      algorithms: ['md5', 'sha256', 'sha512'],
    },
    exampleResponse: {
      success: true,
      results: [
        {
          algorithm: 'md5',
          hash: '65a8e27d8879283831b664bd8b7f0ad4',
          length: 32,
        },
        {
          algorithm: 'sha256',
          hash: 'dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f',
          length: 64,
        },
      ],
      input: {
        text: 'Hello, World!',
        textLength: 13,
      },
    },
    curlExample: `curl -X POST https://toolteeno.com/api/hash-generator \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Hello, World!","algorithms":["md5","sha256"]}'`,
    javascriptExample: `fetch('https://toolteeno.com/api/hash-generator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Hello, World!',
    algorithms: ['md5', 'sha256', 'sha512']
  })
})
.then(res => res.json())
.then(data => console.log(data));`,
    pythonExample: `import requests

response = requests.post(
    'https://toolteeno.com/api/hash-generator',
    json={
        'text': 'Hello, World!',
        'algorithms': ['md5', 'sha256', 'sha512']
    }
)
print(response.json())`,
  };

  return NextResponse.json(documentation);
}

/**
 * POST handler - Generate hashes
 */
export async function POST(request: NextRequest) {
  try {
    const body: HashRequest = await request.json();

    // Validate input
    if (!body.text) {
      return NextResponse.json(
        {
          success: false,
          error: 'Text input is required',
        } as HashResponse,
        { status: 400 }
      );
    }

    if (typeof body.text !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Text must be a string',
        } as HashResponse,
        { status: 400 }
      );
    }

    // Determine which algorithms to use
    let algorithmsToUse = body.algorithms || SUPPORTED_ALGORITHMS;

    // Validate algorithms
    if (!Array.isArray(algorithmsToUse)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Algorithms must be an array',
        } as HashResponse,
        { status: 400 }
      );
    }

    // Convert to lowercase and validate
    algorithmsToUse = algorithmsToUse.map(alg => alg.toLowerCase());
    const invalidAlgorithms = algorithmsToUse.filter(
      alg => !SUPPORTED_ALGORITHMS.includes(alg)
    );

    if (invalidAlgorithms.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported algorithms: ${invalidAlgorithms.join(', ')}. Supported algorithms: ${SUPPORTED_ALGORITHMS.join(', ')}`,
        } as HashResponse,
        { status: 400 }
      );
    }

    // Generate hashes
    const results: HashResult[] = [];

    for (const algorithm of algorithmsToUse) {
      try {
        const hash = generateHash(body.text, algorithm);
        results.push({
          algorithm: algorithm.toUpperCase(),
          hash,
          length: hash.length,
        });
      } catch (error) {
        console.error(`Error generating ${algorithm} hash:`, error);
        // Continue with other algorithms even if one fails
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate any hashes',
        } as HashResponse,
        { status: 500 }
      );
    }

    // Return results
    return NextResponse.json({
      success: true,
      results,
      input: {
        text: body.text,
        textLength: body.text.length,
      },
    } as HashResponse);

  } catch (error) {
    console.error('Hash generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate hashes',
      } as HashResponse,
      { status: 500 }
    );
  }
}
