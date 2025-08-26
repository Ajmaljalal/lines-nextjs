import { NextRequest, NextResponse } from 'next/server';
import { UrlExtractionRequestSchema } from '@/lib/schemas';
import { TavilyServerService } from '@/server/services/tavily-service';
import { serverErrorHandler } from '@/server/utils/error-handler';
import { logger } from '@/server/utils/logger';
import { withAuth } from '@/lib/auth-middleware';

async function urlExtractionHandler(req: NextRequest) {
  const requestLogger = logger.withRequest(req);

  try {
    // Validate request body
    const body = await req.json();
    const validatedData = UrlExtractionRequestSchema.parse(body);

    requestLogger.info('URL extraction request received', {
      urlCount: validatedData.urls.length,
      urls: validatedData.urls
    });

    // Execute URL content extraction using Tavily
    const extractionResults = await TavilyServerService.extractContent(validatedData.urls);

    // Transform results to match our schema
    const results = extractionResults.results.map(result => ({
      url: result.url,
      title: undefined, // Tavily extract doesn't return titles
      raw_content: result.raw_content,
      status_code: 200
    }));

    // Log any failed extractions
    if (extractionResults.failed_results.length > 0) {
      requestLogger.warn('Some URL extractions failed', {
        failedUrls: extractionResults.failed_results.map(f => ({ url: f.url, error: f.error }))
      });
    }

    requestLogger.info('URL extraction completed successfully', {
      successCount: results.length,
      failedCount: extractionResults.failed_results.length,
      responseTime: extractionResults.response_time
    });

    return NextResponse.json({
      results,
      error: null
    });
  } catch (error) {
    return serverErrorHandler(error, { endpoint: 'POST /api/services/url-extraction' });
  }
}

export const POST = withAuth(urlExtractionHandler);
