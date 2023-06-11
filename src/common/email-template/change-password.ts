export function passwordChanged({
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
    subject: `Password Changed Successfully`,
    html: `    
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="UTF-8">
                    <title>Password Changed Successfully</title>
                  </head>
                  <body>
                    <h2>Hi ${firstName},</h2>
                    <p>Your password has been changed successfully.</p>
                    <p>If you did not make this change, please contact our support team immediately.</p>
                    <p>Thank you for using ${clientName}.</p>  
                  </body>
                </html>
        
        `,
  };
  return emailMessage;
}
