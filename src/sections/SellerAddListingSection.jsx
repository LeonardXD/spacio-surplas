import { useState } from 'react'
import MaterialIcon from '../components/MaterialIcon'
import { roomTypes } from '../data/homePageData'

const VIEW_TYPE_OPTIONS = [
  { value: 'standard', label: 'Standard photos' },
  { value: 'multi-angle', label: 'Multi-angle photos' },
  { value: '3d', label: 'Simplified 3D view' },
]

function normalizeNumber(value, fallback = 0) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return fallback
  }

  return numericValue
}

function SellerAddListingSection({ currentSeller, onCreateListing }) {
  const [formState, setFormState] = useState({
    name: '',
    category: '',
    roomType: 'Living Room',
    widthM: '',
    lengthM: '',
    heightM: '',
    price: '',
    oldPrice: '',
    image: '',
    promoLabel: '',
    viewType: 'standard',
    stockCount: '10',
  })
  const [formFeedback, setFormFeedback] = useState({ kind: '', message: '' })

  const sellerDisplayName = currentSeller?.businessName || currentSeller?.fullName || 'Your Shop'

  function updateFormField(field, value) {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  function handleCreateSubmit(event) {
    event.preventDefault()

    const parsedPrice = normalizeNumber(formState.price, NaN)
    const parsedOldPrice = normalizeNumber(formState.oldPrice, parsedPrice)
    const parsedWidth = normalizeNumber(formState.widthM, NaN)
    const parsedLength = normalizeNumber(formState.lengthM, NaN)
    const parsedHeight = normalizeNumber(formState.heightM, NaN)
    const parsedStockCount = Math.max(0, Math.round(normalizeNumber(formState.stockCount, NaN)))

    if (!formState.name || !formState.category || !formState.promoLabel) {
      setFormFeedback({ kind: 'error', message: 'Please complete all required text fields.' })
      return
    }

    if (
      !Number.isFinite(parsedPrice) ||
      !Number.isFinite(parsedWidth) ||
      !Number.isFinite(parsedLength) ||
      !Number.isFinite(parsedHeight) ||
      !Number.isFinite(parsedStockCount)
    ) {
      setFormFeedback({
        kind: 'error',
        message: 'Price, dimensions, and stock count must be valid numbers.',
      })
      return
    }

    onCreateListing?.({
      seller: sellerDisplayName,
      sellerOwnerEmail: currentSeller?.email ?? '',
      name: formState.name.trim(),
      category: formState.category.trim(),
      roomType: formState.roomType,
      widthM: parsedWidth,
      lengthM: parsedLength,
      heightM: parsedHeight,
      price: parsedPrice,
      oldPrice: Number.isFinite(parsedOldPrice) ? parsedOldPrice : parsedPrice,
      image:
        formState.image.trim() ||
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      promoLabel: formState.promoLabel.trim(),
      viewType: formState.viewType,
      stockCount: parsedStockCount,
    })

    setFormFeedback({ kind: 'success', message: 'Listing published to inventory.' })
    setFormState({
      name: '',
      category: '',
      roomType: 'Living Room',
      widthM: '',
      lengthM: '',
      heightM: '',
      price: '',
      oldPrice: '',
      image: '',
      promoLabel: '',
      viewType: 'standard',
      stockCount: '10',
    })
  }

  return (
    <section className="bg-background-light py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Add Listing</p>
          <h2 className="mt-2 text-3xl font-black text-neutral-dark">Create New Product Listing</h2>
          <p className="mt-2 text-sm text-neutral-dark/60">
            Publish new products here, then manage all existing items in My Inventory.
          </p>
        </div>

        <div className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-xl font-bold text-neutral-dark">Add New Listing</h3>
          <p className="mt-1 text-sm text-neutral-dark/60">
            Seller account: <span className="font-semibold">{sellerDisplayName}</span>
          </p>

          {formFeedback.message && (
            <div
              className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${
                formFeedback.kind === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-green-200 bg-green-50 text-green-700'
              }`}
            >
              {formFeedback.message}
            </div>
          )}

          <form className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleCreateSubmit}>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="add-listing-item-name">
                Item Name
              </label>
              <input
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                id="add-listing-item-name"
                onChange={(event) => updateFormField('name', event.target.value)}
                placeholder="Compact 2-seat sofa"
                type="text"
                value={formState.name}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="add-listing-item-category">
                Category
              </label>
              <input
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                id="add-listing-item-category"
                onChange={(event) => updateFormField('category', event.target.value)}
                placeholder="Living Room"
                type="text"
                value={formState.category}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="add-listing-room-type">
                Room Type
              </label>
              <select
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                id="add-listing-room-type"
                onChange={(event) => updateFormField('roomType', event.target.value)}
                value={formState.roomType}
              >
                {roomTypes
                  .filter((type) => type !== 'Any')
                  .map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="add-listing-width">
                Width (m)
              </label>
              <input
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                id="add-listing-width"
                min="0"
                onChange={(event) => updateFormField('widthM', event.target.value)}
                step="0.1"
                type="number"
                value={formState.widthM}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="add-listing-length">
                Length (m)
              </label>
              <input
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                id="add-listing-length"
                min="0"
                onChange={(event) => updateFormField('lengthM', event.target.value)}
                step="0.1"
                type="number"
                value={formState.lengthM}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="add-listing-height">
                Height (m)
              </label>
              <input
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                id="add-listing-height"
                min="0"
                onChange={(event) => updateFormField('heightM', event.target.value)}
                step="0.1"
                type="number"
                value={formState.heightM}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="add-listing-price">
                Price (PHP)
              </label>
              <input
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                id="add-listing-price"
                min="0"
                onChange={(event) => updateFormField('price', event.target.value)}
                step="0.01"
                type="number"
                value={formState.price}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="add-listing-old-price">
                Old Price
              </label>
              <input
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                id="add-listing-old-price"
                min="0"
                onChange={(event) => updateFormField('oldPrice', event.target.value)}
                step="0.01"
                type="number"
                value={formState.oldPrice}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="add-listing-stock">
                Stock Count
              </label>
              <input
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                id="add-listing-stock"
                min="0"
                onChange={(event) => updateFormField('stockCount', event.target.value)}
                step="1"
                type="number"
                value={formState.stockCount}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="add-listing-media-view">
                Media Type
              </label>
              <select
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                id="add-listing-media-view"
                onChange={(event) => updateFormField('viewType', event.target.value)}
                value={formState.viewType}
              >
                {VIEW_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="add-listing-promo-label">
                Promo Label
              </label>
              <input
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                id="add-listing-promo-label"
                onChange={(event) => updateFormField('promoLabel', event.target.value)}
                placeholder="Limited inventory markdown"
                type="text"
                value={formState.promoLabel}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="add-listing-image-url">
                Image URL (optional)
              </label>
              <input
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                id="add-listing-image-url"
                onChange={(event) => updateFormField('image', event.target.value)}
                placeholder="https://..."
                type="url"
                value={formState.image}
              />
            </div>

            <div className="sm:col-span-2">
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-dark px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-neutral-dark/90"
                type="submit"
              >
                <MaterialIcon className="text-base" name="playlist_add" />
                Publish Listing
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default SellerAddListingSection
