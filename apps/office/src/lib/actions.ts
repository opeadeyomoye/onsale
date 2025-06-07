import type { Client } from '@onsale/worker/hc'

export const productsActions = (client: Client) => ({
  getProduct: (id: number) => client.products[':id'].$get({ param: { id: `${id}` }})
    .then(res => res.ok ? res.json() : Promise.reject(res.json())),

})
