import { NextResponse } from 'next/server';
import sgMail, { MailDataRequired } from '@sendgrid/mail';

if (!process.env.NEXT_PUBLIC_SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not set in environment variables');
}

sgMail.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_API_KEY);

export async function POST(request: Request) {
  try {
    const { subject, fromEmail, recipients, htmlContent, senderName } = await request.json();
    // Validate required fields
    if (!subject || !fromEmail || !recipients || !htmlContent || !senderName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert HTML content to Buffer and back to ensure proper encoding
    const encodedHtml = Buffer.from(htmlContent).toString('utf8');

    const recipientsList = Array.isArray(recipients) ? recipients : [recipients];

    const msg: MailDataRequired = {
      to: recipientsList.map(email => ({ email })),
      from: {
        email: process.env.SENDGRID_VERIFIED_SENDER || fromEmail,
        name: senderName,
      },
      subject: subject,
      html: encodedHtml,
      text: 'Please enable HTML to view this email properly.',
    };

    const [response] = await sgMail.sendMultiple(msg);

    return NextResponse.json({
      success: true,
      messageId: response.headers['x-message-id'],
      statusCode: response.statusCode,
    });

  } catch (error: any) {
    console.error('SendGrid error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.body,
      errors: error.response?.body?.errors,
    });

    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error.response?.body?.errors || error.message,
      },
      { status: error.code === 415 ? 415 : 500 }
    );
  }
} 