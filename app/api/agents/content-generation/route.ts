import { NextRequest, NextResponse } from 'next/server';
import { ContentGenerationRequestSchema } from '@/lib/schemas';
import { AgentFactory } from '@/server/agents/base/agent-factory';
import { serverErrorHandler } from '@/server/utils/error-handler';
import { logger } from '@/server/utils/logger';
import { withAuth } from '@/lib/auth-middleware';

async function contentGenerationHandler(req: NextRequest) {
  const requestLogger = logger.withRequest(req);

  try {
    // Validate request body
    const body = await req.json();
    const validatedData = ContentGenerationRequestSchema.parse(body);
    console.log('🔍 VALIDATED DATA', validatedData);

    requestLogger.info('Content generation agent request received', {
      topic: validatedData.data.topic,
      hasUserContent: !!validatedData.data.userProvidedContent,
      hasWebContent: !!validatedData.data.webSearchContent?.length,
      hasUrlContent: !!validatedData.data.urlsExtractedContent?.length
    });

    // Create and execute content generation agent
    const context = {
      messages: [],
      data: validatedData.data,
      brandTheme: validatedData.brandTheme
    };

    const agent = AgentFactory.createAgent('content-generation', context);

    const result = await agent.execute({
      data: validatedData.data,
      brandTheme: validatedData.brandTheme
    });

    requestLogger.info('Content generation completed successfully');

    return NextResponse.json({
      content: [result.content],
      error: result.error
    });
  } catch (error) {
    return serverErrorHandler(error, { endpoint: 'POST /api/agents/content-generation' });
  }
}

export const POST = withAuth(contentGenerationHandler);
