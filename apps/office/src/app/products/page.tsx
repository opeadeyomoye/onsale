import { Button } from '@/components/catalyst/button'
import { Heading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { PlusIcon } from '@heroicons/react/16/solid'
import ProductsList from './list'

export default function ProductsPage() {
  return <>
    <div className="flex w-full flex-wrap items-end justify-between gap-4">
      <Heading>Products</Heading>
      <div className="flex gap-4">
        {/* <Button outline>Refund</Button> */}
        <Button href={'/products/new'}>
          <PlusIcon />
          Add product
        </Button>
      </div>
    </div>

    <ProductsList />
  </>
}
