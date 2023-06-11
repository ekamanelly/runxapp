export enum WSMessageType {
  'NOT_AUTHORIZED' = 'NOT_AUTHORIZED',
  'NO_PROPOSAL_ID' = 'NO_PROPOSAL_ID',
  'NO_PROPOSAL' = 'NO_PROPOSAL',
  'NO_TOKEN' = 'NO_TOKEN',
  'MESSAGE_REQUIRED' = 'MESSAGE_REQUIRED',
  'CONNECTION_SUCCESSFUL' = 'CONNECTION_SUCCESSFUL',
  'UNAUTHORISED_PROPOSAL_CLIENT' = 'UNAUTHORISED_PROPOSAL_CLIENT',
  'UNAUTHORISED_PROPOSAL_SP' = 'UNAUTHORISED_PROPOSAL_SP',
}

export enum ChatMessageType {
  'TEXT' = 'TEXT',
  'INVOICE' = 'INVOICE',
}

export interface ChatProposal {
  id: string;
  client: {
    id: string;
  };
  sp: {
    id: string;
  };
}
