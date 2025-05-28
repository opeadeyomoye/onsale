
type WorkerBindings = {
  CLERK_PUBLISHABLE_KEY: string
  CLERK_SECRET_KEY: string
  CORS_ORIGINS: string
  // DB: D1Database
  // AI: Ai
}

type AppDatabaseSchema = typeof import('./src/schema')
interface AppEnv {
  Bindings: WorkerBindings
  Variables: {
    // db: import('drizzle-orm/d1').DrizzleD1Database<AppDatabaseSchema> & {
    //   $client: D1Database
    // }
  }
}

declare module 'cloudflare:test' {
  interface ProvidedEnv extends WorkerBindings { }
}
