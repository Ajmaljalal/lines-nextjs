import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Request schema for URL extraction service
const requestSchema = z.object({
  urls: z.array(z.string().url('Invalid URL format')).min(1, 'At least one URL is required')
});

export async function POST(req: NextRequest) {
  try {
    // Validate request body
    const body = await req.json();
    const validatedData = requestSchema.parse(body);

    // TODO: Implement server-side URL content extraction using Tavily
    // For now, return a placeholder response
    return NextResponse.json({
      results: validatedData.urls.map(url => ({
        url,
        title: "Placeholder title",
        raw_content: "URL content extraction implementation will be moved here from TavilyService",
        status_code: 200
      })),
      error: null
    });
  } catch (error) {
    console.error('URL extraction service error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
