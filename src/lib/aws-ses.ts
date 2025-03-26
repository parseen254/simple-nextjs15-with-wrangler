import { render } from '@react-email/render';
import OtpEmail from '@/emails/otp-email';
import { saveDevMessage } from '@/app/dev/actions';

// Explicitly set to use Node.js runtime, not Edge
export const runtime = 'nodejs'

type OtpEmailProps = Parameters<typeof OtpEmail>[0];

export async function sendEmail({
  to,
  subject,
  props
}: {
  to: string;
  subject: string;
  props: OtpEmailProps;
}) {
  const emailHtml = await render(OtpEmail(props));

  // In development, intercept emails and save to dev messages
  // if (process.env.NODE_ENV === 'development') {
    await saveDevMessage({
      to,
      subject,
      content: emailHtml,
      type: 'email',
      metadata: { props } // Store original props for potential debugging
    });
    return true;
  // }

  // In production, send actual email via AWS SES
  // const params = {
  //   Source: process.env.AWS_SES_FROM_EMAIL,
  //   Destination: {
  //     ToAddresses: [to],
  //   },
  //   Message: {
  //     Subject: {
  //       Data: subject,
  //     },
  //     Body: {
  //       Html: {
  //         Data: emailHtml,
  //       },
  //     },
  //   },
  // };

  // try {
  //   const command = new SendEmailCommand(params);
  //   await ses.send(command);
  //   return true;
  // } catch (error) {
  //   console.error("Error sending email:", error);
  //   throw error;
  // }
}