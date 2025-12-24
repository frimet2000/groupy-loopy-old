import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can run code analysis
    if (user.role !== 'admin') {
      return Response.json({ error: 'Only admins can analyze code' }, { status: 403 });
    }

    const { files } = await req.json();

    if (!files || !Array.isArray(files) || files.length === 0) {
      return Response.json({ error: 'No files provided for analysis' }, { status: 400 });
    }

    // Prepare code analysis prompt
    const filesContent = files.map(file => 
      `=== FILE: ${file.path} ===\n${file.content}\n`
    ).join('\n\n');

    const prompt = `Analyze the following code files for bugs, errors, and issues. Provide a detailed report.

${filesContent}

Please analyze each file and provide:
1. List of issues found (if any)
2. Severity level for each issue (critical/high/medium/low)
3. File name and approximate line number
4. Clear description of the problem
5. Suggested fix

Format your response as a JSON array of issues:
[
  {
    "file": "path/to/file.js",
    "line": 123,
    "severity": "high",
    "issue": "Description of the issue",
    "suggestion": "How to fix it"
  }
]

If no issues are found, return an empty array.`;

    // Use InvokeLLM integration to analyze the code
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          issues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                file: { type: "string" },
                line: { type: "number" },
                severity: { type: "string" },
                issue: { type: "string" },
                suggestion: { type: "string" }
              }
            }
          },
          summary: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      analysis: result,
      filesAnalyzed: files.length
    });

  } catch (error) {
    console.error('Code analysis error:', error);
    return Response.json({ 
      error: error.message || 'Failed to analyze code' 
    }, { status: 500 });
  }
});