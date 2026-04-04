import MaterialIcon from '../components/MaterialIcon'

function HeroSection({ onFindFurniture }) {
  return (
    <section className="relative overflow-hidden bg-background-light py-20 lg:py-32">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#c2a680 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-neutral-dark sm:text-6xl">
            Find Furniture That <span className="text-primary italic">Fits</span> Your Space
          </h1>
          <p className="mt-6 max-w-xl text-lg text-neutral-dark/70">
            Discover high-quality surplus furniture tailored to your room&apos;s exact dimensions.
            No more guessing, just perfect fits.
          </p>

          <div className="mt-12 w-full max-w-5xl rounded-2xl bg-white p-4 shadow-xl shadow-primary/10 lg:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="flex flex-col text-left">
                <label className="mb-1 ml-1 text-xs font-bold uppercase tracking-wider text-neutral-dark/50">
                  Room Width
                </label>
                <div className="relative">
                  <MaterialIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                    name="square_foot"
                  />
                  <input
                    className="w-full rounded-lg border border-primary/10 bg-primary/5 py-3 pl-10 focus:border-primary focus:outline-none"
                    placeholder="e.g. 3.7 m"
                    type="text"
                  />
                </div>
              </div>

              <div className="flex flex-col text-left">
                <label className="mb-1 ml-1 text-xs font-bold uppercase tracking-wider text-neutral-dark/50">
                  Room Length
                </label>
                <div className="relative">
                  <MaterialIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                    name="straighten"
                  />
                  <input
                    className="w-full rounded-lg border border-primary/10 bg-primary/5 py-3 pl-10 focus:border-primary focus:outline-none"
                    placeholder="e.g. 4.6 m"
                    type="text"
                  />
                </div>
              </div>

              <div className="flex flex-col text-left">
                <label className="mb-1 ml-1 text-xs font-bold uppercase tracking-wider text-neutral-dark/50">
                  Room Type
                </label>
                <select className="w-full rounded-lg border border-primary/10 bg-primary/5 py-3 focus:border-primary focus:outline-none">
                  <option>Living Room</option>
                  <option>Bedroom</option>
                  <option>Office</option>
                  <option>Dining</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-base font-bold text-neutral-dark transition-all hover:bg-primary/90"
                  onClick={onFindFurniture}
                  type="button"
                >
                  <MaterialIcon name="search" />
                  Find Furniture
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
