import { Context } from 'hono'
import type {
  AddProductImageInput,
  AddProductImageParam,
  AddProductInput,
  EditProductInput
} from '../validation/validation'
import { prices, products } from '../schema'
import { randomString, slugify } from '../util/string'
import { tryCatch } from '../util/tryCatch'
import { eq, InferSelectModel } from 'drizzle-orm'

export async function getProduct(c: Context<AppEnv>, productId: number) {
  const db = c.get('db')
  const store = c.get('store')

  const product = await db.query.products.findFirst({
    where: (product, { eq, and }) => and(
      eq(product.id, productId),
      eq(product.storeId, store.id)
    ),
    with: {
      prices: true,
    },
  })

  if (!product) {
    return c.json({ message: 'Product not found' }, 404)
  }

  return c.json(product, 200)
}

export async function addProduct(c: Context<AppEnv>, input: AddProductInput) {
  const db = c.get('db')
  const store = c.get('store')

  // store pricing, product in db.
  // that's it
  let slug = slugify(input.name)
  const existing = await db.query.products.findFirst({
    where: (product, { eq, and }) => and(
      eq(product.storeId, store.id),
      eq(product.slug, slug)
    ),
  })
  if (existing) {
    slug = `${slug}-${Number(Date.now()).toString(36)}`
  }
  const { data, error } = await tryCatch((async () => {
    const { prices: pricesInput, ...partialProduct } = input
    const [product] = await db.insert(products).values({
      ...partialProduct, // todo: limit categoryId to store's owned categories
      storeId: store.id,
      slug,
    })
      .returning()

    await db.insert(prices).values(
      pricesInput.map(price => ({
        productId: product.id,
        storeId: store.id,
        currency: price.currency,
        model: price.model,
        amount: Math.round(price.amount),
        amount_decimal: `${price.amount / 100}`,
        quantity: price.quantity || null,
      }))
    )
    return product
  })())
  if (error) {

    return c.json({ message: 'Failed to add product' }, 500)
  }

  return c.json({ message: 'Product added successfully', data }, 201)
}

export async function editProduct(
  c: Context<AppEnv>,
  input: EditProductInput,
  productId: number
) {
  const db = c.get('db')
  const store = c.get('store')

  const product = await db.query.products.findFirst({
    where: (product, { eq, and }) => and(
      eq(product.id, productId),
      eq(product.storeId, store.id)
    ),
  })

  if (!product) {
    return c.json({ message: 'Product not found' }, 404)
  }
  const badPrice = input.prices?.find(price => price.model !== product.pricingModel)
  if (badPrice) {
    return c.json({
      message: `One or more of the prices uses a model that conflicts with the product's.`
    }, 400)
  }

  const { data, error } = await tryCatch((async () => {
    const { prices: pricesInput, ...partialProduct } = input
    const [updated] = await db
      .update(products)
      .set({
        ...partialProduct,
      })
      .where(eq(products.id, productId))
      .returning()

    let newPrices = <InferSelectModel<typeof prices>[]>[]
    if (pricesInput && pricesInput.length > 0) {
      await db.delete(prices).where(eq(prices.productId, productId))
      newPrices = await db.insert(prices).values(
        pricesInput.map(price => ({
          productId: updated.id,
          storeId: store.id,
          currency: price.currency,
          model: price.model,
          amount: Math.round(price.amount),
          amount_decimal: `${price.amount / 100}`,
          quantity: price.quantity || null,
        }))
      ).returning()
    }
    return { ...updated, prices: newPrices }
  })())

  if (error) {
    return c.json({ message: 'Failed to update product' }, 500)
  }

  return c.json({ message: 'Product updated successfully', data }, 200)
}


export async function addProductImage(
  c: Context<AppEnv>,
  { image }: AddProductImageInput,
  { id: productId, colorId }: AddProductImageParam
) {
  const db = c.get('db')
  const store = c.get('store')

  const product = await db.query.products.findFirst({
    where: (product, { eq, and }) => and(
      eq(product.id, productId),
      eq(product.storeId, store.id)
    ),
  })

  if (!product) {
    return c.json({ message: 'Product not found' }, 404)
  }
  const ext = image.type.split('/')[1]
  const imageKey = getImageKey({
    storeSlug: store.slug,
    productSlug: product.slug,
    colorId,
    ext
  })
  const { data: newObject, error } = await tryCatch(
    c.env.PRODUCT_MEDIA.put(imageKey, image)
  )
  if (error) {
    return c.json({ message: 'Failed to upload image' }, 500)
  }

  product.images = product.images || {}
  product.images[colorId] = product.images[colorId] || []
  product.images[colorId].push({ url: imageKey })

  const { data, error: dbError } = await tryCatch((async () => {
    const [updated] = await db
      .update(products)
      .set({ images: product.images })
      .where(eq(products.id, productId))
      .returning()

    return updated
  })())

  if (dbError) {
    return c.json({ message: 'Failed to update product with new image' }, 500)
  }

  return c.json({
    message: 'Image added successfully',
    data
  }, 201)
}

export async function preeProductImage(c: Context<AppEnv>, key: string) {
  const object = await c.env.PRODUCT_MEDIA.get(key)
  if (!object) {
    return c.json({ message: 'Image not found' }, 404)
  }
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)

  return c.newResponse(object.body, 200, Object.fromEntries(headers))
}

function getImageKey(
  { storeSlug, productSlug, colorId, ext }:
  { storeSlug: string, productSlug: string, colorId: string, ext?: string }
) {
  const colorPart = colorId === 'noColor' ? '' : `-in-${colorId}`
  const randomPart = `-${Number(Date.now()).toString(36)}-${randomString(8)}`
  const end = ext ? `.${ext}` : ''

  return`${storeSlug}-${productSlug}${colorPart}${randomPart}${end}`
}
