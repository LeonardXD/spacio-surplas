import { useEffect, useMemo, useState } from 'react'
import { roomTypes } from '../data/homePageData'
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
    return '0'
  }

  return numericValue.toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

function getViewTypeLabel(viewType) {
  if (viewType === '3d') {
    return '3D View Ready'
  }

  if (viewType === 'multi-angle') {
    return 'Multi-angle Photos'
  }

  return 'Standard Photos'
}

function BrowseFurnitureSection({
  products,
  onAddToCart,
  buyerName = 'Guest Buyer',
  allowBuyerNameEdit = true,
}) {
  const [roomWidth, setRoomWidth] = useState('')
  const [roomLength, setRoomLength] = useState('')
  const [roomType, setRoomType] = useState('Any')
  const [keyword, setKeyword] = useState('')
  const [draftBuyerName, setDraftBuyerName] = useState(buyerName)

  useEffect(() => {
    setDraftBuyerName(buyerName)
  }, [buyerName])

  const roomWidthValue = Number.parseFloat(roomWidth)
  const roomLengthValue = Number.parseFloat(roomLength)
  const hasDimensionFilter =
    Number.isFinite(roomWidthValue) && roomWidthValue > 0 && Number.isFinite(roomLengthValue) && roomLengthValue > 0

  const filteredProducts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return products.filter((product) => {
      const matchesRoomType = roomType === 'Any' || product.roomType === roomType
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        (product.name ?? '').toLowerCase().includes(normalizedKeyword) ||
        (product.seller ?? '').toLowerCase().includes(normalizedKeyword) ||
        (product.category ?? '').toLowerCase().includes(normalizedKeyword)

      const fitsRoom =
        !hasDimensionFilter ||
        (product.widthM <= roomWidthValue && product.lengthM <= roomLengthValue)

      return matchesRoomType && matchesKeyword && fitsRoom
    })
  }, [hasDimensionFilter, keyword, products, roomLengthValue, roomType, roomWidthValue])

  return (
    <section className="bg-background-light py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-primary/15 bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="buyer-name">
                Buyer Name
              </label>
              <input
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                id="buyer-name"
                onChange={(event) => setDraftBuyerName(event.target.value)}
                placeholder="Who is ordering?"
                readOnly={!allowBuyerNameEdit}
                type="text"
                value={allowBuyerNameEdit ? draftBuyerName : buyerName}
              />
            </div>

            <div className="min-w-[160px] flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="room-width">
                Room Width (m)
              </label>
              <input
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                id="room-width"
                min="0"
                onChange={(event) => setRoomWidth(event.target.value)}
                placeholder="3.7"
                step="0.1"
                type="number"
                value={roomWidth}
              />
            </div>

            <div className="min-w-[160px] flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="room-length">
                Room Length (m)
              </label>
              <input
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                id="room-length"
                min="0"
                onChange={(event) => setRoomLength(event.target.value)}
                placeholder="4.6"
                step="0.1"
                type="number"
                value={roomLength}
              />
            </div>

            <div className="min-w-[170px] flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="room-type">
                Room Type
              </label>
              <select
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                id="room-type"
                onChange={(event) => setRoomType(event.target.value)}
                value={roomType}
              >
                {roomTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[220px] flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="browse-keyword">
                Search
              </label>
              <div className="relative">
                <MaterialIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" name="search" />
                <input
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
                  id="browse-keyword"
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Sofa, seller, category"
                  type="text"
                  value={keyword}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-neutral-dark/70">
            <span className="rounded-full bg-primary/15 px-3 py-1">{filteredProducts.length} furniture options found</span>
            {hasDimensionFilter && (
              <span className="rounded-full bg-neutral-dark/10 px-3 py-1">
                Showing items that fit within {formatMeters(roomWidthValue)}m x {formatMeters(roomLengthValue)}m
              </span>
            )}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const discount = product.oldPrice > product.price ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0
            const stockCount = Number(product.stockCount)
            const hasStockValue = Number.isFinite(stockCount)
            const isOutOfStock = hasStockValue && stockCount <= 0

            return (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border border-primary/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-background-light">
                  <img alt={product.name} className="h-full w-full object-cover" src={product.image} />
                  <span className="absolute left-3 top-3 rounded-full bg-neutral-dark px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {getViewTypeLabel(product.viewType)}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">{product.category}</p>
                  <h3 className="mt-1 text-xl font-bold text-neutral-dark">{product.name}</h3>
                  <p className="mt-1 text-sm text-neutral-dark/60">Seller: {product.seller}</p>

                  <div className="mt-3 rounded-lg bg-primary/5 p-3 text-sm text-neutral-dark/80">
                    Fits spaces at least {formatMeters(product.widthM)}m x {formatMeters(product.lengthM)}m (H: {formatMeters(product.heightM)}m)
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-2xl font-black text-neutral-dark">{formatCurrency(product.price)}</p>
                      {product.oldPrice > product.price && (
                        <p className="text-sm text-neutral-dark/45 line-through">{formatCurrency(product.oldPrice)}</p>
                      )}
                    </div>
                    {discount > 0 && (
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-neutral-dark">
                        Save {discount}%
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-primary/10 pt-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-neutral-dark/50">
                      {hasStockValue ? `${Math.max(0, Math.round(stockCount))} in stock` : product.promoLabel}
                    </span>
                    <button
                      className="rounded-lg bg-neutral-dark px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-dark/90 disabled:cursor-not-allowed disabled:bg-neutral-dark/40"
                      disabled={isOutOfStock}
                      onClick={() =>
                        onAddToCart(product, {
                          buyerName: (allowBuyerNameEdit ? draftBuyerName : buyerName).trim() || 'Guest Buyer',
                          roomWidthM: hasDimensionFilter ? roomWidthValue : null,
                          roomLengthM: hasDimensionFilter ? roomLengthValue : null,
                        })
                      }
                      type="button"
                    >
                      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="mt-10 rounded-2xl border border-primary/15 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-neutral-dark">No furniture matched your filters.</p>
            <p className="mt-2 text-sm text-neutral-dark/60">
              Try increasing your room dimensions or broadening your room type/search terms.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default BrowseFurnitureSection
