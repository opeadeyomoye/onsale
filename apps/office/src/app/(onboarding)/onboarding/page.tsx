import OnboardingForm from './form'

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
