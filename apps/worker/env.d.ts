type WorkerBindings = {
  CLERK_PUBLISHABLE_KEY: string
  CLERK_SECRET_KEY: string
  CORS_ORIGINS: string
  DB: D1Database
  PRODUCT_MEDIA: R2Bucket
  TELEGRAM_BOT_API_SECRET_TOKEN: string
  // AI: Ai
  TURSO_DATABASE_URL: string
  TURSO_AUTH_TOKEN: string
}

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type AppDatabaseSchema = typeof import('./src/schema')
interface AppDrizzle extends Prettify<import('drizzle-orm/d1').DrizzleD1Database<AppDatabaseSchema>> {
  $client: D1Database
}

declare namespace Cloudflare {
  interface Env extends WorkerBindings { }
}
declare module 'cloudflare:test' {
  interface ProvidedEnv extends WorkerBindings { }
}

interface AppEnv {
  Bindings: WorkerBindings
  Variables: {
    db: AppDrizzle
    store: import('drizzle-orm').InferModelFromColumns<
      AppDatabaseSchema['stores']['_']['columns']
    >
    mainLayer: import('effect/Layer').Layer<import('@/provider').AppRequirements>
  }
}
