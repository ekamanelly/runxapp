import { HttpException, HttpStatus, Controller } from '@nestjs/common';
import { AxiosError } from 'axios';
import { TypeORMError } from 'typeorm';
import { Server } from 'socket.io';

export class DatabaseException extends HttpException {
  constructor(error: Error, status?: HttpStatus) {
    super(
      {
        message: 'Database error',
        error: error.message,
        statusCode: status || HttpStatus.INTERNAL_SERVER_ERROR,
      },
      status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class AccessDeniedException extends HttpException {
  constructor(message?: string) {
    super(
      message || 'You do not have permission to access this resource.',
      HttpStatus.FORBIDDEN,
    );
  }
}
export class UserNotFoundException extends HttpException {
  constructor(message?: string) {
    super(message || 'User not found', HttpStatus.NOT_FOUND);
  }
}
export class InValidOTPException extends HttpException {
  constructor(message?: string) {
    super(
      message || 'Invalid or expired verification code try again later',
      HttpStatus.BAD_REQUEST,
    );
  }
}
export class InSufficientFundException extends HttpException {
  constructor(message?: string) {
    super(
      message ||
        'Insufficient balance fund wallet to continue with this transaction',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class CatchErrorException {
  constructor(error: Error) {
    if (error instanceof TypeORMError) {
      // Handle TypeORM error
      throw new DatabaseException(error);
    }
    if (error instanceof AxiosError) {
      throw new HttpException(
        {
          message: error.response.data.message,
          statusCode: error.response.status,
        },
        error.response.status,
      );
    } else {
      // Handle other error
      throw error;
    }
  }
}
