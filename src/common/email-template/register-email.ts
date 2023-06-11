export function welcomeMessage({
  email,
  firstName,
  token,
}: {
  email: string;
  firstName: string;
  token: string;
}) {
  const clientName = 'RunX';
  const verificationLink = '';
  const emailMessage = {
    from: `runX <noreply@runx.com>`,
    to: `${email}`,
    subject: `Welcome to ${clientName}`,
    html: `    
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>Welcome to Our Site</title>
              </head>
              <body>
                <h2>Hi ${firstName},</h2>
                <p>Thank you for registering on our site!</p>
                <p>Please use the following token to activate your account:</p>
                <p><b>Token: ${token}</b></p>
                <p>If you have any questions, please do not hesitate to reach out to us at support@your-site.com</p>
                <br>
                <p>Best regards,</p>
                <p>${clientName} Team</p>  
              </body>
            </html>
	
    `,
  };
  return emailMessage;
}
