export function spRating({
  email,
  firstName,
  rating,
}: {
  email: string;
  firstName: string;
  rating: number;
}) {
  const clientName = 'RunX';
  const clientBaseUrl = 'localhost:5000';
  const emailMessage = {
    from: `runX <noreply@runx.com>`,
    to: `${email}`,
    subject: `Service Provider Rating`,
    html: `    
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Service Rating</title>
            </head>
            <body>
              <h3>Hi ${firstName}</h3>
              <p>You have been rated ${rating} out of 5 for the service you requested.</p>
              <p>Thank you!</p>
              <p>Sincerely,</p>
              <p>${clientName} Team</p>  
            </body>
          </html>
        `,
  };
  return emailMessage;
}
