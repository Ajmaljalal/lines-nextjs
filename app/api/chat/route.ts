import { NextResponse } from 'next/server';
import { ChatService } from '@/services/chatService';
import { EmailCreationStep } from '@/components/steps/StepsIndicator';

export async function POST(request: Request) {
  try {
    const { user_input, step, newsletter_data } = await request.json();

    if (!user_input || !step || !newsletter_data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const chatService = new ChatService(
      newsletter_data,
      step as EmailCreationStep
    );

    const response = await chatService.processMessage(user_input);

    return NextResponse.json({
      response: response.message,
      metadata: response.metadata
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error.message
      },
      { status: 500 }
    );
  }
} 