import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const stores = sqliteTable('stores', {
  id: integer().primaryKey({ autoIncrement: true }),
  creatorId: text({ length: 256 }).notNull().unique(), // 'unique' here === users can own just the 1 store
  name: text({ length: 256 }).notNull(),
  slug: text({ length: 256 }).notNull().unique(),
  createdAt: text({ length: 26 }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text({ length: 26 }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
})
