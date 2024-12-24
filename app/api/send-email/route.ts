import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_API_KEY!);

export async function POST(request: Request) {
  try {
    const { subject, fromEmail, recipients, htmlContent } = await request.json();

    if (!subject || !fromEmail || !recipients || !htmlContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const msg = {
      to: recipients,
      from: fromEmail,
      subject: subject,
      html: htmlContent,
    };

    await sgMail.send(msg);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SendGrid error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 