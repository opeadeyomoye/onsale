import * as dbSchema from '@/schema'
import { env } from 'cloudflare:workers'
import { DrizzleQueryError } from 'drizzle-orm/errors'
import { drizzle } from 'drizzle-orm/libsql/web'
import * as Effect from 'effect/Effect'
import * as Data from 'effect/Data'
import * as Schedule from 'effect/Schedule'

function db() {
  return drizzle({
    connection: {
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN
    },
    casing: 'snake_case',
    schema: dbSchema
  })
}
type DBClient = ReturnType<typeof db>

export class DatabaseTag extends Effect.Service<DatabaseTag>()(
  '@/app/datasource/DatabaseTag',
  {
    effect: Effect.gen(function* () {
      const client = yield* Effect.retry(
        Effect.try({
          try: () => db(),
          catch: e => new DatabaseConnectionFailedError({ cause: e })
        }),
        { times: 2, schedule: Schedule.exponential(100) }
      )

      return { wrap: wrappedDbOperation(client) }
    })
  }
) {}

type DatasourceErrorArgs = {
  type?: 'DrizzleQueryError' | 'unknown'
  message?: string
  cause: unknown
}

export class DatasourceError extends Data.TaggedError(
  'DatasourceError'
)<DatasourceErrorArgs> {
  constructor(args: DatasourceErrorArgs) {
    super({ type: 'unknown', ...args })
    this.message = args.message || 'A database error has occured'
  }
}

class DatabaseConnectionFailedError extends Data.TaggedError(
  '@/app/datasource/Database/DatabaseConnectionFailedError'
)<{ cause: unknown }> {}

type OperationOptions = {
  retry?: {
    schedule?: 'fixed' | 'exponential'
    times?: number
    baseDelay: number
  }
}

const defaultOptions = {
  retry: {
    schedule: 'exponential',
    times: 3,
    baseDelay: 50 // todo: randomize within reason
  }
} satisfies OperationOptions

function wrappedDbOperation<T>(client: DBClient) {
  return (
    operation: (db: DBClient) => Promise<T>,
    options?: OperationOptions
  ) => {
    const operationOptions = { ...defaultOptions, ...options }
    const { retry } = operationOptions
    const { baseDelay, times } = retry

    return Effect.retry(
      Effect.tryPromise({
        try: () => operation(client),
        catch: cause =>
          new DatasourceError({
            type: cause instanceof DrizzleQueryError ? 'DrizzleQueryError' : 'unknown',
            cause,
            message: `${String(cause)} - Failed after ${times} ${retry.schedule}-delay retries (base: ${baseDelay}ms)`
          })
      }),
      {
        schedule:
          retry.schedule === 'fixed'
            ? Schedule.fixed(baseDelay)
            : Schedule.exponential(baseDelay),
        while: error => (error.cause as { code: string }).code === 'SQLITE_BUSY',
        times
      }
    )
  }
}
