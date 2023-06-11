import { Disputant } from 'src/dispute/dispute.interface';
import { ServiceRequest } from 'src/entities/service-request.entity';
import { User } from 'src/entities/user.entity';

export function raiseDispute({
  serviceProvider,
  serviceRequest,
  client,
  disputant,
  disputeReason,
}: {
  serviceProvider: User;
  serviceRequest: ServiceRequest;
  client: User;
  disputant: Disputant;
  disputeReason: string;
}) {
  const clientName = 'RunX';
  const isClient = disputant === Disputant.CLIENT;
  const emailMessage = {
    from: `runX <noreply@runx.com>`,
    to: `${isClient ? serviceProvider.email : client.email}`,
    subject: `RUNX - Service Request Dispute`,
    html: `    
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>Service request Dispute</title>
              </head>
              <body>
                <h2>Hi ${
                  isClient ? serviceProvider.first_name : client.first_name
                },</h2>
                <p>dispute has been rasied on Service request - <strong>${
                  serviceRequest.description
                }
                </strong> by ${
                  isClient ? client.first_name : serviceProvider.first_name
                }</p> due to the following reason <strong>${disputeReason}</strong>
                <p>If you have any concern, please do not hesitate to reach out to us at dispute@runx.com within 48 hours otherwise RUNX
                
                will automatically resolve dispute in favour of disputant</p>
                <br>
                <p>Best regards,</p>
                <p>${clientName} Team</p>  
              </body>
            </html>
	
    `,
  };
  return emailMessage;
}
