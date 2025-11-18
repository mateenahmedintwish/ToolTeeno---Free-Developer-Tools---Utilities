import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pattern, text, flags = 'g' } = body;

    // Validate required fields
    if (!pattern) {
      return NextResponse.json(
        { success: false, error: 'Pattern is required' },
        { status: 400 }
      );
    }

    if (text === undefined || text === null) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    // Validate flags
    const validFlags = ['g', 'i', 'm', 's', 'u', 'y'];
    const flagArray = flags.split('');
    const invalidFlags = flagArray.filter((flag: string) => !validFlags.includes(flag));
    
    if (invalidFlags.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid flags: ${invalidFlags.join(', ')}. Valid flags are: g, i, m, s, u, y` },
        { status: 400 }
      );
    }

    let regex: RegExp;
    try {
      regex = new RegExp(pattern, flags);
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: `Invalid regex pattern: ${err.message}` },
        { status: 400 }
      );
    }

    // Find all matches
    const matches: any[] = [];
    let match;
    
    if (flags.includes('g')) {
      // Global flag - find all matches
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
          input: match.input,
        });
        
        // Prevent infinite loop for zero-width matches
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
    } else {
      // No global flag - find first match only
      match = regex.exec(text);
      if (match) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
          input: match.input,
        });
      }
    }

    // Test if pattern matches
    const isMatch = matches.length > 0;

    // Additional analysis
    const analysis = {
      totalMatches: matches.length,
      isMatch,
      pattern,
      flags,
      textLength: text.length,
    };

    return NextResponse.json({
      success: true,
      matches,
      analysis,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const documentation = {
    endpoint: '/api/regex-tester',
    method: 'POST',
    description: 'Test and debug regular expressions against sample text with real-time matching',
    requestBody: {
      pattern: {
        type: 'string',
        required: true,
        description: 'The regular expression pattern to test',
        example: '\\d{3}-\\d{3}-\\d{4}',
      },
      text: {
        type: 'string',
        required: true,
        description: 'The text to test the pattern against',
        example: 'Call me at 123-456-7890 or 987-654-3210',
      },
      flags: {
        type: 'string',
        required: false,
        default: 'g',
        description: 'Regex flags: g (global), i (case-insensitive), m (multiline), s (dotall), u (unicode), y (sticky)',
        example: 'gi',
      },
    },
    response: {
      success: {
        type: 'boolean',
        description: 'Whether the request was successful',
      },
      matches: {
        type: 'array',
        description: 'Array of match objects containing match details',
        items: {
          match: 'The matched text',
          index: 'The starting index of the match',
          groups: 'Array of captured groups',
          input: 'The original input text',
        },
      },
      analysis: {
        type: 'object',
        description: 'Analysis of the regex test results',
        properties: {
          totalMatches: 'Total number of matches found',
          isMatch: 'Boolean indicating if any matches were found',
          pattern: 'The pattern that was tested',
          flags: 'The flags that were used',
          textLength: 'Length of the input text',
        },
      },
    },
    examples: [
      {
        name: 'Phone Number Validation',
        description: 'Extract US phone numbers from text',
        request: {
          pattern: '\\d{3}-\\d{3}-\\d{4}',
          text: 'Contact: 123-456-7890 or 987-654-3210',
          flags: 'g',
        },
        response: {
          success: true,
          matches: [
            {
              match: '123-456-7890',
              index: 9,
              groups: [],
              input: 'Contact: 123-456-7890 or 987-654-3210',
            },
            {
              match: '987-654-3210',
              index: 25,
              groups: [],
              input: 'Contact: 123-456-7890 or 987-654-3210',
            },
          ],
          analysis: {
            totalMatches: 2,
            isMatch: true,
            pattern: '\\d{3}-\\d{3}-\\d{4}',
            flags: 'g',
            textLength: 37,
          },
        },
      },
      {
        name: 'Email Extraction with Case Insensitivity',
        description: 'Find all email addresses (case-insensitive)',
        request: {
          pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}',
          text: 'Contact: John@Example.com or support@COMPANY.NET',
          flags: 'gi',
        },
        response: {
          success: true,
          matches: [
            {
              match: 'John@Example.com',
              index: 9,
              groups: [],
            },
            {
              match: 'support@COMPANY.NET',
              index: 29,
              groups: [],
            },
          ],
          analysis: {
            totalMatches: 2,
            isMatch: true,
          },
        },
      },
      {
        name: 'Capture Groups',
        description: 'Extract parts of a date using capture groups',
        request: {
          pattern: '(\\d{4})-(\\d{2})-(\\d{2})',
          text: 'Date: 2024-03-15',
          flags: 'g',
        },
        response: {
          success: true,
          matches: [
            {
              match: '2024-03-15',
              index: 6,
              groups: ['2024', '03', '15'],
              input: 'Date: 2024-03-15',
            },
          ],
          analysis: {
            totalMatches: 1,
            isMatch: true,
          },
        },
      },
    ],
    useCases: [
      'Validate user input (emails, phone numbers, URLs)',
      'Extract data from text (dates, numbers, codes)',
      'Test regex patterns before using in production',
      'Debug complex regular expressions',
      'Learn and experiment with regex syntax',
      'Parse log files and text data',
      'Validate form inputs in real-time',
    ],
    benefits: [
      'Real-time regex testing and debugging',
      'Capture group visualization',
      'Detailed match information with indices',
      'Support for all JavaScript regex flags',
      'Error handling for invalid patterns',
      'Multiple match detection with global flag',
      'Free to use with no rate limits',
    ],
  };

  return NextResponse.json(documentation, { status: 200 });
}
