'use client'

import { AppType } from '@onsale/worker'
import { hc } from 'hono/client'

const client = hc<AppType>('http://localhost:8787')

export default function OnboardingForm() {
  client.onboarding.$get().then(async (res) => console.log('client response', await res.text()));
  return (
    <form className="mt-2 max-w-xs mx-auto space-y-8">
      <p className="text-center text-gray-700">
        To get started, tell us the name of your store
      </p>

      <div>
        <label htmlFor="storeName" className="block text-sm/6 font-medium text-gray-900">
          Store name
        </label>
        <div className="mt-2">
          <input
            id="storeName"
            name="storeName"
            type="text"
            placeholder="e.g. Brielle's Hub"
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full rounded-md bg-blue-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Continue
        </button>
      </div>
    </form>
  )
}
