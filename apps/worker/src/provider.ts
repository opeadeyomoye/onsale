import * as Effect from 'effect/Effect'
import * as ManagedRuntime from 'effect/ManagedRuntime'
import { InventoryServiceTag } from '@/context/inventory/InventoryService'
import { ProductsRepoTag } from '@/datasource/repos/ProductsRepo'
import { DatabaseTag } from '@/datasource/Database'
import * as Layer from 'effect/Layer'
import { HonoContext } from '@/types'

export type AppRequirements =
  ReturnType<typeof bootstrapMainLayer> extends Layer.Layer<infer A, infer B> ? A : never

export function bootstrapMainLayer() {
  return Layer.mergeAll(
    DatabaseTag.Default,
    ProductsRepoTag.Default,
    InventoryServiceTag.Default,
  )
}
const AppRuntime = ManagedRuntime.make(bootstrapMainLayer())

export function runHandlerEffect<A, E>(
  c: HonoContext,
  e: Effect.Effect<A, E, AppRequirements>
) {
  return AppRuntime.runPromise(e)
}
export const rhe = runHandlerEffect
