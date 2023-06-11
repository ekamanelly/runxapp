import { ServiceRequest } from 'src/entities/service-request.entity';
import { User } from 'src/entities/user.entity';

export function startProposal({
  serviceRequest,
  user,
}: {
  serviceRequest: ServiceRequest;
  user: User;
}) {
  const clientName = 'RunX';
  const emailMessage = {
    from: `runX <noreply@runx.com>`,
    to: `${user.email}`,
    subject: `RUNX - Service Request Started`,
    html: `    
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>Service request Proposal</title>
              </head>
              <body>
                <h2>Hi ${user.first_name},</h2>
                <p>Service request - <strong>${serviceRequest.description}
                </strong> has been started</p>
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
