import { clerkMiddleware } from '@hono/clerk-auth'
import { zValidator } from '@hono/zod-validator'
import { Context, Hono } from 'hono'
import { cors } from 'hono/cors'
import z from 'zod'
import * as productsHandler from '@/controllers/products'
import * as storesHandler from '@/controllers/stores'
import loadStoreMiddleware from '@/middleware/loadStore'
import requireClerkAuth from '@/middleware/requireClerkAuth'
import * as dbSchema from '@/schema'
import * as InputSchemas from '@/validation/validation'
import { rhe } from '@/provider'
import { InferSelectModel } from 'drizzle-orm'
import { HonoEnv } from '@/types'

// function to hook effect-context up with global services
// ^ runs in middleware before the request handlers

/* then handlers run one or more effects in their execution,
 - handling any propagated errors and returning a response at the end
 */

// oooorr have an AppProgramRunner that is factory-fitted with the required context,
// that takes an Effect.gen and runs it, catching any general errors

const app = new Hono<HonoEnv>()
  .use(cors({
    origin: (origin, c: Context<AppEnv>) => {
      return (c.env.CORS_ORIGINS || '').split(',').includes(origin)
        ? origin
        : null
    },
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PATCH']
  }))
  .get(
    '/product-media/:key',
    zValidator('param', z.object({ key: z.string() })),
    c => productsHandler.preeProductImage(c, c.req.valid('param').key)
  )
  .use(clerkMiddleware(), requireClerkAuth)
  .post(
    '/stores',
    zValidator('json', z.object({ name: z.string().min(4).max(256) })),
    c => rhe(c, storesHandler.createStore(c, c.req.valid('json').name))
  )
  .use(loadStoreMiddleware)
  .get('/session', c => {
    const { name, slug, id } = c.get('store')
    return c.json({
      store: { name, slug, id }
    })
  })
  .get(
    '/products/:id',
    zValidator('param', z.object({ id: z.coerce.number() })),
    c => rhe(c, productsHandler.getProduct(c, c.req.valid('param').id))
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

export default app

type Schema = {
  [K in keyof typeof dbSchema as K extends `${string}Relations`
    ? never
    : K]: (typeof dbSchema)[K]
}
export type SelectModel<T extends keyof Schema> = InferSelectModel<Schema[T]>
export type AppType = typeof app
