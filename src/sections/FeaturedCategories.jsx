import MaterialIcon from '../components/MaterialIcon'

function FeaturedCategories({ categories }) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-neutral-dark">Featured Categories</h2>
        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <a
              key={category.label}
              className="group flex flex-col items-center rounded-xl border border-primary/10 bg-white p-8 transition-all hover:border-primary hover:bg-primary/5 hover:shadow-lg"
              href="#"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <MaterialIcon className="text-3xl" name={category.icon} />
              </div>
              <span className="mt-4 font-bold text-neutral-dark group-hover:text-primary">
                {category.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedCategories
