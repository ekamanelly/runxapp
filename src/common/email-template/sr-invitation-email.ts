import { ServiceRequest } from 'src/entities/service-request.entity';
import { User } from 'src/entities/user.entity';

export function serviceRequestInvitationEmailTemplate({
  email,
  firstName,
  serviceRequest,
  client,
}: {
  email: string;
  firstName: string;
  client: User;
  serviceRequest: ServiceRequest;
}) {
  const clientName = 'RunX';
  const emailMessage = {
    from: `runX <noreply@runx.com>`,
    to: `${email}`,
    subject: `Service Request Invitation`,
    html: `    
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>Service request invitation</title>
              </head>
              <body>
                <h2>Hi ${firstName},</h2>
                <p>You have been invited by ${client.last_name} to job posting ${serviceRequest.description}</p>
                <p>Please use the following token to activate your account:</p>
                <p><b></b></p>
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
