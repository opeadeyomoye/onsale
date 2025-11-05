type WorkerBindings = {
  CLERK_PUBLISHABLE_KEY: string
  CLERK_SECRET_KEY: string
  CORS_ORIGINS: string
  DB: D1Database
  PRODUCT_MEDIA: R2Bucket
  // AI: Ai
}

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type AppDatabaseSchema = typeof import('./src/schema')
interface AppDrizzle extends Prettify<import('drizzle-orm/d1').DrizzleD1Database<AppDatabaseSchema>> {
  $client: D1Database
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

declare module 'cloudflare:test' {
  interface ProvidedEnv extends WorkerBindings { }
}
