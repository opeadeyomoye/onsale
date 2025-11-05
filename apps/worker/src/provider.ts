import * as Effect from 'effect/Effect'
import * as EffectContext from 'effect/Context'
import { Context } from 'hono'
import { InventoryServiceTag } from './context/inventory/inventoryService'
import { ProductsRepoTag } from './datasource/repos/ProductsRepo'
import CloudflareD1InstanceTag from './datasource/CloudflareD1Instance'
import * as Layer from 'effect/Layer'

export type AppRequirements =
  | CloudflareD1InstanceTag
  | ProductsRepoTag
  | InventoryServiceTag

export function runEffectPromiseWithMainLayer<A, E>(
  c: Context<AppEnv>,
  e: Effect.Effect<A, E, AppRequirements>
) {
  const runnable = Effect.provide(e, c.get('mainLayer'))

  return Effect.runPromise(runnable)
    // .pipe(Effect.provide(ProductsRepoTag.Default))
    // .pipe(Effect.provide(context))
    // .pipe(Effect.catchTag('DatasourceError', (error) => Effect.succeed("{ msg: 'Failed' }")))


  // const runnable = Effect.provide(program, mergedLayers)
}

export function bootstrapMainLayer(c: Context<AppEnv>) {
  // const context = EffectContext.empty().pipe(
  //   EffectContext.add(CloudflareD1InstanceTag, c.get('db')),
  // )
  const cloudflareD1Live = Layer.succeed(
    CloudflareD1InstanceTag,
    CloudflareD1InstanceTag.of(c.get('db'))
  )

  const appServicesLive = Layer.mergeAll(
    ProductsRepoTag.Default,
    InventoryServiceTag.Default,
  ).pipe(
    Layer.provide(cloudflareD1Live)
  )

  return Layer.merge(appServicesLive, cloudflareD1Live)
}
