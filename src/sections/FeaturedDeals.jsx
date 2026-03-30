import MaterialIcon from '../components/MaterialIcon'

function FeaturedDeals({ products }) {
  return (
    <section className="bg-background-light py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-neutral-dark">Featured Surplus Deals</h2>
          <a className="flex items-center gap-1 font-bold text-primary hover:underline" href="#">
            View all deals <MaterialIcon className="text-sm" name="arrow_forward" />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.name}
              className="group relative overflow-hidden rounded-xl bg-white p-3 shadow-sm transition-all hover:shadow-xl"
            >
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-background-light">
                <img
                  alt={product.alt}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  src={product.image}
                />
                <div className="absolute left-6 top-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-dark">
                  Fits Small Spaces
                </div>
              </div>
              <div className="mt-4 p-2">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  {product.category}
                </p>
                <h3 className="mt-1 text-lg font-bold text-neutral-dark">{product.name}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl font-black text-neutral-dark">{product.price}</span>
                  <span className="text-sm text-neutral-dark/40 line-through">{product.oldPrice}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-primary/5 pt-4">
                  <span className="text-xs text-neutral-dark/60">Seller: {product.seller}</span>
                  <button className="text-primary">
                    <MaterialIcon name="favorite" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedDeals
