import {
  BadRequestException,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
} from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PresentationHttpException } from '@contexts/corrections/presentation/http/http.exception';
import { type PresentationHttpError } from '@layer-kernels/presentation';
import { HttpExceptionFilter } from '../http-exception.filter';

function createHost() {
  const send = vi.fn();
  const status = vi.fn(() => ({ send }));
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
    }),
  };

  return {
    host: host as unknown as ArgumentsHost,
    send,
    status,
  };
}

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  it('presentation HTTP exception은 재조립하지 않고 그대로 응답한다', () => {
    const { host, send, status } = createHost();

    filter.catch(
      new PresentationHttpException({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        code: 'dependency_unavailable',
        message: 'Service temporarily unavailable',
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(send).toHaveBeenCalledWith({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      code: 'dependency_unavailable',
      message: 'Service temporarily unavailable',
    } satisfies PresentationHttpError);
  });

  it('non-custom HTTP exception 응답의 code/message/details를 신뢰하지 않는다', () => {
    const { host, send, status } = createHost();

    filter.catch(
      new BadRequestException({
        code: 'validation_failed',
        message: 'Sample is invalid',
        details: {
          fields: [
            {
              path: 'sample',
              messages: ['Sample cannot be empty'],
            },
          ],
        },
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(send).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      code: 'request_failed',
      message: 'Request failed',
    } satisfies PresentationHttpError);
  });

  it('ValidationPipe presentation HTTP exception의 details를 그대로 응답한다', () => {
    const { host, send, status } = createHost();

    filter.catch(
      new PresentationHttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'validation_failed',
        message: 'Request validation failed',
        details: {
          fields: [
            {
              path: 'originalText',
              messages: ['originalText should not be empty'],
            },
          ],
        },
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(send).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      code: 'validation_failed',
      message: 'Request validation failed',
      details: {
        fields: [
          {
            path: 'originalText',
            messages: ['originalText should not be empty'],
          },
        ],
      },
    } satisfies PresentationHttpError);
  });

  it('code 없는 Bad Request 응답을 request_failed로 변환한다', () => {
    const { host, send, status } = createHost();

    filter.catch(
      new BadRequestException([
        'originalText should not be empty',
        'correctedText should not be empty',
      ]),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(send).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      code: 'request_failed',
      message: 'Request failed',
    } satisfies PresentationHttpError);
  });

  it('code 없는 일반 4xx HTTP exception을 request_failed로 변환한다', () => {
    const { host, send, status } = createHost();

    filter.catch(
      new HttpException('Missing route', HttpStatus.NOT_FOUND),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(send).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      code: 'request_failed',
      message: 'Request failed',
    } satisfies PresentationHttpError);
  });

  it('plain Error를 internal_server_error로 변환한다', () => {
    const { host, send, status } = createHost();

    filter.catch(new Error('Database failed'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(send).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'internal_server_error',
      message: 'Internal server error',
    } satisfies PresentationHttpError);
  });

  it('unknown thrown value를 internal_server_error로 변환한다', () => {
    const { host, send, status } = createHost();

    filter.catch('unexpected', host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(send).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'internal_server_error',
      message: 'Internal server error',
    } satisfies PresentationHttpError);
  });
});
