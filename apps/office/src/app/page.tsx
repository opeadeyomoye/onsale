import { Button } from '@/components/catalyst/button'
import { Heading } from '@/components/catalyst/heading'

export default function Home() {
  return (
    <div className="my-26 text-center">
      <Heading className="text-center">
        Work in Progress 🚧 🛠️
      </Heading>

      <Button className="mt-6" href={'/products'}>Go to products</Button>
    </div>
  )
}
