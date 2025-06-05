'use client'
import { Button } from '@/components/catalyst/button'
import { Checkbox, CheckboxField, CheckboxGroup } from '@/components/catalyst/checkbox'
import { Divider } from '@/components/catalyst/divider'
import { Description, Field, FieldGroup, Fieldset, Label, Legend } from '@/components/catalyst/fieldset'
import { Input } from '@/components/catalyst/input'
import { Text } from '@/components/catalyst/text'
import { Textarea } from '@/components/catalyst/textarea'
import useRpc from '@/hooks/useRpc'
import { ChevronRightIcon } from '@heroicons/react/16/solid'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'

export default function AddProductFormsContainer() {
  const [settingImages, setSettingImages] = useState(false)
  if (settingImages) {
    return <SetImagesForm />
  }

  return <BasicInfoForm next={() => setSettingImages(true)} />
}

type BasicInfoInput = {
  name: string
  description: string
  costPerUnit: string
  inStock?: boolean
  published?: boolean
}

function BasicInfoForm({ next }: { next: Function }) {
  const { control, handleSubmit, register } = useForm<BasicInfoInput>()
  const client = useRpc()
  const addProductMutation = useMutation({
    mutationFn: async (data: BasicInfoInput) => {
      console.log({ prid: data })
      const { ok } = await client.products.$post({
        json: {
          name: data.name,
          description: data.description,
          inStock: typeof data.inStock === 'undefined' ? true : data.inStock,
          published: typeof data.published === 'undefined' ? false : data.published,
          pricingModel: 'unit',
          prices: [{
            amount: data.costPerUnit,
            currency: 'ngn',
            model: 'unit',
            quantity: 1,
          }]
        }
      })
      if (!ok) {
        throw new Error('Failed to add product')
      }
    },
    onSuccess: () => next(),
  })
  const onSubmit: SubmitHandler<BasicInfoInput> = data => addProductMutation.mutate(data)
  const { isPending, isError } = addProductMutation

  return (
    <form className="mt-8 max-w-xl space-y-10" onSubmit={handleSubmit(onSubmit)}>
      {/* ... */}
      <Fieldset>
        <Legend className="">The Basics</Legend>
        <Text className="hidden">Without this your odds of getting your order are low.</Text>
        <FieldGroup>
          <Field>
            <Label>Product Name</Label>
            <Description>The name you'd like people to see in their cart.</Description>
            <Input {...register('name')} required />
          </Field>
          <Field>
            <Label>Description</Label>
            <Textarea {...register('description')} />
            <Description>Feel free to wax lyrical.</Description>
          </Field>
          <Field>
            <Label>Cost per unit</Label>
            <div className="mt-3 grid grid-cols-1">
              <Input
                className="col-start-1 row-start-1 sm:max-w-2xs"
                controlClassName="indent-6"
                {...register('costPerUnit')}
                required
              />
              <span
                aria-hidden="true"
                data-slot="icon"
                className="pointer-events-none col-start-1 row-start-1 ml-3 self-center text-gray-400"
              >&#8358;</span>
            </div>
            <Description className="mt-3">How much exactly 1 of these will sell for.</Description>
          </Field>
        </FieldGroup>
      </Fieldset>
      {/* ... */}
      <Divider />
      <Fieldset>
        <Legend>Discoverability</Legend>
        <Text>Decide whether the product is available for purchase.</Text>
        <CheckboxGroup>
          <CheckboxField>
            <Controller
              name="inStock"
              control={control}
              render={({ field: { onChange, onBlur } }) => (
                <Checkbox onChange={onChange} onBlur={onBlur} defaultChecked />
              )}
            />
            <Label>In stock and available to buy</Label>
            <Description>
              Un-check this if the product is currently unavailable but might come back in stock soon(ish).
            </Description>
          </CheckboxField>
          <CheckboxField>
            <Controller
              name="published"
              control={control}
              render={({ field: { onChange, onBlur } }) => (
                <Checkbox onChange={onChange} onBlur={onBlur} />
              )}
            />
            <Label>Published</Label>
            <Description>
              Makes this product discoverable from your store's website.
              Leave this unchecked if you just want to add the product to your catalog for now.
            </Description>
          </CheckboxField>
        </CheckboxGroup>
      </Fieldset>

      <div className="w-full border-t border-zinc-950/10 dark:border-white/10">
        <div className="w-full pt-6 flex justify-end">
          <Button className="min-w-24" type="submit" disabled={isPending}>
            {isPending ? <Loader2 aria-label="Saving product..." className="animate-spin" /> : 'Next: set images'}
            <ChevronRightIcon className={isPending ? 'hidden' : ''} />
          </Button>
        </div>
      </div>
    </form>
  )
}

function SetImagesForm() {
  return 'Setting Images!'
}