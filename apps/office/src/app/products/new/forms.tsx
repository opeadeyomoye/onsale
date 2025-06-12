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
import { Heading } from '@/components/catalyst/heading'
import { Input } from '@/components/catalyst/input'
import { Text } from '@/components/catalyst/text'
import { Textarea } from '@/components/catalyst/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/shad/ui/alert'
import useRpc from '@/hooks/useRpc'
import { ChevronRightIcon } from '@heroicons/react/16/solid'
import colors, { ColorId } from '@onsale/common/colors'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { AlertCircleIcon, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'
import { productAtom } from './atoms'
import { PlusIcon } from '@heroicons/react/20/solid'
import { productsActions } from '@/lib/actions'
import { EntityType } from '@onsale/worker'
import { getQueryClient } from '@/app/getQueryClient'
import { getMediaUrl } from '@/lib/media'
import { hexToRgba } from '@/lib/string'


export default function AddProductFormsContainer() {
  const product = useAtomValue(productAtom)
  const [settingImages, setSettingImages] = useState(false)
  const goToImages = () => {
    setSettingImages(true)
    setTimeout(() => document.getElementById('id-upload-images')?.scrollIntoView({
      behavior: 'smooth',
    }), 200) // Wait for the state to update before scrolling
  }

  return <>
    <div className="mt-4 flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 lg:mt-8 dark:border-white/10">
      <Heading>Add a new product</Heading>
      <div className="flex gap-4">
        {/* <Button outline>Refund</Button> */}
      </div>
    </div>

    {/* {product?.id ? <SetImagesForm /> : null} */}
    {settingImages ? <SetImagesForm /> : <BasicInfoForm next={goToImages} />}
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

function SetImagesForm() {
  const client = useRpc()
  const localProduct = useAtomValue(productAtom)

  const productQuery = useQuery({
    queryKey: ['product', localProduct?.id],
    queryFn: async () => productsActions(client).getProduct(localProduct?.id || 0),
  })

  const images = productQuery.data?.images

  return (
    <Fieldset className="mt-12" id="id-upload-images">
      <Legend>Upload images for {localProduct?.name}</Legend>
      <Text>
        Add images for each color that {localProduct?.name} comes in.
        If {localProduct?.name} does not vary by color, upload its images under "No color".
      </Text>

      <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.keys(images || {}).map(colorId => {
          const color = colors[colorId as ColorId]
          return (
            <ColorImageSelector
              key={colorId}
              product={{
                id: localProduct?.id || 0,
                name: localProduct?.name || '',
                images: images || {}
              }}
              color={color}
            />
          )
        })}
        <ColorImageSelector
          product={{
            id: localProduct?.id || 0,
            name: localProduct?.name || '',
            images: images || {}
          }}
        />
      </div>

      <Divider className="my-8 md:my-12" />

      <div className="mt-6 flex justify-end gap-x-4">
        {/* <Button outline>Back</Button> */}
        <Button href={'/products'}>Finish</Button>
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
      <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
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
      </div>
      <DialogDescription className="mt-6">
        You can select several images at once.
      </DialogDescription>
    </Dialog>
  )
}
