import {
  ExceptionFilter,
  Catch,
  UnauthorizedException,
  ArgumentsHost,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class CustomAuthExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = 'Invalid login credentials';
    response.status(401).json({
      statusCode: 401,
      message: message,
    });
  }
}
