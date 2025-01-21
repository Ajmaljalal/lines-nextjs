import { NextResponse } from 'next/server';
import sgMail, { MailDataRequired } from '@sendgrid/mail';

if (!process.env.NEXT_PUBLIC_SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not set in environment variables');
}

const sendgridApiKey = process.env.NEXT_PUBLIC_SENDGRID_API_KEY.trim();

sgMail.setApiKey(sendgridApiKey);

export async function POST(request: Request) {
  try {
    const { subject, senderName, fromEmail, htmlContent, subscribers, replyToEmail } = await request.json();

    // Validate basic fields
    if (!subject || !senderName || !fromEmail || !htmlContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate subscribers array
    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      return NextResponse.json(
        { error: 'Missing subscribers' },
        { status: 400 }
      );
    }

    // Build SendGrid message
    const msg: MailDataRequired = {
      to: subscribers.map(email => ({ email })),
      from: {
        email: fromEmail.endsWith('@sendlines.com') ? fromEmail : `${senderName.toLowerCase().replace(/\s+/g, '')}@sendlines.com`,
        name: senderName,
      },
      subject,
      html: htmlContent,
      text: 'Please enable HTML to view the message content.',
      replyTo: replyToEmail,
    };

    // Send email
    const [response] = await sgMail.sendMultiple(msg);

    return NextResponse.json({
      success: true,
      messageId: response?.headers?.['x-message-id'],
      statusCode: response?.statusCode,
      recipientCount: subscribers.length,
    });

  } catch (error: any) {
    console.error('SendGrid error details:', error);

    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error.response?.body?.errors || error.message,
      },
      { status: error.code === 415 ? 415 : 500 }
    );
  }
} 