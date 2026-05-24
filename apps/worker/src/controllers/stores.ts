import { stores } from '@/schema'
import { randomString, slugify } from '@/util/string'
import { HonoContext } from '@/types'
import * as Effect from 'effect/Effect'
import { DatabaseTag } from '@/datasource/Database'
import respond from '@/util/respond'

export const createStore = (c: HonoContext, name: string) => Effect.gen(function* () {
  const db = yield* DatabaseTag
  const userId = c.get('clerkAuth')?.userId
  if (!userId) {
    return respond.forbidden(c)
  }

  const exists = db.wrap(db => db.query.stores.findFirst({
    where: (stores, { eq }) => eq(stores.creatorId, userId)
  }))
  if (exists) {
    return respond.badRequest(c, { message: 'store already exists for user' })
  }

  name = name.trim()
  let slug = slugify(name)

  const slugExists = yield* db.wrap(db => db.query.stores.findFirst({
    where: (store, { eq }) => eq(store.slug, slug)
  }))
  if (slugExists) {
    slug = `${slug}${randomString(8)}`
  }

  const newStore = yield* db.wrap(db => db.insert(stores).values({
    creatorId: userId,
    name,
    slug,
  }))
  if (!newStore.rowsAffected) {
    return c.json({}, 500)
  }

  return c.json({ name, slug }, 201)
})
