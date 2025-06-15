import { Link } from '@/components/catalyst/link'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import EditProductFormsContainer from './container'

export default async function EditProductPage(
  { params }:
  { params: Promise<{ slug: string }>}
) {
  const { slug } = await params
  const [productId] = slug.split('-').slice(0, 1)

  return <>
    <div className="max-lg:hidden">
      <Link href={'/products'} className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
        <ChevronLeftIcon className="h-4 w-auto" />
        Products
      </Link>
    </div>

    <EditProductFormsContainer productId={Number(productId || 0)} />
  </>
}
