import { NextRequest, NextResponse } from 'next/server';
import { HtmlGenerationRequestSchema } from '@/lib/schemas';
import { AgentFactory } from '@/server/agents/base/agent-factory';
import { serverErrorHandler } from '@/server/utils/error-handler';
import { logger } from '@/server/utils/logger';
import { withAuth } from '@/lib/auth-middleware';

async function htmlGenerationHandler(req: NextRequest) {
  const requestLogger = logger.withRequest(req);

  try {
    // Validate request body
    const body = await req.json();
    const validatedData = HtmlGenerationRequestSchema.parse(body);

    requestLogger.info('HTML generation agent request received', {
      hasGeneratedContent: !!validatedData.data.generatedContent,
      dataKeys: Object.keys(validatedData.data)
    });

    // Create and execute HTML generation agent
    const context = {
      messages: [],
      data: validatedData.data,
      brandTheme: validatedData.brandTheme
    };

    const agent = AgentFactory.createAgent('html-generation', context);

    const result = await agent.execute({
      data: validatedData.data,
      brandTheme: validatedData.brandTheme
    });

    requestLogger.info('HTML generation completed successfully');

    return NextResponse.json({
      content: result.content,
      error: result.error
    });
  } catch (error) {
    return serverErrorHandler(error, { endpoint: 'POST /api/agents/html-generation' });
  }
}

export const POST = withAuth(htmlGenerationHandler);
