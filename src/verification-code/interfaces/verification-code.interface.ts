export interface GenerateCode {
  userId: string;
  type: VerificationCodeType;
  iden_type: IdentifierType;
  identifier: string;
}

export interface VerifyCode {
  userId?: string;
  code: string;
  type: VerificationCodeType;
  iden_type?: IdentifierType;
  identifier?: string;
}

export enum VerificationCodeType {
  'REQUEST_VERIFICATION' = 'REQUEST_VERIFICATION',
  'REQUEST_TRNX_PIN_RESET' = 'REQUEST_TRNX_PIN_RESET',
  'VERIFY_EMAIL' = 'VERIFY_EMAIL',
  'RESET_PASSWORD' = 'RESET_PASSWORD',
  'PHONE_NUMBER_VERIFICATION' = 'PHONE_NUMBER_VERIFICATION',
}

export enum IdentifierType {
  'EMAIL' = 'EMAIL',
  'PHONE_NUMBER' = 'PHONE_NUMBER',
}
