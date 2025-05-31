import { AppType } from '@onsale/worker'
import { hc } from 'hono/client'
import OnboardingForm from './form'

declare const x: AppType
const client = hc<AppType>('http://localhost:8787')


export default function OnboardingPage() {

  return <>
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden min-h-screen bg-slate-900 lg:block"></div>

      <div className="mt-[25vh] px-4 lg:max-w-3xl">
        <OnboardingForm />
      </div>
    </div>
  </>
}
