import { Link } from '@/components/catalyst/link'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import AddProductFormsContainer from '../forms'

export default function AddProductPage() {
  return <>
    <div className="max-lg:hidden">
      <Link href={'/products'} className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
        <ChevronLeftIcon className="h-4 w-auto" />
        Products
      </Link>
    </div>

    <AddProductFormsContainer />
  </>
}
