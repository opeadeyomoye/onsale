import { sql } from 'drizzle-orm'
import { type AnySQLiteColumn, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

const defaultTimestamps = {
  createdAt: text({ length: 26 }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text({ length: 26 }),
  deletedAt: text({ length: 26 })
}

export const stores = sqliteTable('stores', {
  id: integer().primaryKey({ autoIncrement: true }),
  creatorId: text({ length: 256 }).notNull().unique(), // 'unique' here === users can own just the 1 store
  name: text({ length: 256 }).notNull(),
  slug: text({ length: 256 }).notNull().unique(),
  ...defaultTimestamps
})

export const categories = sqliteTable('product_categories', {
  id: integer().primaryKey({ autoIncrement: true }),
  storeId: integer().notNull().references(() => stores.id),
  parentCategoryId: integer().references((): AnySQLiteColumn => categories.id),
  name: text({ length: 256 }).notNull(),
  slug: text({ length: 256 }).notNull(),
  description: text({ length: 1024 }),
  ...defaultTimestamps
}, table => [
  uniqueIndex('storeId_slug_pair_unique_idx').on(table.storeId, table.slug),
])

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
