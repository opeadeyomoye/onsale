import { DatabaseTag } from '@/datasource/Database'
import { rhe } from '@/provider'
import { HonoEnv } from '@/types'
import * as Effect from 'effect/Effect'
import { createMiddleware } from 'hono/factory'

export default createMiddleware<HonoEnv>(async (c, next) => {
  const store = await rhe(c, Effect.gen(function* () {
    const db = yield* DatabaseTag
    return yield* db.wrap(db => db.query.stores.findFirst({
      where: (store, { eq }) => eq(store.creatorId, c.get('clerkAuth')?.userId || '')
    }))
  }))

  if (!store) {
    return c.json({ message: 'Unknown store' }, 404)
  }
  c.set('store', store)

  await next()
})
