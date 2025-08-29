import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Command, MemorySaver } from '@langchain/langgraph';
import { withAuth } from '@/lib/auth-middleware';
import { serverErrorHandler } from '@/server/utils/error-handler';
import { buildMarketingEmailGraph } from '@/langgraph/graph';

const checkpointer = new MemorySaver();
const graph = buildMarketingEmailGraph();

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, threadId, resume } = body ?? {};

    const config = {
      configurable: {
        thread_id: threadId || uuidv4()
      }
    } as const;

    // Initial invoke or resume an interrupted node
    const result = resume !== undefined
      ? await graph.invoke(new Command({ resume }), config)
      : await graph.invoke(input || {}, config);

    // If there's an interrupt, surface it to the client to prompt the user
    const interrupt = (result as any)?.__interrupt__;
    if (interrupt) {
      return NextResponse.json({
        ok: true,
        threadId: config.configurable.thread_id,
        interrupt,
        state: result
      });
    }

    return NextResponse.json({
      ok: true,
      threadId: config.configurable.thread_id,
      state: result
    });
  } catch (error) {
    return serverErrorHandler(error, { endpoint: 'POST /api/agents/marketing-email' });
  }
}

export const POST = withAuth(handler);


