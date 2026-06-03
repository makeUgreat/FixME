import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { type PresentationHttpError } from './error.base';
import { PresentationHttpException } from './http.exception';

type HttpResponse = {
  status(statusCode: number): {
    send(body: PresentationHttpError): unknown;
  };
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<HttpResponse>();
    const body = this.toResponse(exception);

    response.status(body.statusCode).send(body);
  }

  private toResponse(exception: unknown): PresentationHttpError {
    if (exception instanceof PresentationHttpException) {
      return exception.error;
    }

    if (!(exception instanceof HttpException)) {
      return this.toInternalServerErrorResponse();
    }

    return this.toHttpResponse(exception.getStatus());
  }

  private toHttpResponse(statusCode: number): PresentationHttpError {
    if (statusCode >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      return this.toInternalServerErrorResponse(statusCode);
    }

    return {
      statusCode,
      code: 'request_failed',
      message: 'Request failed',
    };
  }

  private toInternalServerErrorResponse(
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
  ): PresentationHttpError {
    return {
      statusCode,
      code: 'internal_server_error',
      message: 'Internal server error',
    };
  }
}
