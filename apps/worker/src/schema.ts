import { type ColorId } from '@onsale/common/colors'
import { relations, sql } from 'drizzle-orm'
import { type AnySQLiteColumn, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

const defaultTimestamps = {
  createdAt: text({ length: 26 }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text({ length: 26 }).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  deletedAt: text({ length: 26 })
}

export const stores = sqliteTable('stores', {
  id: integer()
    .primaryKey({ autoIncrement: true }),
  creatorId: text({ length: 256 })
    .notNull()
    .unique(), // 'unique' here === users can own just the 1 store
  name: text({ length: 256 }).notNull(),
  slug: text({ length: 256 })
    .notNull()
    .unique(),
  ...defaultTimestamps
})

const idPlusStoreIdWithForeignKey = {
  id: integer()
    .primaryKey({ autoIncrement: true }),
  storeId: integer()
    .notNull()
    .references(() => stores.id),
}

export const categories = sqliteTable('product_categories', {
  ...idPlusStoreIdWithForeignKey,
  parentCategoryId: integer().references((): AnySQLiteColumn => categories.id),
  name: text({ length: 256 }).notNull(),
  slug: text({ length: 288 }).notNull(),
  description: text({ length: 1024 }),
  ...defaultTimestamps
}, table => [
  uniqueIndex('storeId_slug_pair_unique_idx').on(table.storeId, table.slug),
])

const pricingModel = text({ enum: ['unit', 'bulk'] }).notNull()

export const products = sqliteTable('products', {
  ...idPlusStoreIdWithForeignKey,
  categoryId: integer().references(() => categories.id),
  name: text({ length: 256 }).notNull(),
  slug: text({ length: 288 }).notNull(),
  description: text({ length: 1024 }),
  colors: text({ mode: 'json' })
    .$type<ColorId[]>(),
  images: text({ mode: 'json' })
    .$type<ProductImages>(),
  pricingModel,
  inStock: integer({ mode: 'boolean' })
    .notNull()
    .default(false),
  published: integer({ mode: 'boolean' })
    .notNull()
    .default(false),
  ...defaultTimestamps,
}, table => [
  uniqueIndex('products_storeId_slug_pair_unique_idx').on(table.storeId, table.slug),
])

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  prices: many(prices),
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
}))

type ProductImages = {
  [color in ColorId]?: { url: string}[]
}

export const prices = sqliteTable('product_prices', {
  ...idPlusStoreIdWithForeignKey,
  productId: integer()
    .notNull()
    .references(() => products.id),
  model: pricingModel,
  currency: text({ enum: ['usd', 'ngn'], length: 3 })
    .notNull(),
  amount: integer({ mode: 'number' }),
  quantity: integer({ mode: 'number' }),
  amount_decimal: text(),
  ...defaultTimestamps,
})
export const pricesRelations = relations(prices, ({ one }) => ({
  product: one(products, {
    fields: [prices.productId],
    references: [products.id],
  }),
  store: one(stores, {
    fields: [prices.storeId],
    references: [stores.id],
  }),
}))

/*
---------------
add new product
---------------
 - categoryId (+ create new)
 	- id
 	- storeId
 	- parentId
 	- name
 	- slug

 - name
 - slug
 - name
 - description
 - colors
 	- ['red', 'gray']
 	-
 - images
 	- red
	  - url
  - gray
   	  - url
   	| or simply an array of images if there's no colors
 - pricing: unit, bulk
 - prices:
 	- USD
 		{amount: 100}
 	- NGN
 		{amount: 100}
 	|
 	- USD
 		[{amount: 7000, quantity: 20}]
 		[{amount: 14,000, quantity: 50}]

 	price:
 	  - id
 	  - storeId
 	  - productId
 	  - kind: unit
 	  - amount
 	  - currency
 	  - quantity
 - inStock


 > attributes
 	- id
 	- storeId
 	- name

 > attribute_options
 	- id: brandom-finishing-gloss
 	- name: Finishing
 	- value: Gloss
 	- pricing: additional_per_unit
 	- cost: 100
 	-
 -

*/
