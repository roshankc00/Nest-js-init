import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { Response } from 'express';

/**
 * Global Exception Filter to handle all unhandled exceptions in the application.
 * This filter catches all exceptions thrown by the application and returns a
 * structured error response to the client, while also logging the error details.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(GlobalExceptionFilter.name);
  /**
   * Catches exceptions and sends structured error responses to the client.
   *
   * @param {unknown} exception - The thrown exception that will be caught by this filter.
   * @param {ArgumentsHost} host - The host object that provides access to the request and response objects.
   * @returns {void}
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exceptionResponse;
    }
    this.logger.error({
      statusCode: status,
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });

    response.status(status).json({
      statusCode: status,
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
