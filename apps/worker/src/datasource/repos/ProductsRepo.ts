import * as Effect from 'effect/Effect'
import CloudflareD1InstanceTag, { CloudflareD1Instance, DatasourceError, effectfulQuery, wrappedD1Query } from '../CloudflareD1Instance'
import { and, asc, desc, eq, InferSelectModel } from 'drizzle-orm'
import { products } from '@/schema'

export class ProductsRepoTag extends Effect.Service<ProductsRepoTag>()(
  '@/app/datasource/repos/ProductsRepo',
  {
    effect: Effect.gen(function* () {
      const db = yield* CloudflareD1InstanceTag
      return new ProductsRepo(db)
    })
  }
) {}

type SelectProductType = InferSelectModel<typeof products>
type OptionalFindByColumns = Partial<
  Pick<
    SelectProductType,
    'id' | 'slug'
  >
>
interface FindByArgs extends OptionalFindByColumns {
  storeId: number
}
type FindByOptions = Partial<{
  limit: number
  orderBy: Partial<
    Record<'id' | 'createdAt' | 'deletedAt' | 'updatedAt' | 'name', 'asc' | 'desc'>
  >
  include: ('prices' | 'category' | 'store')[]
}>

export class ProductsRepo {
  protected db: CloudflareD1Instance
  protected query

  constructor(db: CloudflareD1Instance) {
    this.db = db
    this.query = db.query.products
  }

  findById({ id, storeId }: Pick<Required<FindByArgs>, 'id' | 'storeId'>) {
    return wrappedD1Query(
      this.query.findFirst({
        where: (product) => and(
          eq(product.id, id),
          eq(product.storeId, storeId)
        ),
        with: {
          prices: true,
        },
      })
    )
  }

  listForStore(storeId: number) {
    return wrappedD1Query(
      this.query.findMany({
        where: (products) => eq(products.storeId, storeId),
        with: {
          prices: true
        },
        orderBy: (products) => desc(products.createdAt)
      })
    )
  }

  /**
   * @deprecated Might delete later
   */
  findBy(
    filters: FindByArgs,
    { limit = 0, ...options }: FindByOptions
  ) {
    const { storeId, id, slug } = filters
    const whereClause = [eq(products.storeId, storeId)]

    if (id) {
      whereClause.push(eq(products.id, id))
    }
    if (slug) {
      whereClause.push(eq(products.slug, slug))
    }

    type QueryConfig = Parameters<typeof this.query.findFirst>[0]

    const config: QueryConfig = {
      where: () => and(...whereClause),
      with: {}
    }
    if (options.include?.length) {
      options.include.forEach(
        relationName => config.with = {
          ...config.with,
          [relationName]: true
        })
    }
    const ordering = Object.entries(options.orderBy || {})

    if (ordering.length) {
      config.orderBy = (columns) => ordering.map(
        ([key, val]) => val === 'asc'
          ? asc(products[key as keyof typeof columns])
          : desc(products[key as keyof typeof columns])
      )
    }

    return limit === 1
      ? [this.query.findFirst(config)]
      : [this.query.findMany(config)]
  }
}
