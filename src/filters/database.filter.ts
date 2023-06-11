import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { DatabaseException } from 'src/exceptions';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    throw new DatabaseException(exception);
  }
}
