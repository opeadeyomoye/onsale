'use client'

import { Heading } from '@/components/catalyst/heading'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { productAtom } from '../atoms'
import { BasicInfoForm, SetImagesForm } from '../forms'


export default function AddProductFormsContainer() {
  const product = useAtomValue(productAtom)
  const [settingImages, setSettingImages] = useState(false)

  return <>
    <div className="mt-4 flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 lg:mt-8 dark:border-white/10">
      <Heading>Add a new product</Heading>
      <div className="flex gap-4">
        {/* <Button outline>Refund</Button> */}
      </div>
    </div>

    {product?.id && settingImages
      ? <SetImagesForm product={product} back={() => setSettingImages(false)} />
      : <BasicInfoForm product={product} next={() => setSettingImages(true)} />
    }
  </>
}