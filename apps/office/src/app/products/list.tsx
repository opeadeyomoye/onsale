'use client'
import { Avatar } from '@/components/catalyst/avatar'
import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { Text } from '@/components/catalyst/text'
import useRpc from '@/hooks/useRpc'
import { productsActions } from '@/lib/actions'
import { getMediaUrl } from '@/lib/media'
import { PlusIcon } from '@heroicons/react/16/solid'
import { useSuspenseQuery } from '@tanstack/react-query'

const NoProducts = () => (
  <div className="mt-6 border-t border-zinc-950/10 pb-6 dark:border-white/10">
    <div className="mt-20 text-center">
      <Text>Start by adding some products to your store</Text>
      <Button className="mt-6" href={'/products/new'}>
        <PlusIcon />
        Add product
      </Button>
    </div>
  </div>
)

export default function ProductsList() {
  const client = useRpc()
  const { data } = useSuspenseQuery({
    queryKey: ['products'],
    queryFn: async () => productsActions(client).listProducts(),
  })
  if (!data.data.length) {
    return <NoProducts />
  }

  const getDisplayImageSrc = (product: (typeof data.data)[number]) => {
    const images = Object.values(product.images || [])
    return images[0]?.[0]?.url
      ? getMediaUrl(images[0]?.[0]?.url)
      : 'https://placehold.co/400/000/FFF.png?text=No+Image'
  }

  return (
    <Table className="mt-8 [--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Added</TableHeader>
          <TableHeader>Status</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.data.map((product) => (
          <TableRow
            key={product.id}
            href={`/products/${product.id}-${product.slug}`}
          >
            <TableCell>
              <div className="flex items-center gap-4">
                <Avatar src={getDisplayImageSrc(product)} className="size-10" />
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-zinc-500">
                    <a href="#" className="hover:text-zinc-700">
                      {product.description}
                    </a>
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-zinc-500">
              <time dateTime={product.createdAt} title={product.createdAt}>
                {new Date(product.createdAt).toLocaleDateString('en-US', {
                  dateStyle: 'medium'
                })}
              </time>
            </TableCell>
            <TableCell>
              {product.published ? <Badge color="lime">Published</Badge> : <Badge color="zinc">Draft</Badge>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
