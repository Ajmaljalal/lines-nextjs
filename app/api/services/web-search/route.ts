import { NextRequest, NextResponse } from 'next/server';
import { WebSearchRequestSchema } from '@/lib/schemas';
import { TavilyServerService } from '@/server/services/tavily-service';
import { serverErrorHandler } from '@/server/utils/error-handler';
import { logger } from '@/server/utils/logger';
import { withAuth } from '@/lib/auth-middleware';

async function webSearchHandler(req: NextRequest) {
  const requestLogger = logger.withRequest(req);

  try {
    // Validate request body
    const body = await req.json();
    const validatedData = WebSearchRequestSchema.parse(body);

    requestLogger.info('Web search request received', {
      query: validatedData.query,
      searchDepth: validatedData.searchDepth,
      maxResults: validatedData.maxResults
    });

    // Execute web search using Tavily
    const searchResults = await TavilyServerService.searchWeb(validatedData.query);

    // Transform results to match our schema
    const results = searchResults.results.slice(0, validatedData.maxResults).map(result => ({
      title: result.title,
      content: result.content,
      url: result.url,
      score: 1.0 // Tavily doesn't return scores, so we set a default
    }));

    requestLogger.info('Web search completed successfully', {
      resultCount: results.length,
      responseTime: searchResults.response_time
    });

    return NextResponse.json({
      results,
      answer: null, // Tavily response doesn't include direct answers in our current setup
      error: null
    });
  } catch (error) {
    return serverErrorHandler(error, { endpoint: 'POST /api/services/web-search' });
  }
}

export const POST = withAuth(webSearchHandler);
