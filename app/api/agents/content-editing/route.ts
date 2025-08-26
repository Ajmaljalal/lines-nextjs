import { NextRequest, NextResponse } from 'next/server';
import { ChatAgentRequestSchema } from '@/lib/schemas';
import { AgentFactory } from '@/server/agents/base/agent-factory';
import { serverErrorHandler } from '@/server/utils/error-handler';
import { logger } from '@/server/utils/logger';
import { withAuth } from '@/lib/auth-middleware';

async function contentEditingHandler(req: NextRequest) {
  const requestLogger = logger.withRequest(req);

  try {
    // Validate request body
    const body = await req.json();
    const validatedData = ChatAgentRequestSchema.parse(body);

    requestLogger.info('Content editing agent request received', {
      hasMessage: !!validatedData.message,
      dataKeys: Object.keys(validatedData.context.data)
    });

    // Create and execute content editing agent
    const agent = AgentFactory.createAgent('content-editing', validatedData.context);

    const result = await agent.execute({
      data: validatedData.context.data,
      messages: [{ role: 'user', content: validatedData.message }],
      brandTheme: validatedData.brandTheme,
      userInput: validatedData.message
    });

    requestLogger.info('Content editing agent completed successfully');

    return NextResponse.json({
      content: result.content,
      metadata: result.metadata,
      error: result.error
    });
  } catch (error) {
    return serverErrorHandler(error, { endpoint: 'POST /api/agents/content-editing' });
  }
}

export const POST = withAuth(contentEditingHandler);
