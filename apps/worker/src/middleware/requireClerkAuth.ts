import { createMiddleware } from 'hono/factory'

export default createMiddleware(async (ctx, next) => {
  if (!ctx.get('clerkAuth')?.userId) {
    return ctx.json({ message: 'Unauthorized' }, 401)
  }

  await next()
})
