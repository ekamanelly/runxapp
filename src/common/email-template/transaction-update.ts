import { TransactionType } from 'src/wallet/interfaces/transaction.interface';
import { User } from 'src/entities/user.entity';
import { normalizeEnum } from '../utils';

export function transactionUpdate({
  user,
  transactionType,
  amount,
}: {
  user: User;
  transactionType: TransactionType;
  amount: number;
}) {
  const clientName = 'RunX';
  const normTnxType = normalizeEnum(transactionType);
  const emailMessage = {
    from: `runX <noreply@runx.com>`,
    to: user.email,
    subject: `RUNX - ${normTnxType} Transaction`,
    html: `    
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>Service request Dispute</title>
              </head>
              <body>
                <h2>Hi ${user.first_name},</h2>
                <p>there is ${normTnxType} of ${amount} on your wallet</p>
                <p>Best regards,</p>
                <p>${clientName} Team</p>  
              </body>
            </html>
	
    `,
  };
  return emailMessage;
}
