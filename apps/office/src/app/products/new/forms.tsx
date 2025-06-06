'use client'
import { Avatar } from '@/components/catalyst/avatar'
import { Button } from '@/components/catalyst/button'
import { Checkbox, CheckboxField, CheckboxGroup } from '@/components/catalyst/checkbox'
import { Combobox, ComboboxLabel, ComboboxOption } from '@/components/catalyst/combobox'
import { Divider } from '@/components/catalyst/divider'
import { Description, Field, FieldGroup, Fieldset, Label, Legend } from '@/components/catalyst/fieldset'
import { Heading } from '@/components/catalyst/heading'
import { Input } from '@/components/catalyst/input'
import { Text } from '@/components/catalyst/text'
import { Textarea } from '@/components/catalyst/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/shad/ui/alert'
import useRpc from '@/hooks/useRpc'
import colors from '@/lib/colors'
import { ChevronRightIcon } from '@heroicons/react/16/solid'
import { EntityType } from '@onsale/worker'
import { useMutation } from '@tanstack/react-query'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { AlertCircleIcon, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'

const productAtom = atom<EntityType<'products'>>()


export default function AddProductFormsContainer() {
  const [settingImages, setSettingImages] = useState(false)
  if (settingImages) {
    return <SetImagesForm />
  }
  return <>
    <div className="mt-4 flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 lg:mt-8 dark:border-white/10">
      <Heading>Add a new product</Heading>
      <div className="flex gap-4">
        {/* <Button outline>Refund</Button> */}
      </div>
    </div>

    <BasicInfoForm next={() => setSettingImages(true)} />
  </>
}

type BasicInfoInput = {
  name: string
  description: string
  costPerUnit: string
  inStock: boolean
  published: boolean
}

function BasicInfoForm({ next }: { next: Function }) {
  const { control, handleSubmit, register } = useForm<BasicInfoInput>({
    defaultValues: {
      inStock: true,
      published: false,
    }
  })
  const client = useRpc()
  const setProduct = useSetAtom(productAtom)

  const addProductMutation = useMutation({
    mutationFn: async (data: BasicInfoInput) => {
      const post = await client.products.$post({
        json: {
          name: data.name,
          description: data.description,
          inStock: data.inStock,
          published: data.published,
          pricingModel: 'unit',
          prices: [{
            amount: data.costPerUnit,
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
    onSuccess: (data) => {
      setProduct(data.data)
      next()
    },
  })
  const onSubmit: SubmitHandler<BasicInfoInput> = data => addProductMutation.mutate(data)
  const { isPending, isError } = addProductMutation

  return (
    <form className="mt-8 max-w-xl space-y-10" onSubmit={handleSubmit(onSubmit)}>
      {/* ... */}
      <Fieldset>
        <Legend className="">The Basics</Legend>
        <Text className="hidden">.</Text>
        <FieldGroup>
          <Field>
            <Label>Product Name</Label>
            <Description>The name you'd like people to see in their cart.</Description>
            <Input {...register('name')} required />
          </Field>
          <Field>
            <Label>Description</Label>
            <Textarea {...register('description')} />
            <Description>Feel free to wax lyrical about the product here.</Description>
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

      {isError ? (
        <Alert variant="destructive" className="my-6">
          <AlertCircleIcon />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            Please try again in a minute.
          </AlertDescription>
        </Alert>
      ) : null}

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
  const product = useAtomValue(productAtom)
  return (
    <Fieldset className="mt-8 max-w-">
      <Legend>Upload images for {product?.name}</Legend>
      <Text>
        Add images for each color that {product?.name} comes in.
        If {product?.name} does not vary by color, upload its images under "No color".
      </Text>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg shadow-md bg-zinc-950">
          <Field>
            <Label>Find a color</Label>
            <Combobox
              name="color"
              options={Object.values(colors)}
              displayValue={color => color?.name}
              defaultValue={colors.noColor}
            >
              {(color) => (
                <ComboboxOption value={color}>
                  <Avatar style={{ backgroundColor: color.hex }} className="" alt="" />
                  <ComboboxLabel>{color.name}</ComboboxLabel>
                </ComboboxOption>
              )}
            </Combobox>
            <div className="mt-6">
              <Button color="light">
                Upload images
              </Button>
            </div>
          </Field>
        </div>
      </div>
      {/* <FieldGroup>
        <Field>
          <Label>Product image</Label>
          <Description>Upload a main image for the product.</Description>
          <Input type="file" accept="image/*" />
        </Field>
        <Field>
          <Label>Additional images</Label>
          <Description>Upload any additional images for the product.</Description>
          <Input type="file" accept="image/*" multiple />
        </Field>
      </FieldGroup> */}
    </Fieldset>
  )
}
