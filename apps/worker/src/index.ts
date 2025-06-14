import { clerkMiddleware } from '@hono/clerk-auth'
import { zValidator } from '@hono/zod-validator'
import { Context, Hono } from 'hono'
import { cors } from 'hono/cors'
import z from 'zod'
import { drizzle } from 'drizzle-orm/d1'
import * as productsHandler from './handlers/products'
import * as storesHandler from './handlers/stores'
import requireClerkAuth from './middleware/requireClerkAuth'
import * as dbSchema from './schema'
import * as InputSchemas from './validation/validation'

const app = new Hono<AppEnv>()
  .use(cors({
    origin: (origin, c: Context<AppEnv>) => {
      return (c.env.CORS_ORIGINS || '').split(',').includes(origin)
        ? origin
        : null
    },
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PATCH']
  }))
  .use(clerkMiddleware(), requireClerkAuth)
  .use(async (c, next) => {
    c.set('db', drizzle(c.env.DB, {
      schema: dbSchema,
      casing: 'snake_case'
    }))
    await next()
  })
  .post(
    '/stores',
    zValidator('json', z.object({ name: z.string().min(4).max(256) })),
    c => storesHandler.createStore(c, c.req.valid('json').name)
  )
  .use(async (c, next) => {
    const store = await c.get('db').query.stores.findFirst({
      where: (store, { eq }) => eq(store.creatorId, c.get('clerkAuth')?.userId || '')
    })
    if (!store) {
      return c.json({ message: 'Unknown store' }, 404)
    }
    c.set('store', store)
    await next()
  })
  .get('/session', c => {
    const { name, slug, id } = c.get('store')
    return c.json({
      store: { name, slug, id }
    })
  })
  .get(
    '/products/:id',
    zValidator('param', z.object({ id: z.coerce.number() })),
    c => productsHandler.getProduct(c, c.req.valid('param').id)
  )
  .get(
    '/products',
    zValidator('query', InputSchemas.ListProductsQuerySchema),
    c => productsHandler.listProducts(c, c.req.valid('query'))
  )
  .post(
    '/products',
    zValidator('json', InputSchemas.AddProductSchema),
    c => productsHandler.addProduct(c, c.req.valid('json')),
  )
  .patch(
    '/products/:id',
    zValidator('param', InputSchemas.EditProductSchema.param),
    zValidator('json', InputSchemas.EditProductSchema.form()),
    c => productsHandler.editProduct(c, c.req.valid('json'), c.req.valid('param').id)
  )
  .post(
    '/products/:id/images/:colorId',
    zValidator('param', InputSchemas.AddProductImageSchema.param),
    zValidator('form', InputSchemas.AddProductImageSchema.form),
    c => productsHandler.addProductImage(c, c.req.valid('form'), c.req.valid('param'))
  )
  .get(
    '/product-media/:key',
    zValidator('param', z.object({ key: z.string() })),
    c => productsHandler.preeProductImage(c, c.req.valid('param').key)
  )

export default app

type DbSchemaKey = keyof typeof dbSchema
type DbSchemaTableKey<T = DbSchemaKey> = T extends `${infer N}Relations` ? never : T
export type AppType = typeof app
export type EntityType<T extends DbSchemaTableKey> = (typeof dbSchema)[T]['$inferSelect']
