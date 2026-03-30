import MaterialIcon from '../components/MaterialIcon'

function HowItWorks({ steps }) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-neutral-dark">How It Works</h2>
        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MaterialIcon className="text-4xl" name={step.icon} />
              </div>
              <h3 className="text-xl font-bold text-neutral-dark">{step.title}</h3>
              <p className="mt-4 leading-relaxed text-neutral-dark/60">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
