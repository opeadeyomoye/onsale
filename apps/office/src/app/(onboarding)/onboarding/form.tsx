'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/shad/ui/alert'
import { Button } from '@/components/shad/ui/button'
import useRpc from '@/hooks/useRpc'
import { CheckIcon } from '@heroicons/react/16/solid'
import { AlertCircleIcon, Loader2 } from 'lucide-react'
import { div as MotionDiv } from 'motion/react-client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function OnboardingForm() {
  const [submitting, setSubmitting] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [problem, setProblem] = useState(false)
  const [success, setSuccess] = useState(false)
  const client = useRpc()
  const router = useRouter()

  if (success) return <AllGood />

  const createStore: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    setProblem(false)
    setSubmitting(true)
    const res = await client.stores.$post({ json: { name: storeName } })
    setSubmitting(false)

    if (!res.ok) {
      if (res.status === 400) {
        return router.push('/') // they already have a store
      }
      return setProblem(true)
    }
    setSuccess(true)
  }

  return <>
    <h1 className="font-bold text-xl text-center text-slate-900 dark:text-white lg:text-2xl">
      Welcome
    </h1>

    <form onSubmit={createStore} className="mt-2 max-w-xs mx-auto space-y-8">
      <p className="text-center text-gray-700 dark:text-gray-300">
        To get started, tell us the name of your store
      </p>

      <div>
        <label htmlFor="storeName" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
          Store name
        </label>
        <div className="mt-2">
          <input
            id="storeName"
            name="storeName"
            value={storeName}
            onChange={e => setStoreName(e.target.value)}
            type="text"
            placeholder="Brielle's Hub"
            className="block w-full rounded-md bg-white dark:bg-zinc-900 px-3 py-1.5 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-600 dark:focus:outline-zinc-400 sm:text-sm/6"
            required
          />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
        >
          {submitting ? <Loader2 className="animate-spin" /> : 'Continue'}
        </Button>

        {problem ? (
          <Alert variant="destructive" className="mt-6">
            <AlertCircleIcon />
            <AlertTitle>Something went wrong that time</AlertTitle>
            <AlertDescription>
              <p>Please try again in a minute.</p>
            </AlertDescription>
          </Alert>
        ) : null}
      </div>
    </form>
  </>
}

function AllGood() {
  const router = useRouter()

  return (
    <div className="mt-8 max-w-xs mx-auto">
      <MotionDiv
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.4,
          scale: { type: 'spring', visualDuration: 0.4, bounce: 0.5 },
        }}
        className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-emerald-600 dark:bg-emerald-700"
      >
        <CheckIcon className="h-6 w-6 text-white" />
      </MotionDiv>

      <h3 className="mt-4 text-xl font-bold text-center dark:text-white">
        Your store is ready!
      </h3>

      <div className="mt-6">
        <Button variant="default" className="w-full" onClick={() => router.push('/products')}>
          Start adding products
        </Button>

        <Link className="mt-2 block text-sm text-center text-slate-800 dark:text-slate-200" href="/">I'll do that later</Link>
      </div>
    </div>
  )
}
