import type { Client } from '@onsale/worker/hc'
import type { InferRequestType } from 'hono/client'

type NewProductInput = {
  name: string
  description: string
  inStock: boolean
  published: boolean
  costPerUnit: number
}

export const productsActions = (client: Client) => ({
  listProducts: (query?: { page?: number, limit?: number }) =>
    client.products.$get({
      query: {
        page: query?.page?.toString() || '1',
        limit: query?.limit?.toString() || '10',
      }
    })
      .then(res => res.ok ? res.json() : Promise.reject(res.json())),

  getProduct: (id: number) => client.products[':id'].$get({ param: { id: `${id}` }})
    .then(res => res.ok ? res.json() : Promise.reject(res.json())),

  addProduct: async (data: NewProductInput) => {
    const post = await client.products.$post({
      json: {
        name: data.name,
        description: data.description,
        inStock: data.inStock,
        published: data.published,
        pricingModel: 'unit',
        prices: [{
          amount: data.costPerUnit * 100,
          currency: 'ngn',
          model: 'unit',
        }]
      }
    })
    if (!post.ok) {
      throw new Error('Failed to add product')
    }
    return await post.json()
  },

  updateProduct: async (data: Partial<NewProductInput>, productId: number) => {
    const { costPerUnit, ...rest } = data
    const $patch = client.products[':id'].$patch
    const input: InferRequestType<typeof $patch>['json'] = { ...rest }

    if (costPerUnit) {
      input.prices = [{
        amount: costPerUnit * 100,
        currency: 'ngn',
        model: 'unit',
      }]
    }

    const post = await $patch({
      param: { id: `${productId}` },
      json: input
    })
    if (!post.ok) {
      throw new Error('Failed to update product')
    }
    return await post.json()
  }
})
