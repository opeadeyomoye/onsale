import type { HonoContext } from '@/types'
import type {
  ClientErrorStatusCode,
  ServerErrorStatusCode,
  SuccessStatusCode
} from 'hono/utils/http-status'

type ResponseInput<U> = {
  status?: U
  message?: string
}
interface SuccessResponse<T, U> extends ResponseInput<U> {
  data: T
}
interface ErrorResponse<T, U> extends ResponseInput<U> {
  errors?: T
}

export default {
  success: <T, U extends Exclude<SuccessStatusCode, 204 | 205> = 200>(
    c: HonoContext,
    input: SuccessResponse<T, U>
  ) => {
    const { data, status } = input
    return c.json(
      {
        status: 'ok' as const,
        data
      },
      status
    )
  },

  created: <T>(c: HonoContext, input: SuccessResponse<T, 201>) => {
    const { data } = input
    return c.json({ status: 'ok' as const, data }, 201)
  },

  badRequest: <T, U extends ClientErrorStatusCode>(
    c: HonoContext,
    input: ErrorResponse<T, U>
  ) => {
    const { errors, status, message } = input
    return c.json(
      {
        status: 'Bad request' as const,
        message: message || 'Check your request parameters',
        errors
      },
      status || 400
    )
  },

  serverError: <T, U extends ServerErrorStatusCode>(
    c: HonoContext,
    input: ErrorResponse<T, U>
  ) => {
    const { errors, status, message } = input
    return c.json(
      {
        status: 'failed' as const,
        message:
          message ||
          'There was a problem fulfilling your request. Please try again later.',
        errors
      },
      status || 500
    )
  },

  notFound: <T>(c: HonoContext, input?: Omit<ErrorResponse<T, 404>, 'status'>) => {
    const { errors, message } = input || {}
    return c.json(
      {
        status: 'Not found' as const,
        message: message || 'The requested resource was not found',
        errors
      },
      404
    )
  },

  forbidden: <T>(c: HonoContext, input?: Omit<ErrorResponse<T, 403>, 'status'>) => {
    const { errors, message } = input || {}
    return c.json(
      {
        status: 'Forbidden' as const,
        message: message || 'You do not have permission to access this resource',
        errors
      },
      403
    )
  }
}
