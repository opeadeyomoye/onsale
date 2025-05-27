import { clerkMiddleware } from '@hono/clerk-auth'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import requireClerkAuth from './middleware/requireClerkAuth'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.use(cors(/** todo: specify options */))
app.use(clerkMiddleware(), requireClerkAuth)
app.get('/onboarding', (c) => {
  return c.text('Hello onboarder!')
})

export default app
