export enum Gender {
  'MALE' = 'MALE',
  'FEMALE' = 'FEMALE',
}

export interface UpdatePassword {
  email: string;
  password: string;
}

export enum UserRoles {
  'CLIENT' = 'CLIENT',
  'SERVICE_PROVIDER' = 'SERVICE_PROVIDER',
  'ADMIN' = 'ADMIN',
}
