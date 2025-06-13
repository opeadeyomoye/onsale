import colors from '@onsale/common/colors'
import z from 'zod/v4'

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
  .min(1)
})
  .refine(
    value => !value.prices.find(price => price.model !== value.pricingModel),
    { error: 'One or more of the prices uses a model that conflicts with the product\'s.' }
  )
export type AddProductInput = z.infer<typeof AddProductSchema>

export const EditProductSchema = {
  form: () => {
    const {
      categoryId,
      name,
      description,
      inStock,
      published,
      prices,
    } = AddProductSchema.partial().shape

    return z.object({
      categoryId,
      name,
      description,
      inStock,
      published,
      prices,
    })
  },
  param: z.object({
    id: z.coerce.number().min(1),
  }),
}
export type EditProductInput = z.infer<ReturnType<typeof EditProductSchema.form>>
export type EditProductParam = z.infer<typeof EditProductSchema.param>


export const AddProductImageSchema = {
  form: z.object({
    image: z.file().min(1024).max(1024 * 1024 * 3 /* 3MB */).mime([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ]),
  }),
  param: z.object({
    id: z.coerce.number().min(1),
    colorId: z.enum(Object.values(colors).map(color => color.id)),
  }),
}
export type AddProductImageInput = z.infer<typeof AddProductImageSchema.form>
export type AddProductImageParam = z.infer<typeof AddProductImageSchema.param>
