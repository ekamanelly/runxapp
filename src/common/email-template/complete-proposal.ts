import { ServiceRequest } from 'src/entities/service-request.entity';
import { User } from 'src/entities/user.entity';

export function completeProposal({
  serviceProvider,
  serviceRequest,
  client,
}: {
  serviceProvider: User;
  serviceRequest: ServiceRequest;
  client: User;
}) {
  const clientName = 'RunX';
  const emailMessage = {
    from: `runX <noreply@runx.com>`,
    to: `${client.email}`,
    subject: `Service Request Completed - ${
      serviceRequest.service_types[0] ?? ''
    }`,
    html: `    
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>Service Request Completed</title>
              </head>
              <body>
                <h2>Hi ${client.first_name},</h2>
                <p>${serviceProvider.first_name} has marked your service request - <strong>${serviceRequest.description}
                </strong> as completed. Please log in to RunX to acknowledge and release funds.</p>
                <p>If you have any questions or concerns, please do not hesitate to reach out to us at support@runx.com.</p>
                <br>
                <p>Best regards,</p>
                <p>${clientName} Team</p>  
              </body>
            </html>
	
    `,
  };
  return emailMessage;
}
