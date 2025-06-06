import { Context } from 'hono'
import { AddProductInput } from '../validation/validation'
import { prices, products } from '../schema'
import { randomString, slugify } from '../util/string'
import { tryCatch } from '../util/tryCatch'

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
    slug = `${slug}-${randomString(8)}`
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
