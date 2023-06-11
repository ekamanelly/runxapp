import { ServiceRequest } from 'src/entities/service-request.entity';
import { ActionCreator } from '../interface';

export function cancelledProposal({
  email,
  firstName,
  serviceRequest,
  cancelReason,
  actionCreator,
}: {
  email: string;
  firstName: string;
  serviceRequest: ServiceRequest;
  cancelReason: string;
  actionCreator: ActionCreator;
}) {
  const clientName = 'RunX';
  const emailMessage = {
    from: `runX <noreply@runx.com>`,
    to: `${email}`,
    subject: `${
      actionCreator === ActionCreator.CLIENT ? 'CLEINT' : 'SERVICE PROVIDER'
    } CANCELLED SERVICE REQUEST`,
    html: `    
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>Service request Proposal</title>
              </head>
              <body>
                <h2>Hi ${firstName},</h2>
                <p>${
                  actionCreator === ActionCreator.CLIENT
                    ? 'Client'
                    : 'Service provider'
                } have cancelled service request due to ${cancelReason}</p>
                <p>Best regards, for <strong>${
                  serviceRequest.description
                }</strong></p>
                <p>${clientName} Team</p>  
              </body>
            </html>
	
    `,
  };
  return emailMessage;
}
