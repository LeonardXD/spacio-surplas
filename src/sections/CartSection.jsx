import { useMemo } from 'react'
import MaterialIcon from '../components/MaterialIcon'

function formatCurrency(value) {
  const numericValue = Number(value)
  const normalizedValue = Number.isFinite(numericValue) ? numericValue : 0
  return `PHP ${normalizedValue.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatMeters(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return null
  }

  return numericValue.toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

function formatDate(value) {
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Unknown date'
  }

  return parsedDate.toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function CartSection({
  cartItems = [],
  onRemoveItem,
  onCheckoutItem,
  onCheckoutAll,
  onContinueShopping,
}) {
  const sortedItems = useMemo(
    () =>
      [...cartItems].sort(
        (a, b) => new Date(b.addedAt ?? 0).getTime() - new Date(a.addedAt ?? 0).getTime(),
      ),
    [cartItems],
  )

  const grandTotal = useMemo(
    () => sortedItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
    [sortedItems],
  )

  return (
    <section className="bg-background-light py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-primary/10 pb-4">
            <div>
              <h2 className="text-2xl font-black text-neutral-dark">My Cart</h2>
              <p className="mt-1 text-sm text-neutral-dark/60">
                {sortedItems.length} item{sortedItems.length === 1 ? '' : 's'} ready for checkout.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-neutral-dark transition-colors hover:bg-primary/15"
                onClick={onContinueShopping}
                type="button"
              >
                Continue Shopping
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-dark px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-dark/90 disabled:cursor-not-allowed disabled:bg-neutral-dark/40"
                disabled={sortedItems.length === 0}
                onClick={onCheckoutAll}
                type="button"
              >
                <MaterialIcon className="text-base" name="shopping_cart_checkout" />
                Checkout All
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {sortedItems.map((item) => {
              const roomWidth = formatMeters(item.roomWidthM)
              const roomLength = formatMeters(item.roomLengthM)

              return (
                <article
                  key={item.id}
                  className="grid grid-cols-1 gap-4 rounded-xl border border-primary/10 p-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:p-5"
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-background-light">
                    {item.image ? (
                      <img alt={item.productName} className="h-full w-full object-cover" src={item.image} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-semibold text-neutral-dark/50">
                        No image
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-primary">
                          Seller: {item.sellerName}
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-neutral-dark">{item.productName}</h3>
                      </div>
                      <p className="text-lg font-black text-neutral-dark">
                        {formatCurrency(Number(item.price) * Number(item.quantity))}
                      </p>
                    </div>

                    {roomWidth && roomLength && (
                      <p className="mt-2 text-sm text-neutral-dark/60">
                        Fit requirement: {roomWidth}m x {roomLength}m
                      </p>
                    )}
                    <p className="mt-1 text-xs text-neutral-dark/50">
                      Added on {formatDate(item.addedAt)}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-semibold text-neutral-dark transition-colors hover:bg-primary/15"
                        onClick={() => onRemoveItem?.(item.id)}
                        type="button"
                      >
                        <MaterialIcon className="text-base" name="delete" />
                        Remove
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-lg bg-neutral-dark px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-dark/90"
                        onClick={() => onCheckoutItem?.(item.id)}
                        type="button"
                      >
                        <MaterialIcon className="text-base" name="local_mall" />
                        Checkout
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {sortedItems.length === 0 && (
            <div className="mt-6 rounded-xl border border-primary/10 bg-primary/5 p-6 text-center">
              <p className="text-base font-semibold text-neutral-dark">Your cart is currently empty.</p>
              <p className="mt-2 text-sm text-neutral-dark/60">
                Add furniture from Browse Furniture, then checkout from here.
              </p>
              <button
                className="mt-4 rounded-lg bg-neutral-dark px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-dark/90"
                onClick={onContinueShopping}
                type="button"
              >
                Browse Furniture
              </button>
            </div>
          )}

          {sortedItems.length > 0 && (
            <div className="mt-6 flex items-center justify-between rounded-xl border border-primary/10 bg-primary/5 px-4 py-3">
              <p className="text-sm font-semibold text-neutral-dark/70">Cart Total</p>
              <p className="text-xl font-black text-neutral-dark">{formatCurrency(grandTotal)}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default CartSection
