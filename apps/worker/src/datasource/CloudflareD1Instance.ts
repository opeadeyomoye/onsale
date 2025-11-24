import { DrizzleQueryError } from 'drizzle-orm/errors'
import * as Context from 'effect/Context'
import * as Data from 'effect/Data'
import * as Effect from 'effect/Effect'

export default class CloudflareD1InstanceTag extends Context.Tag(
  '@/app/datasource/CloudflareD1InstanceTag'
)<
  CloudflareD1InstanceTag,
  CloudflareD1Instance
>() {}

export interface CloudflareD1Instance extends AppDrizzle { }

type DatasourceErrorOptions =
  | {
    type: 'DrizzleQueryError'
    cause: DrizzleQueryError
  }
  | {
    type: 'unknown'
    cause: unknown
  }

export class DatasourceError extends Data.TaggedError('DatasourceError')<{
  type: 'DrizzleQueryError' | 'unknown'
  cause: DrizzleQueryError | unknown | undefined
}> {
  constructor(args: DatasourceErrorOptions) {
    super(args)
  }
}


export function wrappedD1Query<T>(operation: Promise<T>) {
  return Effect.tryPromise({
    try: () => operation,
    catch: (cause) => {
      const options = cause instanceof DrizzleQueryError
        ? { type: 'DrizzleQueryError', cause } as const
        : { type: 'unknown', cause } as const

      return new DatasourceError(options)
    },
  })
}

export function wrappedD1Operation<T>(operation: () => Promise<T>) {
  return Effect.tryPromise({
    try: () => operation(),
    catch: (cause) => {
      const options = cause instanceof DrizzleQueryError
        ? { type: 'DrizzleQueryError', cause } as const
        : { type: 'unknown', cause } as const

      return new DatasourceError(options)
    },
  })
}