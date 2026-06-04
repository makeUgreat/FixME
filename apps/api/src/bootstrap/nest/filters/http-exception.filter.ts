import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { type PresentationHttpError } from '@layer-kernels/presentation';

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
    if (!(exception instanceof HttpException)) {
      return this.toInternalServerErrorResponse();
    }

    const response = exception.getResponse();

    if (this.isPresentationHttpError(response)) {
      return response;
    }

    return this.toHttpResponse(exception.getStatus());
  }

  private isPresentationHttpError(
    response: unknown,
  ): response is PresentationHttpError {
    if (!response || typeof response !== 'object') {
      return false;
    }

    const candidate = response as Partial<PresentationHttpError>;

    return (
      typeof candidate.statusCode === 'number' &&
      typeof candidate.code === 'string' &&
      typeof candidate.message === 'string'
    );
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
