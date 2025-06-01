import { Button } from '@/components/catalyst/button'
import { Heading } from '@/components/catalyst/heading'
import { Link } from '@/components/catalyst/link'
import { Text, TextLink } from '@/components/catalyst/text'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'

export default function AddProductPage() {
  return <>
    <div className="max-lg:hidden">
      <Link href={'/products'} className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
        <ChevronLeftIcon className="h-4 w-auto" />
        Products
      </Link>
    </div>

    <div className="mt-4 flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 lg:mt-8 dark:border-white/10">
      <Heading>Add a new product</Heading>
      <div className="flex gap-4">
        {/* <Button outline>Refund</Button> */}
      </div>
    </div>

    <div></div>
  </>
}
