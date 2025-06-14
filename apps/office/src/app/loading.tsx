import { Loader2 } from 'lucide-react'

export default function PageLoader() {
  return (
    <div className="flex h-screen w-full pt-32 justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}
