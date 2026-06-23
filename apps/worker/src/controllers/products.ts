import type {
  AddProductImageInput,
  AddProductImageParam,
  AddProductInput,
  EditProductInput,
  ListProductsQuery
} from '@/validation/validation'
import { randomString } from '@/util/string'
import * as Effect from 'effect/Effect'
import * as Either from 'effect/Either'
import ProductsRepoTag from '@/datasource/repos/ProductsRepo'
import * as Schedule from 'effect/Schedule'
import { InventoryServiceTag } from '@/context/inventory/InventoryService'
import type { HonoContext } from '@/types'
import respond from '@/util/respond'

export function getProduct(c: HonoContext, productId: number) {
  const store = c.get('store')

  return Effect.gen(function* () {
    const repo = yield* ProductsRepoTag
    const result = yield* Effect.either(
      Effect.retry(
        repo.findById({
          id: productId,
          storeId: store.id
        }),
        { times: 2, schedule: Schedule.fixed('100 millis') }
      )
    )

    if (Either.isLeft(result)) {
      return respond.serverError(c, {
        message: 'Something went wrong. Please try again later'
      })
    }

    const product = result.right
    if (!product) {
      return respond.notFound(c, { message: 'Product not found' })
    }

    return c.json(product, 200)
  })
}

export function addProduct(c: HonoContext, input: AddProductInput) {
  const store = c.get('store')

  return Effect.gen(function* () {
    const inventoryService = yield* InventoryServiceTag
    const result = yield* Effect.either(
      inventoryService.addProduct({ storeId: store.id, input })
    )

    if (Either.isLeft(result)) {
      return respond.serverError(c, { message: 'Failed to add product' })
    }

    return respond.created(c, {
      message: 'Product added successfully',
      data: result.right
    })
  })
}

export function editProduct(
  c: HonoContext,
  input: EditProductInput,
  productId: number
) {
  const store = c.get('store')

  return Effect.gen(function* () {
    const inventoryService = yield* InventoryServiceTag
    const result = yield* Effect.either(
      inventoryService.editProduct({
        id: productId,
        input: {
          ...input,
          storeId: store.id
        }
      })
    )

    if (Either.isLeft(result)) {
      const { left } = result
      if (left._tag === 'ProductEditError') {
        if (left.reason === 'product_not_found') {
          return respond.notFound(c, { message: 'Product not found' })
        }
        if (left.reason === 'pricing_model_mismatch') {
          return respond.badRequest(c, {
            message: `One or more of the prices uses a model that conflicts with the product's.`
          })
        }
      }

      return respond.serverError(c, {
        message: 'Something went wrong. Please try again'
      })
    }

    return respond.success(c, {
      status: 202,
      message: 'Product updated successfully',
      data: result.right
    })
  })
}

export function listProducts(c: HonoContext, query: ListProductsQuery) {
  const store = c.get('store')

  return Effect.gen(function* () {
    const productsRepo = yield* ProductsRepoTag
    const list = yield* productsRepo.listForStore(store.id)

    return c.json({ data: list }, 200)
  })
}

export function addProductImage(
  c: HonoContext,
  { image }: AddProductImageInput,
  { id: productId, colorId }: AddProductImageParam
) {
  const store = c.get('store')

  return Effect.gen(function* () {
    const productsRepo = yield* ProductsRepoTag
    const product = yield* productsRepo.findById({ id: productId })

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

    const inventoryService = yield* InventoryServiceTag
    const result = yield* Effect.either(
      inventoryService.addProductImage({
        id: productId,
        bucket: c.env.PRODUCT_MEDIA,
        image,
        colorId,
        key: imageKey,
        product
      })
    )

    if (Either.isRight(result)) {
      return c.json(
        {
          message: 'Image added successfully',
          data: result.right[0]
        },
        201
      )
    }

    return c.json({ message: 'Failed to update product with new image' }, 500)
  })
}

export async function preeProductImage(c: HonoContext, key: string) {
  const object = await c.env.PRODUCT_MEDIA.get(key)
  if (!object) {
    return c.json({ message: 'Image not found' }, 404)
  }
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)

  return c.newResponse(object.body, 200, Object.fromEntries(headers))
}

function getImageKey({
  storeSlug,
  productSlug,
  colorId,
  ext
}: {
  storeSlug: string
  productSlug: string
  colorId: string
  ext?: string
}) {
  const colorPart = colorId === 'noColor' ? '' : `-in-${colorId}`
  const randomPart = `-${Number(Date.now()).toString(36)}-${randomString(8)}`
  const end = ext ? `.${ext}` : ''

  return `${storeSlug}-${productSlug}${colorPart}${randomPart}${end}`
}
