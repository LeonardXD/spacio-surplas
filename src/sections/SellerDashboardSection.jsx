import { useMemo } from 'react'
import MaterialIcon from '../components/MaterialIcon'

const LOW_STOCK_THRESHOLD_COUNT = 5
const LOW_STOCK_THRESHOLD_PERCENTAGE = 20

function formatCurrency(value) {
  const numericValue = Number(value)
  const normalizedValue = Number.isFinite(numericValue) ? numericValue : 0
  return `PHP ${normalizedValue.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
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

function normalizeStockValue(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return 0
  }

  return Math.max(0, Math.round(numericValue))
}

function normalizeCapacity(stockCount, stockCapacity) {
  const normalizedStock = normalizeStockValue(stockCount)
  const normalizedCapacity = normalizeStockValue(stockCapacity)

  if (normalizedCapacity > 0) {
    return Math.max(normalizedStock, normalizedCapacity)
  }

  return Math.max(normalizedStock, 1)
}

function getStockStatus(stockCount, capacity) {
  const safeCapacity = Math.max(1, normalizeCapacity(stockCount, capacity))
  const safeStock = normalizeStockValue(stockCount)
  const percentage = Math.round((safeStock / safeCapacity) * 100)
  const isLowStock =
    safeStock <= LOW_STOCK_THRESHOLD_COUNT || percentage <= LOW_STOCK_THRESHOLD_PERCENTAGE

  return {
    percentage,
    isLowStock,
    safeStock,
    safeCapacity,
  }
}

function SellerDashboardSection({
  sellerListings = [],
  sellerOrders = [],
  onViewOrders,
}) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const totalSales = useMemo(
    () => sellerOrders.reduce((sum, order) => sum + Number(order.amount), 0),
    [sellerOrders],
  )

  const monthlyOrders = useMemo(
    () =>
      sellerOrders.filter((order) => {
        const orderDate = new Date(order.createdAt)
        return (
          !Number.isNaN(orderDate.getTime()) &&
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        )
      }).length,
    [currentMonth, currentYear, sellerOrders],
  )

  const averageRating = useMemo(() => {
    if (sellerListings.length === 0) {
      return 0
    }

    const totalRating = sellerListings.reduce(
      (sum, listing) => sum + Number(listing.averageRating),
      0,
    )
    return totalRating / sellerListings.length
  }, [sellerListings])

  const recentOrders = useMemo(
    () =>
      [...sellerOrders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [sellerOrders],
  )

  const stockLevelItems = useMemo(
    () =>
      sellerListings.map((listing) => {
        const stockStatus = getStockStatus(listing.stockCount, listing.stockCapacity)
        return {
          ...listing,
          ...stockStatus,
        }
      }),
    [sellerListings],
  )

  const lowStockItems = useMemo(
    () => stockLevelItems.filter((listing) => listing.isLowStock),
    [stockLevelItems],
  )

  return (
    <section className="bg-background-light py-16 lg:py-20">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Dashboard</p>
          <h2 className="mt-2 text-3xl font-black text-neutral-dark">Store Performance Snapshot</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-primary/15 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-dark/60">Total Sales</p>
            <p className="mt-2 text-2xl font-black text-neutral-dark">{formatCurrency(totalSales)}</p>
          </article>
          <article className="rounded-2xl border border-primary/15 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-dark/60">Monthly Orders</p>
            <p className="mt-2 text-2xl font-black text-neutral-dark">{monthlyOrders}</p>
          </article>
          <article className="rounded-2xl border border-primary/15 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-dark/60">Average Rating</p>
            <p className="mt-2 text-2xl font-black text-neutral-dark">
              {averageRating > 0 ? averageRating.toFixed(1) : '0.0'} / 5
            </p>
          </article>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-dark">Recent Orders</h3>
                <p className="mt-1 text-sm text-neutral-dark/60">
                  Quick glimpse only. Open Orders for full history and status updates.
                </p>
              </div>
              <button
                className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-neutral-dark transition-colors hover:bg-primary/15"
                onClick={onViewOrders}
                type="button"
              >
                View Orders
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {recentOrders.map((order) => (
                <article key={order.id} className="rounded-lg border border-primary/10 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-neutral-dark">{order.productName}</p>
                      <p className="text-xs text-neutral-dark/60">Buyer: {order.buyerName}</p>
                    </div>
                    <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-neutral-dark">
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-dark/55">
                    <span>{formatDate(order.createdAt)}</span>
                    <span>{formatCurrency(order.amount)}</span>
                  </div>
                </article>
              ))}
            </div>

            {recentOrders.length === 0 && (
              <div className="mt-5 rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm text-neutral-dark/60">
                Orders will appear here once buyers start checking out.
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-neutral-dark">Stock Levels</h3>
              <div className="mt-4 space-y-4">
                {stockLevelItems.map((listing) => (
                  <div key={listing.id}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                      <p className="font-semibold text-neutral-dark">{listing.name}</p>
                      <p className="text-xs font-semibold text-neutral-dark/60">
                        {listing.safeStock}/{listing.safeCapacity} ({listing.percentage}%)
                      </p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-dark/10">
                      <div
                        className={`h-full rounded-full ${
                          listing.isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, listing.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {stockLevelItems.length === 0 && (
                <div className="mt-4 rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm text-neutral-dark/60">
                  Add products in My Inventory to track stock levels.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <MaterialIcon className="text-lg text-amber-600" name="warning" />
                <h3 className="text-xl font-bold text-neutral-dark">Low Stock Alerts</h3>
              </div>
              <div className="mt-4 space-y-2">
                {lowStockItems.map((listing) => (
                  <div key={`low-${listing.id}`} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-semibold text-amber-800">{listing.name}</p>
                    <p className="mt-1 text-xs text-amber-700">
                      Remaining: {listing.safeStock} units ({listing.percentage}% available)
                    </p>
                  </div>
                ))}
              </div>

              {lowStockItems.length === 0 && (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  Great job. No low stock items right now.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default SellerDashboardSection
