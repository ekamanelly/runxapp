export function requestTransactionPinResetMessage({
  email,
  firstName,
  token,
}: {
  email: string;
  firstName: string;
  token: string;
}) {
  const clientName = 'RunX';
  const emailMessage = {
    from: `runX <noreply@runx.com>`,
    to: `${email}`,
    subject: `Request Transaction Pin Reset`,
    html: `    
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Request Reset Transaction Pin</title>
    </head>
    <body>
      <p>Dear ${firstName},</p>
      <p>We have received a request to reset the transaction pin for your account.</p>
      <p>If you did not request this reset, please contact our customer support team immediately.</p>
      <br>
      <p>Please click the following link to reset your transaction pin:</p>
      <p><b>Token: ${token}</b></p>
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
