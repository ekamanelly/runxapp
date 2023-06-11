import { ServiceRequest } from 'src/entities/service-request.entity';
import { User } from 'src/entities/user.entity';

export function fundReleasedByClient({
  email,
  firstName,
  serviceRequest,
}: {
  email: string;
  firstName: string;
  serviceRequest: ServiceRequest;
  sp: User;
}) {
  const clientName = 'RunX';
  const emailMessage = {
    from: `runX <noreply@runx.com>`,
    to: `${email}`,
    subject: `FUND RELEASED BY CLIENT`,
    html: `    
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>Service request Proposal</title>
              </head>
              <body>
                <h2>Hi ${firstName},</h2>
             <p>Client have released your fund</p>
                <p>Best regards, for <strong>${serviceRequest.description}</strong></p>
                <p>${clientName} Team</p>  
              </body>
            </html>
	
    `,
  };
  return emailMessage;
}
