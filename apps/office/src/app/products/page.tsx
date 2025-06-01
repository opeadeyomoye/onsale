import { Button } from '@/components/catalyst/button'
import { Heading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { PlusIcon } from '@heroicons/react/16/solid'

export default function ProductsPage() {
  return <>
    <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
      <Heading>Products</Heading>
      <div className="flex gap-4">
        {/* <Button outline>Refund</Button> */}
        <Button href={'/products/new'}>
          <PlusIcon />
          Add product
        </Button>
      </div>
    </div>

    <div className="mt-20 text-center">
      <Text>Start by adding some products to your store</Text>
      <Button className="mt-6" href={'/products/new'}>
        <PlusIcon />
        Add product
      </Button>
    </div>
  </>
}
