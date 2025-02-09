import { NextResponse } from 'next/server';
const client = require("@sendgrid/client");

if (!process.env.NEXT_PUBLIC_SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not set in environment variables');
}


client.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_API_KEY.trim());

export async function GET(request: Request) {
  try {
    // Get messageId from URL query parameters
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const req = {
      url: `/v3/messages/${messageId}`,
      method: 'GET' as const,
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SENDGRID_API_KEY?.trim()}`,
        'Content-Type': 'application/json'
      }
    };

    const [response, body] = await client.request(req);

    if (response.statusCode !== 200) {
      throw new Error('Failed to fetch email stats');
    }

    return NextResponse.json({
      success: true,
      data: body,
      statusCode: response.statusCode
    });

  } catch (error: any) {
    console.error('SendGrid stats error:', error);

    // More detailed error handling
    if (error.response?.body?.errors) {
      return NextResponse.json(
        {
          error: 'Failed to fetch email stats',
          details: error.response.body.errors
        },
        { status: error.response.statusCode || 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch email stats',
        details: error.message
      },
      { status: 500 }
    );
  }
}