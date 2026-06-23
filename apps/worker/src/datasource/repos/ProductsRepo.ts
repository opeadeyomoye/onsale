import * as Effect from 'effect/Effect'
import { and, desc, eq, InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { prices, products } from '@/schema'
import { EditProductInput } from '@/validation/validation'
import { DatabaseTag } from '@/datasource/Database'

export default class ProductsRepoTag extends Effect.Service<ProductsRepoTag>()(
  '@/app/datasource/repos/ProductsRepo',
  {
    dependencies: [DatabaseTag.Default],
    effect: Effect.gen(function* () {
      const db = yield* DatabaseTag
      return new ProductsRepo(db)
    })
  }
) {}

type SelectProductType = InferSelectModel<typeof products>
type InsertProductType = InferInsertModel<typeof products>
type InsertPricesType = InferInsertModel<typeof prices>
type UpdatePricesType = {
  productId: number
  storeId: number
  input: NonNullable<EditProductInput['prices']>
}

interface UpdateProductType
  extends Omit<Partial<InsertProductType>, 'id' | 'storeId'> {}
type OptionalFindByColumns = Partial<Pick<SelectProductType, 'id' | 'slug'>>
interface FindByArgs extends OptionalFindByColumns {
  storeId: number
}

class ProductsRepo {
  constructor(protected database: DatabaseTag) {}

  exists({ id, storeId, slug }: FindByArgs) {
    const columns = products._.columns
    const where = [eq(columns.storeId, storeId)]
    if (id) {
      where.push(eq(columns.id, id))
    }
    if (slug) {
      where.push(eq(columns.slug, slug))
    }
    return this.database.wrap(db =>
      db.query.products
        .findFirst({ where: () => and(...where) })
        .then(record => (record ? true : false))
    )
  }

  add(input: InsertProductType) {
    return this.database.wrap(db => db.insert(products).values(input).returning())
  }

  update({ id, input }: { id: number; input: UpdateProductType }) {
    return this.database.wrap(db =>
      db.update(products).set(input).where(eq(products.id, id)).returning()
    )
  }

  addPrices(input: InsertPricesType[]) {
    return this.database.wrap(db => db.insert(prices).values(input).returning())
  }

  updatePrices({ productId, storeId, input }: UpdatePricesType) {
    return this.database.wrap(async db => {
      await db.delete(prices).where(eq(prices.productId, productId))

      return await db
        .insert(prices)
        .values(
          input.map(price => ({
            productId,
            storeId: storeId,
            currency: price.currency,
            model: price.model,
            amount: Math.round(price.amount),
            amount_decimal: `${price.amount / 100}`,
            quantity: price.quantity || null
          }))
        )
        .returning()
    })
  }

  findById({ id, storeId }: { id: number; storeId?: number }) {
    return this.database.wrap(db =>
      db.query.products.findFirst({
        where: product => eq(product.id, id),
        with: {
          prices: true
        }
      })
    )
  }

  listForStore(storeId: number) {
    return this.database.wrap(db =>
      db.query.products.findMany({
        where: products => eq(products.storeId, storeId),
        orderBy: products => desc(products.createdAt),
        with: {
          prices: true
        }
      })
    )
  }
}
