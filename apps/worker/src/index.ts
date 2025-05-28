import { clerkMiddleware } from '@hono/clerk-auth'
import { zValidator } from '@hono/zod-validator'
import { Context, Hono } from 'hono'
import { cors } from 'hono/cors'
import z from 'zod'
import requireClerkAuth from './middleware/requireClerkAuth'

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
  // .use(clerkMiddleware(), requireClerkAuth)
  .get('/onboarding', (c) => {
    return c.text('Hello onboarder!')
  })

export default app
export type AppType = typeof app
