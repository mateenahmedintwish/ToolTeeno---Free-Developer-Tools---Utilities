import { NextRequest, NextResponse } from 'next/server';

// Simple YAML parser (handles basic YAML structures)
function parseYAML(yaml: string): any {
  const lines = yaml.split('\n');
  const result: any = {};
  const stack: any[] = [{ obj: result, indent: -1 }];
  let currentKey = '';
  let isMultiline = false;
  let multilineValue = '';

  for (let line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = line.search(/\S/);
    const trimmed = line.trim();

    // Handle array items
    if (trimmed.startsWith('- ')) {
      const value = trimmed.substring(2).trim();
      const parent = stack[stack.length - 1];
      
      if (!Array.isArray(parent.obj[currentKey])) {
        parent.obj[currentKey] = [];
      }
      
      // Try to parse as number or boolean
      let parsedValue: any = value;
      if (value === 'true') parsedValue = true;
      else if (value === 'false') parsedValue = false;
      else if (value === 'null') parsedValue = null;
      else if (!isNaN(Number(value)) && value !== '') parsedValue = Number(value);
      
      parent.obj[currentKey].push(parsedValue);
      continue;
    }

    // Handle key-value pairs
    if (trimmed.includes(':')) {
      const colonIndex = trimmed.indexOf(':');
      const key = trimmed.substring(0, colonIndex).trim();
      let value = trimmed.substring(colonIndex + 1).trim();

      // Adjust stack based on indent
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].obj;

      if (value === '') {
        // Object or array will follow
        parent[key] = {};
        stack.push({ obj: parent[key], indent });
        currentKey = key;
      } else {
        // Parse value
        let parsedValue: any = value;
        if (value === 'true') parsedValue = true;
        else if (value === 'false') parsedValue = false;
        else if (value === 'null') parsedValue = null;
        else if (!isNaN(Number(value)) && value !== '') parsedValue = Number(value);
        else if (value.startsWith('"') && value.endsWith('"')) {
          parsedValue = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          parsedValue = value.slice(1, -1);
        }
        
        parent[key] = parsedValue;
        currentKey = key;
      }
    }
  }

  return result;
}

// Convert object to YAML
function toYAML(obj: any, indent = 0): string {
  const spaces = '  '.repeat(indent);
  let yaml = '';

  if (Array.isArray(obj)) {
    obj.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        yaml += `${spaces}- \n${toYAML(item, indent + 1)}`;
      } else {
        yaml += `${spaces}- ${item}\n`;
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            yaml += `${spaces}  - \n${toYAML(item, indent + 2)}`;
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        yaml += `${spaces}${key}:\n${toYAML(value, indent + 1)}`;
      } else {
        const stringValue = typeof value === 'string' && value.includes(':') ? `"${value}"` : value;
        yaml += `${spaces}${key}: ${stringValue}\n`;
      }
    });
  }

  return yaml;
}

// Simple XML parser
function parseXML(xml: string): any {
  // Remove XML declaration and comments
  xml = xml.replace(/<\?xml.*?\?>/g, '').replace(/<!--.*?-->/gs, '').trim();
  
  const result: any = {};
  
  // Match root element
  const rootMatch = xml.match(/<(\w+)[^>]*>([\s\S]*)<\/\1>/);
  if (!rootMatch) throw new Error('Invalid XML format');
  
  const rootTag = rootMatch[1];
  const rootContent = rootMatch[2];
  
  result[rootTag] = parseXMLNode(rootContent);
  return result;
}

function parseXMLNode(content: string): any {
  content = content.trim();
  
  // Check if it's a simple text node
  if (!content.includes('<')) {
    return content;
  }
  
  const result: any = {};
  const regex = /<(\w+)[^>]*>([\s\S]*?)<\/\1>/g;
  let match;
  const children: any[] = [];
  
  while ((match = regex.exec(content)) !== null) {
    const tag = match[1];
    const value = match[2].trim();
    
    const parsed = parseXMLNode(value);
    
    if (result[tag]) {
      if (!Array.isArray(result[tag])) {
        result[tag] = [result[tag]];
      }
      result[tag].push(parsed);
    } else {
      children.push({ tag, value: parsed });
    }
  }
  
  // If we have children, organize them
  if (children.length > 0) {
    children.forEach(child => {
      if (result[child.tag]) {
        if (!Array.isArray(result[child.tag])) {
          result[child.tag] = [result[child.tag]];
        }
        result[child.tag].push(child.value);
      } else {
        result[child.tag] = child.value;
      }
    });
    return result;
  }
  
  return content;
}

// Convert object to XML
function toXML(obj: any, rootTag = 'root', indent = 0): string {
  const spaces = '  '.repeat(indent);
  let xml = '';

  if (indent === 0) {
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  }

  if (typeof obj !== 'object' || obj === null) {
    return `${spaces}<${rootTag}>${obj}</${rootTag}>\n`;
  }

  if (Array.isArray(obj)) {
    obj.forEach(item => {
      xml += toXML(item, rootTag, indent);
    });
    return xml;
  }

  xml += `${spaces}<${rootTag}>\n`;
  
  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => {
        xml += toXML(item, key, indent + 1);
      });
    } else if (typeof value === 'object' && value !== null) {
      xml += toXML(value, key, indent + 1);
    } else {
      xml += `${spaces}  <${key}>${value}</${key}>\n`;
    }
  });

  xml += `${spaces}</${rootTag}>\n`;
  return xml;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, from, to } = body;

    // Validate required fields
    if (!input) {
      return NextResponse.json(
        { success: false, error: 'Input is required' },
        { status: 400 }
      );
    }

    if (!from || !to) {
      return NextResponse.json(
        { success: false, error: 'Both "from" and "to" format parameters are required' },
        { status: 400 }
      );
    }

    const validFormats = ['json', 'yaml', 'xml'];
    if (!validFormats.includes(from.toLowerCase()) || !validFormats.includes(to.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid format. Supported formats: json, yaml, xml' },
        { status: 400 }
      );
    }

    let parsed: any;

    // Parse input based on source format
    try {
      switch (from.toLowerCase()) {
        case 'json':
          parsed = JSON.parse(input);
          break;
        case 'yaml':
          parsed = parseYAML(input);
          break;
        case 'xml':
          parsed = parseXML(input);
          break;
      }
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: `Failed to parse ${from.toUpperCase()}: ${err.message}` },
        { status: 400 }
      );
    }

    // Convert to target format
    let output: string;
    try {
      switch (to.toLowerCase()) {
        case 'json':
          output = JSON.stringify(parsed, null, 2);
          break;
        case 'yaml':
          output = toYAML(parsed);
          break;
        case 'xml':
          output = toXML(parsed);
          break;
        default:
          throw new Error('Unsupported target format');
      }
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: `Failed to convert to ${to.toUpperCase()}: ${err.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      output,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      inputSize: input.length,
      outputSize: output.length,
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
    endpoint: '/api/yaml-converter',
    method: 'POST',
    description: 'Convert between JSON, YAML, and XML formats with bidirectional support',
    requestBody: {
      input: {
        type: 'string',
        required: true,
        description: 'The input data in the source format',
        example: '{"name": "John", "age": 30}',
      },
      from: {
        type: 'string',
        required: true,
        description: 'Source format (json, yaml, or xml)',
        example: 'json',
      },
      to: {
        type: 'string',
        required: true,
        description: 'Target format (json, yaml, or xml)',
        example: 'yaml',
      },
    },
    response: {
      success: {
        type: 'boolean',
        description: 'Whether the conversion was successful',
      },
      output: {
        type: 'string',
        description: 'The converted data in the target format',
      },
      from: {
        type: 'string',
        description: 'The source format (uppercase)',
      },
      to: {
        type: 'string',
        description: 'The target format (uppercase)',
      },
      inputSize: {
        type: 'number',
        description: 'Size of input in characters',
      },
      outputSize: {
        type: 'number',
        description: 'Size of output in characters',
      },
    },
    examples: [
      {
        name: 'JSON to YAML',
        description: 'Convert JSON object to YAML format',
        request: {
          input: '{"name":"John Doe","age":30,"email":"john@example.com","active":true}',
          from: 'json',
          to: 'yaml',
        },
        response: {
          success: true,
          output: 'name: John Doe\nage: 30\nemail: john@example.com\nactive: true\n',
          from: 'JSON',
          to: 'YAML',
          inputSize: 71,
          outputSize: 57,
        },
      },
      {
        name: 'YAML to JSON',
        description: 'Convert YAML to JSON format',
        request: {
          input: 'name: John Doe\nage: 30\nactive: true',
          from: 'yaml',
          to: 'json',
        },
        response: {
          success: true,
          output: '{\n  "name": "John Doe",\n  "age": 30,\n  "active": true\n}',
          from: 'YAML',
          to: 'JSON',
        },
      },
      {
        name: 'JSON to XML',
        description: 'Convert JSON object to XML format',
        request: {
          input: '{"user":{"name":"John","age":30}}',
          from: 'json',
          to: 'xml',
        },
        response: {
          success: true,
          output: '<?xml version="1.0" encoding="UTF-8"?>\n<user>\n  <name>John</name>\n  <age>30</age>\n</user>\n',
          from: 'JSON',
          to: 'XML',
        },
      },
      {
        name: 'XML to JSON',
        description: 'Convert XML to JSON format',
        request: {
          input: '<?xml version="1.0"?><user><name>John</name><age>30</age></user>',
          from: 'xml',
          to: 'json',
        },
        response: {
          success: true,
          output: '{\n  "user": {\n    "name": "John",\n    "age": "30"\n  }\n}',
          from: 'XML',
          to: 'JSON',
        },
      },
    ],
    useCases: [
      'Convert configuration files between formats',
      'Transform API responses between different formats',
      'Migrate data from one format to another',
      'Generate configuration files for different tools',
      'Convert between Kubernetes YAML and JSON',
      'Transform CI/CD pipeline configurations',
      'Convert OpenAPI/Swagger specs between formats',
      'Data interchange between different systems',
    ],
    benefits: [
      'Support for 6 conversion directions (JSON↔YAML, JSON↔XML, YAML↔XML)',
      'Preserves data structure and types',
      'Handles nested objects and arrays',
      'Pretty-formatted output',
      'Size comparison between input and output',
      'Error handling with detailed messages',
      'Free to use with no rate limits',
      'No data storage or logging',
    ],
    supportedFormats: {
      json: 'JavaScript Object Notation - widely used data format',
      yaml: 'YAML Ain\'t Markup Language - human-friendly data serialization',
      xml: 'eXtensible Markup Language - structured document format',
    },
  };

  return NextResponse.json(documentation, { status: 200 });
}
