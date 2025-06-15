'use client'

import { Heading } from '@/components/catalyst/heading'
import useRpc from '@/hooks/useRpc'
import { productsActions } from '@/lib/actions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { SetImagesForm, BasicInfoForm } from '../forms'

export default function EditProductFormsContainer({ productId }: { productId: number }) {
  const client = useRpc()
  const actions = productsActions(client)
  const { data: product } = useSuspenseQuery({
    queryKey: ['product', productId],
    queryFn: async () => actions.getProduct(productId),
  })
  const [settingImages, setSettingImages] = useState(false)

  return <>
    <div className="mt-4 flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 lg:mt-8 dark:border-white/10">
      <Heading>Editing {product.name}</Heading>
      <div className="flex gap-4">
        {/* <Button outline>Refund</Button> */}
      </div>
    </div>

    {settingImages
      ? <SetImagesForm product={product} back={() => setSettingImages(false)} />
      : <BasicInfoForm product={product} next={() => setSettingImages(true)} />
    }
  </>
}
