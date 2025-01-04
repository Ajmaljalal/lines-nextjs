import { NextResponse } from 'next/server';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { adminDb } from '@/config/firebase-admin';

if (!process.env.NEXT_PUBLIC_SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not set in environment variables');
}

sgMail.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_API_KEY);

interface SubscribersDoc {
  subscribers: string[];
  totalCount: number;
  updatedAt: string;
  userId: string;
}

export async function POST(request: Request) {
  try {
    const { subject, senderName, fromEmail, htmlContent, userId } = await request.json();

    // Validate required fields
    if (!subject || !senderName || !fromEmail || !htmlContent || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch subscribers from Firebase using admin SDK
    const subscribersDoc = await adminDb.collection('subscribers').doc(userId).get();

    if (!subscribersDoc.exists) {
      return NextResponse.json(
        { error: 'No subscribers found' },
        { status: 400 }
      );
    }

    const subscribersData = subscribersDoc.data() as SubscribersDoc;
    const subscribers = subscribersData.subscribers;

    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No subscribers found' },
        { status: 400 }
      );
    }

    // Convert HTML content to Buffer and back to ensure proper encoding
    // const encodedHtml = Buffer.from(htmlContent).toString('utf8');

    const recipientsList = Array.isArray(subscribers) ? subscribers : [subscribers];

    const msg: MailDataRequired = {
      to: recipientsList.map((email: string) => ({ email })),
      from: {
        email: process.env.SENDGRID_VERIFIED_SENDER || fromEmail,
        name: senderName,
      },
      subject: subject,
      html: htmlContent,
      text: 'Please enable HTML to view this email properly.',
    };

    const [response] = await sgMail.sendMultiple(msg);

    return NextResponse.json({
      success: true,
      messageId: response.headers['x-message-id'],
      statusCode: response.statusCode,
      recipientCount: recipientsList.length
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