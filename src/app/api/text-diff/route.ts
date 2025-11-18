import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/text-diff
 * 
 * Compares two pieces of text and returns the differences.
 * 
 * Request body:
 * {
 *   "text1": string,           // Original text
 *   "text2": string,           // Modified text
 *   "mode": "chars" | "words" | "lines",  // Comparison granularity
 *   "ignoreCase": boolean,     // Case-insensitive comparison
 *   "ignoreWhitespace": boolean // Ignore whitespace differences
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "text1": string,
 *   "text2": string,
 *   "mode": string,
 *   "differences": Array<{
 *     "type": "added" | "removed" | "unchanged",
 *     "value": string,
 *     "count": number
 *   }>,
 *   "stats": {
 *     "additions": number,
 *     "deletions": number,
 *     "unchanged": number,
 *     "totalChanges": number,
 *     "similarity": number
 *   }
 * }
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      text1, 
      text2, 
      mode = 'lines', 
      ignoreCase = false, 
      ignoreWhitespace = false 
    } = body;

    // Validation
    if (text1 === undefined || text2 === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Both text1 and text2 are required.' 
        },
        { status: 400 }
      );
    }

    if (!['chars', 'words', 'lines'].includes(mode)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid mode. Must be "chars", "words", or "lines".' 
        },
        { status: 400 }
      );
    }

    // Preprocess text based on options
    let processedText1 = text1;
    let processedText2 = text2;

    if (ignoreCase) {
      processedText1 = text1.toLowerCase();
      processedText2 = text2.toLowerCase();
    }

    if (ignoreWhitespace) {
      processedText1 = processedText1.replace(/\s+/g, ' ').trim();
      processedText2 = processedText2.replace(/\s+/g, ' ').trim();
    }

    // Split text based on mode
    let array1: string[];
    let array2: string[];

    switch (mode) {
      case 'chars':
        array1 = processedText1.split('');
        array2 = processedText2.split('');
        break;
      case 'words':
        array1 = processedText1.split(/\s+/).filter((w: string) => w);
        array2 = processedText2.split(/\s+/).filter((w: string) => w);
        break;
      case 'lines':
        array1 = processedText1.split('\n');
        array2 = processedText2.split('\n');
        break;
      default:
        array1 = processedText1.split('\n');
        array2 = processedText2.split('\n');
    }

    // Calculate differences using Myers diff algorithm
    const differences = calculateDiff(array1, array2, mode);

    // Calculate statistics
    const additions = differences.filter(d => d.type === 'added').reduce((sum, d) => sum + d.count, 0);
    const deletions = differences.filter(d => d.type === 'removed').reduce((sum, d) => sum + d.count, 0);
    const unchanged = differences.filter(d => d.type === 'unchanged').reduce((sum, d) => sum + d.count, 0);
    const totalChanges = additions + deletions;
    const total = additions + deletions + unchanged;
    const similarity = total > 0 ? ((unchanged / total) * 100).toFixed(2) : '100.00';

    return NextResponse.json({
      success: true,
      text1,
      text2,
      mode,
      differences,
      stats: {
        additions,
        deletions,
        unchanged,
        totalChanges,
        similarity: parseFloat(similarity),
      },
    });
  } catch (error) {
    console.error('Text Diff Error:', error);
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
 * GET /api/text-diff
 * 
 * Returns API documentation and usage examples.
 */
export async function GET() {
  const documentation = {
    endpoint: '/api/text-diff',
    method: 'POST',
    description: 'Compare two pieces of text and identify additions, deletions, and unchanged content.',
    requestBody: {
      text1: {
        type: 'string',
        required: true,
        description: 'Original text (before changes)',
      },
      text2: {
        type: 'string',
        required: true,
        description: 'Modified text (after changes)',
      },
      mode: {
        type: 'string',
        required: false,
        default: 'lines',
        enum: ['chars', 'words', 'lines'],
        description: 'Comparison granularity: character-by-character, word-by-word, or line-by-line',
      },
      ignoreCase: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Perform case-insensitive comparison',
      },
      ignoreWhitespace: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Ignore whitespace differences',
      },
    },
    response: {
      success: 'boolean',
      text1: 'string (original text)',
      text2: 'string (modified text)',
      mode: 'string',
      differences: [
        {
          type: 'string ("added" | "removed" | "unchanged")',
          value: 'string (content)',
          count: 'number (element count)',
        },
      ],
      stats: {
        additions: 'number (added elements)',
        deletions: 'number (removed elements)',
        unchanged: 'number (unchanged elements)',
        totalChanges: 'number (additions + deletions)',
        similarity: 'number (percentage 0-100)',
      },
    },
    examples: [
      {
        title: 'Compare Lines',
        request: {
          text1: 'Hello World\nThis is line 2\nGoodbye',
          text2: 'Hello World\nThis is line two\nGoodbye\nNew line',
          mode: 'lines',
        },
        response: {
          success: true,
          mode: 'lines',
          differences: [
            { type: 'unchanged', value: 'Hello World', count: 1 },
            { type: 'removed', value: 'This is line 2', count: 1 },
            { type: 'added', value: 'This is line two', count: 1 },
            { type: 'unchanged', value: 'Goodbye', count: 1 },
            { type: 'added', value: 'New line', count: 1 },
          ],
          stats: {
            additions: 2,
            deletions: 1,
            unchanged: 2,
            totalChanges: 3,
            similarity: 40.00,
          },
        },
      },
      {
        title: 'Compare Words',
        request: {
          text1: 'The quick brown fox',
          text2: 'The fast brown dog',
          mode: 'words',
        },
        response: {
          success: true,
          mode: 'words',
          differences: [
            { type: 'unchanged', value: 'The', count: 1 },
            { type: 'removed', value: 'quick', count: 1 },
            { type: 'added', value: 'fast', count: 1 },
            { type: 'unchanged', value: 'brown', count: 1 },
            { type: 'removed', value: 'fox', count: 1 },
            { type: 'added', value: 'dog', count: 1 },
          ],
          stats: {
            additions: 2,
            deletions: 2,
            unchanged: 2,
            totalChanges: 4,
            similarity: 33.33,
          },
        },
      },
      {
        title: 'Compare Characters',
        request: {
          text1: 'Hello',
          text2: 'Hallo',
          mode: 'chars',
        },
        response: {
          success: true,
          mode: 'chars',
          differences: [
            { type: 'unchanged', value: 'H', count: 1 },
            { type: 'removed', value: 'e', count: 1 },
            { type: 'added', value: 'a', count: 1 },
            { type: 'unchanged', value: 'llo', count: 3 },
          ],
          stats: {
            additions: 1,
            deletions: 1,
            unchanged: 4,
            totalChanges: 2,
            similarity: 66.67,
          },
        },
      },
      {
        title: 'Ignore Case and Whitespace',
        request: {
          text1: 'Hello  World',
          text2: 'hello world',
          mode: 'words',
          ignoreCase: true,
          ignoreWhitespace: true,
        },
        response: {
          success: true,
          mode: 'words',
          differences: [
            { type: 'unchanged', value: 'hello', count: 1 },
            { type: 'unchanged', value: 'world', count: 1 },
          ],
          stats: {
            additions: 0,
            deletions: 0,
            unchanged: 2,
            totalChanges: 0,
            similarity: 100.00,
          },
        },
      },
    ],
    useCases: [
      'Compare document versions to track changes',
      'Review code changes before committing',
      'Detect plagiarism or content similarity',
      'Validate data transformations and migrations',
      'Track configuration file changes',
      'Compare API responses or JSON outputs',
    ],
    notes: [
      'Differences are calculated using a variant of the Myers diff algorithm',
      'Character mode is best for small strings',
      'Word mode is ideal for prose and natural language',
      'Line mode is perfect for code and structured text',
      'Similarity is calculated as: (unchanged / total) * 100',
      'ignoreCase converts all text to lowercase before comparison',
      'ignoreWhitespace normalizes all whitespace to single spaces',
    ],
  };

  return NextResponse.json(documentation, { status: 200 });
}

/**
 * Calculate differences between two arrays using Myers diff algorithm
 */
function calculateDiff(
  array1: string[],
  array2: string[],
  mode: string
): Array<{ type: 'added' | 'removed' | 'unchanged'; value: string; count: number }> {
  const n = array1.length;
  const m = array2.length;
  const max = n + m;
  const v: { [key: number]: number } = { 1: 0 };
  const trace: Array<{ [key: number]: number }> = [];

  // Find shortest edit script
  let x = 0, y = 0;
  for (let d = 0; d <= max; d++) {
    trace.push({ ...v });
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      if (k === -d || (k !== d && v[k - 1] < v[k + 1])) {
        x = v[k + 1];
      } else {
        x = v[k - 1] + 1;
      }
      let y = x - k;

      while (x < n && y < m && array1[x] === array2[y]) {
        x++;
        y++;
      }

      v[k] = x;

      if (x >= n && y >= m) {
        return backtrack(array1, array2, trace, mode);
      }
    }
  }

  return [];
}

/**
 * Backtrack through the trace to build the diff
 */
function backtrack(
  array1: string[],
  array2: string[],
  trace: Array<{ [key: number]: number }>,
  mode: string
): Array<{ type: 'added' | 'removed' | 'unchanged'; value: string; count: number }> {
  const result: Array<{ type: 'added' | 'removed' | 'unchanged'; value: string; count: number }> = [];
  let x = array1.length;
  let y = array2.length;

  for (let d = trace.length - 1; d >= 0; d--) {
    const v = trace[d];
    const k = x - y;

    let prevK: number;
    if (k === -d || (k !== d && v[k - 1] < v[k + 1])) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }

    const prevX = v[prevK];
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) {
      result.unshift({
        type: 'unchanged',
        value: array1[x - 1],
        count: 1,
      });
      x--;
      y--;
    }

    if (d > 0) {
      if (x > prevX) {
        result.unshift({
          type: 'removed',
          value: array1[x - 1],
          count: 1,
        });
        x--;
      } else {
        result.unshift({
          type: 'added',
          value: array2[y - 1],
          count: 1,
        });
        y--;
      }
    }
  }

  // Merge consecutive items of the same type
  return mergeConsecutive(result, mode);
}

/**
 * Merge consecutive diff items of the same type
 */
function mergeConsecutive(
  diffs: Array<{ type: 'added' | 'removed' | 'unchanged'; value: string; count: number }>,
  mode: string
): Array<{ type: 'added' | 'removed' | 'unchanged'; value: string; count: number }> {
  const merged: Array<{ type: 'added' | 'removed' | 'unchanged'; value: string; count: number }> = [];
  
  for (const diff of diffs) {
    const last = merged[merged.length - 1];
    
    if (last && last.type === diff.type) {
      // Merge with previous
      const separator = mode === 'chars' ? '' : mode === 'words' ? ' ' : '\n';
      last.value += separator + diff.value;
      last.count += diff.count;
    } else {
      merged.push({ ...diff });
    }
  }

  return merged;
}
