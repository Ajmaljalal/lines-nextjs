import { NextResponse } from 'next/server';
import sgMail, { MailDataRequired } from '@sendgrid/mail';

if (!process.env.NEXT_PUBLIC_SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not set in environment variables');
}

sgMail.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_API_KEY);

export async function POST(request: Request) {
  try {
    const { subject, fromEmail, recipients, htmlContent } = await request.json();

    // Validate required fields
    if (!subject || !fromEmail || !recipients || !htmlContent) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: {
            subject: !subject,
            fromEmail: !fromEmail,
            recipients: !recipients,
            htmlContent: !htmlContent
          }
        },
        { status: 400 }
      );
    }

    // Ensure recipients is always an array and contains valid email addresses
    const recipientsList = Array.isArray(recipients) ? recipients : [recipients];

    // Create the email message according to SendGrid's v3 API format
    const msg: MailDataRequired = {
      to: recipientsList.map(email => ({ email })),
      from: {
        email: process.env.SENDGRID_VERIFIED_SENDER || fromEmail,
      },
      subject: subject,
      html: htmlContent,
      text: 'Please enable HTML to view this email properly.',
    };

    console.log('Attempting to send email with configuration:', {
      to: recipientsList,
      from: msg.from,
      subject: subject,
    });

    const [response] = await sgMail.send(msg);

    console.log('SendGrid API Response:', {
      statusCode: response.statusCode,
      headers: response.headers,
    });

    return NextResponse.json({
      success: true,
      messageId: response.headers['x-message-id'],
      statusCode: response.statusCode,
    });

  } catch (error: any) {
    // Log the complete error object
    console.error('SendGrid error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.body,
      errors: error.response?.body?.errors,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error.response?.body?.errors || error.message,
        code: error.code || 'UNKNOWN_ERROR',
      },
      { status: error.code === 415 ? 415 : 500 }
    );
  }
} 