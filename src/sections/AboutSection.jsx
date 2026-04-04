import MaterialIcon from '../components/MaterialIcon'

const ABOUT_POINTS = [
  {
    icon: 'apartment',
    title: 'Marketplace, Not Warehouse',
    description:
      'Spacio Surplas connects buyers and small furniture sellers without storing inventory, reducing overhead and risk.',
  },
  {
    icon: 'straighten',
    title: 'Space-Based Matching',
    description:
      'Buyers enter room dimensions and find only furniture that fits, preventing costly and frustrating mismatches.',
  },
  {
    icon: 'view_in_ar',
    title: 'Rich Listing Media',
    description:
      'Sellers can publish standard photos, multi-angle shots, or simplified 3D views for larger furniture pieces.',
  },
  {
    icon: 'receipt_long',
    title: 'Transparent Revenue Model',
    description:
      'The platform offers a 7-14 day free trial, then uses seller subscriptions plus commission per successful transaction.',
  },
]

function AboutSection() {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-primary/15 bg-background-light p-8 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">About Spacio Surplas</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-neutral-dark sm:text-4xl">
            Practical furniture commerce for compact homes and independent sellers
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-neutral-dark/70 sm:text-base">
            Spacio Surplas streamlines surplus furniture discovery, listing, and order tracking in one
            digital marketplace built for real home dimensions.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ABOUT_POINTS.map((item) => (
              <article key={item.title} className="rounded-2xl border border-primary/10 bg-white p-5">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <MaterialIcon name={item.icon} />
                </div>
                <h3 className="mt-3 text-lg font-bold text-neutral-dark">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-dark/70">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
