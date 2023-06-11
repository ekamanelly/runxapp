import { sendProposal } from './send-proposal';
import { acceptProposal } from './accept-proposal';
import { completeProposal } from './complete-proposal';
import { startProposal } from './start-proposal';
import { raiseDispute } from './raise-dispute';
import { transactionUpdate } from './transaction-update';
import { resolveDispute } from './resolve-dispute';
import { fundReleasedByClient } from './fund-relased-by-client';
import { passwordChanged } from './change-password';
import { transactionPinChanged } from './change-transaction-pin';
import { cancelledProposal } from './cancelled-proposal';
import { clientRating } from './client-rating';
import { spRating } from './sp-rating';

export const EmailTemplate = {
  sendProposal,
  acceptProposal,
  completeProposal,
  startProposal,
  raiseDispute,
  transactionUpdate,
  resolveDispute,
  fundReleasedByClient,
  passwordChanged,
  transactionPinChanged,
  cancelledProposal,
  clientRating,
  spRating,
};
