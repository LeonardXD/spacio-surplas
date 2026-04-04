import { useState } from 'react'
import { roomTypes, sellerPlans } from '../data/homePageData'
import MaterialIcon from '../components/MaterialIcon'

const VIEW_TYPE_OPTIONS = [
  { value: 'standard', label: 'Standard photos' },
  { value: 'multi-angle', label: 'Multi-angle photos' },
  { value: '3d', label: 'Simplified 3D view' },
]

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

function SellersHubSection({
  currentSeller,
  sellerListings,
  onCreateListing,
}) {
  const sellerDisplayName = currentSeller?.businessName || currentSeller?.fullName || 'Your Shop'
  const activePlan = sellerPlans.find((plan) => plan.id === currentSeller?.sellerPlanId) ?? null

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
  })
  const [feedback, setFeedback] = useState({ kind: '', message: '' })

  function updateField(field, value) {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const parsedPrice = Number.parseFloat(formState.price)
    const parsedOldPrice = Number.parseFloat(formState.oldPrice)
    const parsedWidth = Number.parseFloat(formState.widthM)
    const parsedLength = Number.parseFloat(formState.lengthM)
    const parsedHeight = Number.parseFloat(formState.heightM)

    if (!formState.name || !formState.category || !formState.promoLabel) {
      setFeedback({ kind: 'error', message: 'Please complete all required text fields.' })
      return
    }

    if (
      !Number.isFinite(parsedPrice) ||
      !Number.isFinite(parsedWidth) ||
      !Number.isFinite(parsedLength) ||
      !Number.isFinite(parsedHeight)
    ) {
      setFeedback({
        kind: 'error',
        message: 'Price and dimensions must be valid numbers.',
      })
      return
    }

    onCreateListing({
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
    })

    setFeedback({ kind: 'success', message: 'Listing published successfully.' })
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
    })
  }

  const sortedListings = [...sellerListings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-primary/15 bg-neutral-dark p-6 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Seller Onboarding</p>
          <h2 className="mt-2 text-3xl font-black">7-14 Day Free Trial for New Sellers</h2>
          <p className="mt-3 max-w-3xl text-sm text-white/70 sm:text-base">
            Launch your storefront without upfront cost. Spacio Surplas only charges a monthly
            subscription after trial and a small commission for successful transactions.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            {sellerPlans.map((plan) => (
              <article
                key={plan.id}
                className={`rounded-xl border p-4 ${
                  activePlan?.id === plan.id
                    ? 'border-primary bg-primary/20'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-primary">{plan.name}</p>
                <p className="mt-1 text-lg font-black">PHP {plan.pricePerMonth.toLocaleString('en-PH')}/month</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-white/70">
                  {plan.freeTrialDays}-day free trial
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-xl font-bold text-neutral-dark">Create Furniture Listing</h3>
            <p className="mt-1 text-sm text-neutral-dark/60">
              Include dimensions and media type so buyers can see whether each item fits their space.
            </p>

            {feedback.message && (
              <div
                className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${
                  feedback.kind === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-green-200 bg-green-50 text-green-700'
                }`}
              >
                {feedback.message}
              </div>
            )}

            <form className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="seller-display-name">
                  Seller Profile
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  id="seller-display-name"
                  readOnly
                  type="text"
                  value={sellerDisplayName}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="item-name">
                  Item Name
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  id="item-name"
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="Compact 2-seat sofa"
                  type="text"
                  value={formState.name}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="item-category">
                  Category
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  id="item-category"
                  onChange={(event) => updateField('category', event.target.value)}
                  placeholder="Living Room"
                  type="text"
                  value={formState.category}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="item-room-type">
                  Room Type
                </label>
                <select
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  id="item-room-type"
                  onChange={(event) => updateField('roomType', event.target.value)}
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
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="item-width">
                  Width (m)
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  id="item-width"
                  min="0"
                  onChange={(event) => updateField('widthM', event.target.value)}
                  step="0.1"
                  type="number"
                  value={formState.widthM}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="item-length">
                  Length (m)
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  id="item-length"
                  min="0"
                  onChange={(event) => updateField('lengthM', event.target.value)}
                  step="0.1"
                  type="number"
                  value={formState.lengthM}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="item-height">
                  Height (m)
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  id="item-height"
                  min="0"
                  onChange={(event) => updateField('heightM', event.target.value)}
                  step="0.1"
                  type="number"
                  value={formState.heightM}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="item-price">
                  Price (PHP)
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  id="item-price"
                  min="0"
                  onChange={(event) => updateField('price', event.target.value)}
                  step="0.01"
                  type="number"
                  value={formState.price}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="item-old-price">
                  Old Price (optional)
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  id="item-old-price"
                  min="0"
                  onChange={(event) => updateField('oldPrice', event.target.value)}
                  step="0.01"
                  type="number"
                  value={formState.oldPrice}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="item-media-view">
                  Media Type
                </label>
                <select
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  id="item-media-view"
                  onChange={(event) => updateField('viewType', event.target.value)}
                  value={formState.viewType}
                >
                  {VIEW_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="item-promo">
                  Promo Label
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  id="item-promo"
                  onChange={(event) => updateField('promoLabel', event.target.value)}
                  placeholder="Summer discount"
                  type="text"
                  value={formState.promoLabel}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="item-image">
                  Image URL (optional)
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  id="item-image"
                  onChange={(event) => updateField('image', event.target.value)}
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
                  <MaterialIcon className="text-base" name="add_business" />
                  Publish Listing
                </button>
              </div>
            </form>
          </div>

          <aside className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-dark">Your Latest Listings</h3>
            <div className="mt-4 space-y-3">
              {sortedListings.slice(0, 6).map((listing) => (
                <div key={listing.id} className="rounded-lg border border-primary/10 p-3">
                  <p className="text-sm font-bold text-neutral-dark">{listing.name}</p>
                  <p className="text-xs text-neutral-dark/60">
                    {listing.roomType} | {formatMeters(listing.widthM)}m x {formatMeters(listing.lengthM)}m
                  </p>
                  <p className="mt-1 text-xs font-semibold text-primary">{formatCurrency(listing.price)}</p>
                </div>
              ))}
            </div>

            {sortedListings.length === 0 && (
              <div className="mt-4 rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm text-neutral-dark/60">
                Publish your first listing to appear in buyer search results.
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}

export default SellersHubSection
