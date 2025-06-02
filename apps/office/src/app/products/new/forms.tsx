'use client'
import { Button } from '@/components/catalyst/button'
import { Checkbox, CheckboxField, CheckboxGroup } from '@/components/catalyst/checkbox'
import { Divider } from '@/components/catalyst/divider'
import { Description, Field, FieldGroup, Fieldset, Label, Legend } from '@/components/catalyst/fieldset'
import { Input } from '@/components/catalyst/input'
import { Text } from '@/components/catalyst/text'
import { Textarea } from '@/components/catalyst/textarea'
import { ChevronRightIcon } from '@heroicons/react/16/solid'
import { useState } from 'react'

export default function AddProductFormsContainer() {
  const [settingImages, setSettingImages] = useState(false)
  if (settingImages) {
    return <SetImagesForm />
  }

  return <BasicInfoForm next={() => setSettingImages(true)} />
}

function BasicInfoForm({ next }: { next: Function }) {
  return (
    <form className="mt-8 max-w-xl space-y-10" action="/orders" method="POST">
      {/* ... */}
      <Fieldset>
        <Legend className="">The Basics</Legend>
        <Text className="hidden">Without this your odds of getting your order are low.</Text>
        <FieldGroup>
          <Field>
            <Label>Product Name</Label>
            <Description>The name you'd like people to see in their cart.</Description>
            <Input name="name" />
          </Field>
          <Field>
            <Label>Description</Label>
            <Textarea name="notes" />
            <Description>Feel free to wax lyrical.</Description>
          </Field>
          <Field>
            <Label>Cost per unit</Label>
            <div className="mt-3 grid grid-cols-1">
              <Input className="col-start-1 row-start-1 sm:max-w-2xs" controlClassName="indent-6" name="unit_cost" />
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
            <Checkbox name="discoverability" value="allow_embedding" defaultChecked />
            <Label>In stock and available to buy</Label>
            <Description>
              Un-check this if the product is currently unavailable but might come back in stock soon(ish).
            </Description>
          </CheckboxField>
          <CheckboxField>
            <Checkbox name="discoverability" value="show_on_events_page" />
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
          <Button className="min-w-24" type="submit">
            Next: set images
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </form>
  )
}

function SetImagesForm() {
  return 'Setting Images!'
}