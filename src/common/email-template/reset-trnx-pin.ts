export function resetTransactionPinMessage({
  email,
  firstName,
}: {
  email: string;
  firstName: string;
}) {
  const clientName = 'RunX';
  const emailMessage = {
    from: `runX <noreply@runx.com>`,
    to: `${email}`,
    subject: `Reset Transaction Pin Success`,
    html: `    
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Transaction Pin Success</title>
    </head>
    <body>
      <p>Dear ${firstName},</p>
      <p>Your transaction pin has been successfully reset.</p>
      <p>If you did not reset your pin, please contact our customer support team immediately.</p>
      <br>
      <p>Thank you for choosing our service.</p>
      <p>Sincerely,</p>
      <p>${clientName} Team</p>
    </body>
    </html>
    `,
  };
  return emailMessage;
}
