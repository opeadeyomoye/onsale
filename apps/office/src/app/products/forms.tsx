'use client'
import { Avatar } from '@/components/catalyst/avatar'
import { Button } from '@/components/catalyst/button'
import { Checkbox, CheckboxField, CheckboxGroup } from '@/components/catalyst/checkbox'
import { Combobox, ComboboxLabel, ComboboxOption } from '@/components/catalyst/combobox'
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle
} from '@/components/catalyst/dialog'
import { Divider } from '@/components/catalyst/divider'
import { Description, Field, FieldGroup, Fieldset, Label, Legend } from '@/components/catalyst/fieldset'
import { Input } from '@/components/catalyst/input'
import { Text } from '@/components/catalyst/text'
import { Textarea } from '@/components/catalyst/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/shad/ui/alert'
import useRpc from '@/hooks/useRpc'
import { ChevronRightIcon } from '@heroicons/react/16/solid'
import colors, { ColorId } from '@onsale/common/colors'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { AlertCircleIcon, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { productAtom, ProductAtomType } from './atoms'
import { PlusIcon } from '@heroicons/react/20/solid'
import { productsActions } from '@/lib/actions'
import type { EntityType } from '@onsale/worker'
import { getQueryClient } from '@/app/getQueryClient'
import { getMediaUrl } from '@/lib/media'
import { hexToRgba } from '@/lib/string'


type BasicInfoInput = {
  name: string
  description: string
  costPerUnit: number
  inStock: boolean
  published: boolean
}

export function BasicInfoForm(
  { next, product }:
  { next: () => void, product?: ProductAtomType }
) {
  let defaultValues: Partial<BasicInfoInput> = {
    inStock: true,
    published: false,
  }

  // caller can pass in an existing product if they want product editing
  if (product?.id) {
    const { name, description, prices, inStock, published } = product
    defaultValues = {
      name,
      description: description || undefined,
      costPerUnit: ((prices[0]?.amount || 0) / 100),
      inStock,
      published
    }
  }
  const { control, handleSubmit, register } = useForm<BasicInfoInput>({ defaultValues })
  const client = useRpc()
  const setProduct = useSetAtom(productAtom)

  const mutation = useMutation({
    mutationFn: (data: BasicInfoInput) => {
      // editing if we were passed an existing product. adding otherwise
      return product?.id
        ? productsActions(client).updateProduct(data, product.id)
        : productsActions(client).addProduct(data)
    },
    onSuccess: async (data) => {
      setProduct(data.data)
      await queryClient.invalidateQueries({ queryKey: ['product', product?.id] })
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      next()
    },
  })
  const queryClient = getQueryClient()
  const onSubmit: SubmitHandler<BasicInfoInput> = data => mutation.mutate(data)
  const { isPending, isError } = mutation

  return (
    <form className="mt-8 max-w-xl space-y-10" onSubmit={handleSubmit(onSubmit)}>
      {/* ... */}
      <Fieldset>
        <Legend className="">The Basics</Legend>
        <Text className="hidden">.</Text>
        <FieldGroup>
          <Field>
            <Label>Product Name</Label>
            <Description>The name you&apos;d like people to see in their cart.</Description>
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
              <Controller
                name="costPerUnit"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <NumericFormat
                    customInput={Input}
                    className="col-start-1 row-start-1 sm:max-w-2xs"
                    controlClassName="indent-6"
                    required
                    thousandSeparator=","
                    value={value}
                    onValueChange={({ floatValue }) => onChange(floatValue || 0)}
                    onBlur={onBlur}
                  />
                )}
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
              render={({ field: { onChange, onBlur, value } }) => (
                <Checkbox onChange={onChange} onBlur={onBlur} defaultChecked={value} />
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
              render={({ field: { onChange, onBlur, value } }) => (
                <Checkbox onChange={onChange} onBlur={onBlur} defaultChecked={value} />
              )}
            />
            <Label>Published</Label>
            <Description>
              Makes this product discoverable from your store&apos;s website.
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
            {isPending
              ? <Loader2 aria-label="Saving product..." className="animate-spin" />
              : 'Next: set images'
            }
            <ChevronRightIcon className={isPending ? 'hidden' : ''} />
          </Button>
        </div>
      </div>
    </form>
  )
}

export function SetImagesForm({ product, back }: { product: ProductAtomType, back: () => void }) {
  const client = useRpc()
  const router = useRouter()
  const setLocalProduct = useSetAtom(productAtom)
  const actions = productsActions(client)

  const productQuery = useQuery({
    queryKey: ['product', product.id],
    queryFn: async () => actions.getProduct(product.id),
  })
  const onFinish = () => {
    setLocalProduct(undefined)
    router.push('/products')
  }

  const images = productQuery.data?.images

  return (
    <Fieldset className="mt-12" id="id-upload-images">
      <Legend>Upload images for {product.name}</Legend>
      <Text>
        Add images for each color that {product.name} comes in.
        If {product.name} does not vary by color, upload its images under &quot;No color&quot;.
      </Text>

      <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.keys(images || {}).map(colorId => {
          const color = colors[colorId as ColorId]
          return (
            <ColorImageSelector
              key={colorId}
              product={{
                id: product.id,
                name: product.name,
                images: images || {}
              }}
              color={color}
            />
          )
        })}
        <ColorImageSelector
          product={{
            id: product.id,
            name: product.name,
            images: images || {}
          }}
        />
      </div>

      <Divider className="my-8 md:my-12" />

      <div className="mt-6 flex justify-end gap-x-4">
        <Button outline onClick={() => back()}>Back</Button>
        <Button onClick={onFinish}>Finish</Button>
      </div>
    </Fieldset>
  )
}

type ColorImageSelectorProps = {
  product: {
    id: number
    name: string
    images: EntityType<'products'>['images']
  }
  color?: typeof colors[ColorId]
}

function ColorImageSelector({ product: { id, name, images }, color }: ColorImageSelectorProps) {
  const [selectedColor, setSelectedColor] = useState(color || colors.noColor)
  const [dialogOpen, setDialogOpen] = useState(false)
  const selectedColorImages = images?.[selectedColor.id] || []

  const setDialogOpenState = (newOpenState: boolean) => {
    if (!color && dialogOpen && (newOpenState === false)) {
      // If the dialog is being closed, reset the selected color to the default
      setSelectedColor(colors.noColor)
    }
    setDialogOpen(newOpenState)
  }

  return <>
    <UploadImagesDialog
      selectedColor={selectedColor}
      open={dialogOpen}
      setOpen={setDialogOpenState}
      images={selectedColorImages}
      product={{ id, name }}
    />
    <div className="p-6 rounded-lg shadow-md bg-zinc-950">
      <Field>
        <Label>{color ? color.name : 'Find a color'}</Label>
        {color ? (
          <div className="mt-4 flex items-center rounded-2xl">
            <div className="grid grid-cols-3 gap-3">
              {selectedColorImages.slice(0, 3).map(image => (
                <div key={image.url}>
                  <img
                    src={getMediaUrl(image.url)}
                    alt=""
                    className="h-12 w-auto rounded-lg shadow-sm object-cover opacity-70"
                  />
                </div>
              ))}
            </div>
            <Text className="ml-4">
              {selectedColorImages.length > 3 ? `+ ${selectedColorImages.length - 3} more` : ''}
            </Text>
          </div>
        ) : (
          <Combobox
            name="color"
            options={Object.values(colors)}
            displayValue={c => c?.name}
            value={selectedColor}
            onChange={c => c?.id ? setSelectedColor(c) : null}
          >
            {cx => (
              <ComboboxOption value={cx}>
                <Avatar style={{ backgroundColor: cx.hex }} className="" alt="" />
                <ComboboxLabel>{cx.name}</ComboboxLabel>
              </ComboboxOption>
            )}
          </Combobox>
        )}
        <div className={`${color ? 'mt-6' : 'mt-10'}`}>
          <Button plain onClick={() => setDialogOpen(true)} disabled={!selectedColor}>
            {color ? 'Update images' : 'Add images'}
          </Button>
        </div>
      </Field>
    </div>
  </>
}

type UploadImagesDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  selectedColor: typeof colors[keyof typeof colors] | null
  images: Array<{ url: string }>,
  product: { id: number, name: string }
}

function UploadImagesDialog(
  { open, setOpen, product, selectedColor, images }: UploadImagesDialogProps
) {
  const queryClient = getQueryClient()
  const client = useRpc()

  const { mutate, isPending } = useMutation({
    mutationFn: async (files: FileList) => {
      if (!files.length) return

      const promises = Array.from(files).map(file => {
        return client.products[':id'].images[':colorId'].$post({
          param: {
            id: `${product.id}`,
            colorId: selectedColor?.id || 'noColor',
          },
          form: { image: file }
        })
      })
      return await Promise.all(promises)
    },
    onSettled: () => queryClient.invalidateQueries({
      queryKey: ['product', product.id]
    })
  })

  if (!selectedColor) {
    return null
  }
  const handleFilesChange = (list: FileList | null) => {
    if (!list?.length) return

    mutate(list)
  }

  return (
    <Dialog
      size="2xl"
      open={open}
      onClose={setOpen}
      className={`${selectedColor.id === 'noColor' ? '' : 'border-t-2'}`}
      style={{ borderTopColor: selectedColor.hex, backgroundColor: "red" }}
    >
      <DialogTitle>
        Pictures of {product.name}
        {selectedColor.id === 'noColor' ? '' : ` in ${selectedColor.name}`}
      </DialogTitle>
      <DialogBody className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {images.map(image => (
          <div className="shrink-0" key={image.url}>
            <img
              src={getMediaUrl(image.url)}
              alt=""
              className="h-32 aspect-3/2 rounded-lg shadow-sm object-cover"
            />
          </div>
        ))}
        <div className="h-32 flex items-center justify-center rounded-lg border border-dashed border-gray-900/35 px-4 py-2 transition duration-200 hover:bg-secondary dark:border-white/45 sm:py-0">
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
              <label className="block text-center">
                <PlusIcon aria-hidden="true" className="mx-auto size-8 text-gray-400" />
                <div className="mt-2 flex text-sm/6 text-gray-600">
                  <Label htmlFor="id-new-images" className="">
                    <span>
                      Select images
                    </span>
                  </Label>

                  <input
                    id="id-new-images"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    multiple
                    onChange={e => handleFilesChange(e.target.files)}
                  />
                </div>
                <Text className="text-xs/5 text-gray-600">
                  <span>Max. 3MB each</span>
                </Text>
              </label>
          )}
        </div>
      </DialogBody>
      <DialogDescription className="mt-4 flex items-center justify-between">
        You can select several images at once.
      </DialogDescription>
      <DialogActions>
        <Button
          outline
          onClick={() => setOpen(false)}
          disabled={isPending}
        >
          Close
        </Button>
        <Button
          onClick={() => setOpen(false)}
          disabled={isPending}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  )
}
