import z from 'zod/v4'

export type AddProductInput = z.infer<typeof AddProductSchema>

export const AddProductSchema = z.object({
  categoryId: z.coerce.number().min(1).optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(1024),
  inStock: z.boolean(),
  published: z.boolean(),
  pricingModel: z.enum(['unit', 'bulk']),
  prices: z.array(
    z.object({
      currency: z.enum(['usd', 'ngn']),
      amount: z.coerce.number().min(1),
      model: z.enum(['unit', 'bulk']),
      quantity: z.coerce.number().min(1).optional(),
    })
      .refine(
        price => price.model === 'bulk' && price.quantity || (price.model === 'unit' && !price.quantity),
        { error: '"quantity" is required when, and only when, "model" is bulk' }
      )
  )
})
  .refine(
    value => !value.prices.find(price => price.model !== value.pricingModel),
    { error: 'One or more of the prices uses a model that conflicts with the product\'s.' }
  )

