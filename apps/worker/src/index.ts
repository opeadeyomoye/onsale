import { clerkMiddleware } from '@hono/clerk-auth'
import { zValidator } from '@hono/zod-validator'
import { Context, Hono } from 'hono'
import { cors } from 'hono/cors'
import z from 'zod'
import requireClerkAuth from './middleware/requireClerkAuth'
import { drizzle } from 'drizzle-orm/d1'
import * as dbSchema from './schema'
import * as storesHandler from './handlers/stores'

const app = new Hono<AppEnv>()
  .use(cors({
    origin: (origin, c: Context<AppEnv>) => {
      return (c.env.CORS_ORIGINS || '').split(',').includes(origin)
        ? origin
        : null
    },
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['get', 'post']
  }))
  .use(clerkMiddleware(), requireClerkAuth)
  .use(async (c, next) => {
    c.set('db', drizzle(c.env.DB, { schema: dbSchema }))
    await next()
  })
  .post(
    '/stores',
    zValidator('json', z.object({ name: z.string().min(4).max(256) })),
    async (c) => storesHandler.createStore(c, c.req.valid('json').name)
  )

export default app
export type AppType = typeof app
