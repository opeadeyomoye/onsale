import { Effect, Context, Layer } from 'effect'
import { xid } from 'zod/v4'
import { ProductsRepo, ProductsRepoTag } from '@/datasource/repos/ProductsRepo'
import { AddProductInput } from '@/validation/validation'
import { slugify } from '@/util/string'

/*
 - Now, products can be added and edited from at least 2 interfaces:
    1. an HTTP api request, usually from our web client
    2. an LLM tool call
 -
 - Hence it might be a good idea for us to abstract away the implementation details of
 managing inventory. Controller(s) might use the same service(s) that LLMs or other
 inventory-managing clients would use, with the only difference lying in how each client
 (of inventory management) chooses to relay the possible execution errors to the user.
 Inventory management operations should be Effect-ful, allowing callers handle execution
 errors in a type-safe manner.
 Inventory management should defo be storage-layer agnostic.

 - LLM product/inventory tools: add, update, search
 -

 Side-note: agents can also be triggered from multiple places: slack, telegram, web-ui, or by
 non-humans: events, crons, etc.
*/

/**
 * An inventory service that
 *  - adds a new product for a given customer
 *  - hides/disables a product at a customer's behest
 *
 */
export class InventoryServiceTag extends Effect.Service<InventoryServiceTag>()(
  '@/app/context/inventory/inventoryService',
  {
    dependencies: [ProductsRepoTag.Default],

    effect: Effect.gen(function* () {
      const repo = yield* ProductsRepoTag
      return new InventoryService(repo)
    })
  }
) {}

type AddProductArgs = {
  storeId: number
  input: AddProductInput
}

export class InventoryService {
  protected productsRepo: ProductsRepo

  constructor(repo: ProductsRepo) {
    this.productsRepo = repo
  }

  /**
   * Adds a new product to the inventory for a specific store.
   *
   * This method generates a slug for the product based on its name. If a product
   * with the same slug already exists in the store, a unique slug is created by
   * appending a timestamp. The product is then inserted into the repository along
   * with its associated price details.
   *
   * @param {AddProductArgs} args - The arguments for adding a product.
   * @param {string} args.storeId - The ID of the store where the product will be added.
   * @param {AddProductArgs['input']} args.input - The details of the product to be added,
   * including its name, prices, and other attributes.
   *
   * @throws {Error} If there is an issue during the product insertion or price saving process.
   */
  addProduct({ storeId, input }: AddProductArgs) {
    const repo = this.productsRepo
    let slug = slugify(input.name)

    const { prices: pricesInput, ...partialProduct } = input

    return Effect.gen(function* () {
      const exists = yield* repo.exists({ storeId, slug })
      if (exists) {
        slug = `${slug}-${Number(Date.now()).toString(36)}`
      }

      // todo: remove product if pricing-insertion fails
      const [inserted] = yield* repo.add({ ...partialProduct, storeId, slug })
      const savedPrices = yield* repo.addPrices(
        pricesInput.map(price => ({
          productId: inserted.id,
          storeId: inserted.storeId,
          currency: price.currency,
          model: price.model,
          amount: Math.round(price.amount),
          amount_decimal: `${price.amount / 100}`,
          quantity: price.quantity || null,
        }))
      )

      return { ...inserted, prices: savedPrices }
    })
  }

  removeProduct(product: string) {
    return
  }
}

