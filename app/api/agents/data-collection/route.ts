import { NextRequest, NextResponse } from 'next/server';
import { ChatAgentRequestSchema } from '@/lib/schemas';
import { AgentFactory } from '@/server/agents/base/agent-factory';
import { serverErrorHandler } from '@/server/utils/error-handler';
import { logger } from '@/server/utils/logger';
import { withAuth } from '@/lib/auth-middleware';

async function dataCollectionHandler(req: NextRequest) {
  const requestLogger = logger.withRequest(req);

  try {
    // Validate request body
    const body = await req.json();
    const validatedData = ChatAgentRequestSchema.parse(body);

    requestLogger.info('Data collection agent request received', {
      hasMessage: !!validatedData.message,
      dataKeys: Object.keys(validatedData.context.data)
    });

    // Create and execute data collection agent
    const agent = AgentFactory.createAgent('data-collection', validatedData.context);

    const result = await agent.execute({
      data: validatedData.context.data,
      messages: [{ role: 'user', content: validatedData.message }],
      brandTheme: validatedData.brandTheme
    });

    requestLogger.info('Data collection agent completed successfully');

    return NextResponse.json({
      content: result.content,
      metadata: result.metadata,
      error: result.error
    });
  } catch (error) {
    return serverErrorHandler(error, { endpoint: 'POST /api/agents/data-collection' });
  }
}

export const POST = withAuth(dataCollectionHandler);
