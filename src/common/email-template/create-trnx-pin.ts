export function createTransactionPinMessage({
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
    subject: `Your Transaction PIN Has Been Successfully Created`,
    html: `    
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Transaction PIN Has Been Successfully Created</title>
    </head>
    <body>
      <p>Dear ${firstName},</p>
      <p>We are pleased to inform you that your transaction PIN has been successfully created.</p>
      <p>With your new PIN, you can easily and securely make transactions on our platform.</p>
      <p>If you did not create this PIN, please contact our customer support team immediately.</p>
      <br>
      <p>Thank you for choosing ${clientName}. We are committed to providing you with the best possible service.</p>
      <br>
      <p>Sincerely,</p>
      <p>${clientName} Team</p>
    </body>
    </html>
    `,
  };
  return emailMessage;
}
