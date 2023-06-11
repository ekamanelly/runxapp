import { ServiceRequest } from 'src/entities/service-request.entity';
import { User } from 'src/entities/user.entity';

export function resolveDispute({
  user,
  serviceRequest,
}: {
  user: User;
  serviceRequest: ServiceRequest;
}) {
  const clientName = 'RunX';
  const emailMessage = {
    from: `runX <noreply@runx.com>`,
    to: user.email,
    subject: `RUNX - Service Request Dispute Resolved`,
    html: `    
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>Service request Dispute</title>
              </head>
              <body>
                <h2>Hi  ${user.first_name},</h2>
                <p>dispute has been resolved on Service request - <strong>${serviceRequest.description}
                </strong>
                <br>
                <p>Best regards,</p>
                <p>${clientName} Team</p>  
              </body>
            </html>
	
    `,
  };
  return emailMessage;
}
