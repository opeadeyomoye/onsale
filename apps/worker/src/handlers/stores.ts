import { type Context } from 'hono'
import { stores } from '../schema'
import { randomString, slugify } from '../util/string'

export async function createStore(c: Context<AppEnv>, name: string) {
  const db = c.get('db')
  const userId = <string>c.get('clerkAuth')?.userId
  const exists = await db.query.stores.findFirst({
    where: (stores, { eq }) => eq(stores.creatorId, userId)
  })
  if (exists) {
    return c.json({ message: 'store already exists for user' }, 400)
  }

  name = name.trim()
  let slug = slugify(name)

  const slugExists = await db.query.stores.findFirst({
    where: (store, { eq }) => eq(store.slug, slug)
  })
  if (slugExists) {
    slug = `${slug}${randomString(8)}`
  }

  const newStore = await db.insert(stores).values({
    creatorId: userId,
    name,
    slug,
  })
  if (!newStore.success) {
    return c.json({}, 500)
  }

  return c.json({ name, slug }, 201)
}
