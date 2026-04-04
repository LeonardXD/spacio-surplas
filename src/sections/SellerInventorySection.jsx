import { useMemo, useState } from 'react'
import MaterialIcon from '../components/MaterialIcon'

function formatCurrency(value) {
  const numericValue = Number(value)
  const normalizedValue = Number.isFinite(numericValue) ? numericValue : 0
  return `PHP ${normalizedValue.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function normalizeNumber(value, fallback = 0) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return fallback
  }

  return numericValue
}

function getDraftFromListing(listing) {
  return {
    name: listing.name ?? '',
    category: listing.category ?? '',
    price: String(listing.price ?? ''),
    oldPrice: String(listing.oldPrice ?? ''),
    stockCount: String(listing.stockCount ?? 0),
    promoLabel: listing.promoLabel ?? '',
  }
}

function mergeListingDraft(listing, draft) {
  return {
    ...getDraftFromListing(listing),
    ...(draft ?? {}),
  }
}

function SellerInventorySection({ sellerListings = [], onUpdateListing }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [inventoryFeedback, setInventoryFeedback] = useState({ kind: '', message: '' })
  const [listingDrafts, setListingDrafts] = useState({})
  const [expandedListingId, setExpandedListingId] = useState(null)

  const filteredListings = useMemo(() => {
    const normalizedKeyword = searchTerm.trim().toLowerCase()
    const sortedListings = [...sellerListings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    if (!normalizedKeyword) {
      return sortedListings
    }

    return sortedListings.filter((listing) =>
      [listing.name, listing.category, listing.promoLabel, listing.roomType]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(normalizedKeyword)),
    )
  }, [searchTerm, sellerListings])

  function updateListingDraft(listingId, field, value) {
    setListingDrafts((prev) => ({
      ...prev,
      [listingId]: {
        ...(prev[listingId] ?? {}),
        [field]: value,
      },
    }))
  }

  function clearListingDraft(listingId) {
    setListingDrafts((prev) => {
      if (!(listingId in prev)) {
        return prev
      }

      const nextDrafts = { ...prev }
      delete nextDrafts[listingId]
      return nextDrafts
    })
  }

  function handleToggleListingEditor(listingId) {
    setExpandedListingId((previousListingId) =>
      previousListingId === listingId ? null : listingId,
    )
  }

  function handleCancelEdit(listingId) {
    clearListingDraft(listingId)
    setExpandedListingId(null)
  }

  function handleSaveListing(listing) {
    const draft = mergeListingDraft(listing, listingDrafts[listing.id])
    const parsedPrice = normalizeNumber(draft.price, NaN)
    const parsedOldPrice = normalizeNumber(draft.oldPrice, parsedPrice)
    const parsedStockCount = Math.max(0, Math.round(normalizeNumber(draft.stockCount, NaN)))

    if (!draft.name?.trim() || !draft.category?.trim() || !draft.promoLabel?.trim()) {
      setInventoryFeedback({
        kind: 'error',
        message: 'Name, category, and promo label are required when saving inventory updates.',
      })
      return
    }

    if (
      !Number.isFinite(parsedPrice) ||
      !Number.isFinite(parsedOldPrice) ||
      !Number.isFinite(parsedStockCount)
    ) {
      setInventoryFeedback({
        kind: 'error',
        message: 'Price and stock values must be valid numbers.',
      })
      return
    }

    const didUpdate = onUpdateListing?.(listing.id, {
      name: draft.name.trim(),
      category: draft.category.trim(),
      price: parsedPrice,
      oldPrice: parsedOldPrice,
      stockCount: parsedStockCount,
      promoLabel: draft.promoLabel.trim(),
    })

    if (didUpdate) {
      setInventoryFeedback({
        kind: 'success',
        message: `Saved changes for "${draft.name.trim()}".`,
      })
    }
  }

  return (
    <section className="bg-background-light py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">My Inventory</p>
          <h2 className="mt-2 text-3xl font-black text-neutral-dark">Manage Existing Listings</h2>
          <p className="mt-2 text-sm text-neutral-dark/60">
            Update product details, prices, and stock. Use the Add Listing page in the sidebar to publish new items.
          </p>
        </div>

        <aside className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-neutral-dark">Inventory List</h3>
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-neutral-dark">
              {filteredListings.length} item{filteredListings.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="inventory-search">
              Search Inventory
            </label>
            <div className="relative">
              <MaterialIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" name="search" />
              <input
                className="w-full rounded-lg border border-primary/20 bg-primary/5 py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
                id="inventory-search"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by item, category, promo, room"
                type="text"
                value={searchTerm}
              />
            </div>
          </div>

          {inventoryFeedback.message && (
            <div
              className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${
                inventoryFeedback.kind === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-green-200 bg-green-50 text-green-700'
              }`}
            >
              {inventoryFeedback.message}
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredListings.map((listing) => {
              const draft = mergeListingDraft(listing, listingDrafts[listing.id])
              const isExpanded = expandedListingId === listing.id

              return (
                <article
                  key={listing.id}
                  className={`rounded-xl border border-primary/10 p-3 sm:p-4 ${
                    isExpanded ? 'md:col-span-2 xl:col-span-3' : ''
                  }`}
                >
                  <button
                    aria-expanded={isExpanded}
                    className="w-full rounded-lg p-2 text-left transition-colors hover:bg-primary/5"
                    onClick={() => handleToggleListingEditor(listing.id)}
                    type="button"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-background-light">
                      {listing.image ? (
                        <img alt={listing.name} className="h-full w-full object-cover" src={listing.image} />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs font-semibold text-neutral-dark/50">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-neutral-dark">{listing.name}</p>
                        <p className="mt-1 text-xs text-neutral-dark/60">
                          {listing.category} | Stock: {listing.stockCount ?? 0}
                        </p>
                      </div>
                      <MaterialIcon
                        className={`text-lg text-neutral-dark/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        name="expand_more"
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-neutral-dark">{formatCurrency(listing.price)}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                        {isExpanded ? 'Hide editor' : 'Edit item'}
                      </p>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 border-t border-primary/10 pt-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor={`inv-name-${listing.id}`}>
                            Name
                          </label>
                          <input
                            className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                            id={`inv-name-${listing.id}`}
                            onChange={(event) => updateListingDraft(listing.id, 'name', event.target.value)}
                            type="text"
                            value={draft.name}
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor={`inv-category-${listing.id}`}>
                            Category
                          </label>
                          <input
                            className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                            id={`inv-category-${listing.id}`}
                            onChange={(event) => updateListingDraft(listing.id, 'category', event.target.value)}
                            type="text"
                            value={draft.category}
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor={`inv-price-${listing.id}`}>
                            Price
                          </label>
                          <input
                            className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                            id={`inv-price-${listing.id}`}
                            min="0"
                            onChange={(event) => updateListingDraft(listing.id, 'price', event.target.value)}
                            step="0.01"
                            type="number"
                            value={draft.price}
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor={`inv-old-price-${listing.id}`}>
                            Old Price
                          </label>
                          <input
                            className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                            id={`inv-old-price-${listing.id}`}
                            min="0"
                            onChange={(event) => updateListingDraft(listing.id, 'oldPrice', event.target.value)}
                            step="0.01"
                            type="number"
                            value={draft.oldPrice}
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor={`inv-stock-${listing.id}`}>
                            Stock Count
                          </label>
                          <input
                            className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                            id={`inv-stock-${listing.id}`}
                            min="0"
                            onChange={(event) => updateListingDraft(listing.id, 'stockCount', event.target.value)}
                            step="1"
                            type="number"
                            value={draft.stockCount}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor={`inv-promo-${listing.id}`}>
                            Promo Label
                          </label>
                          <input
                            className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                            id={`inv-promo-${listing.id}`}
                            onChange={(event) => updateListingDraft(listing.id, 'promoLabel', event.target.value)}
                            type="text"
                            value={draft.promoLabel}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-primary/10 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-dark/55">
                          Current price: {formatCurrency(draft.price)}
                        </p>

                        <div className="flex items-center gap-2">
                          <button
                            className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-neutral-dark transition-colors hover:bg-primary/15"
                            onClick={() => handleCancelEdit(listing.id)}
                            type="button"
                          >
                            <MaterialIcon className="text-base" name="close" />
                            Cancel
                          </button>

                          <button
                            className="inline-flex items-center gap-2 rounded-lg bg-neutral-dark px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-dark/90"
                            onClick={() => handleSaveListing(listing)}
                            type="button"
                          >
                            <MaterialIcon className="text-base" name="save" />
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          {filteredListings.length === 0 && (
            <div className="mt-5 rounded-lg border border-primary/10 bg-primary/5 p-5 text-sm text-neutral-dark/60">
              No inventory items matched your search.
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

export default SellerInventorySection
