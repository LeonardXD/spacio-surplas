import { useState } from 'react'
import MaterialIcon from '../components/MaterialIcon'

const STATUS_STYLES = {
  Pending: 'border-amber-200 bg-amber-50 text-amber-700',
  Shipped: 'border-blue-200 bg-blue-50 text-blue-700',
  Delivered: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

const NEXT_STATUS = {
  Pending: 'Shipped',
  Shipped: 'Delivered',
}

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

function OrdersSection({
  mode = 'buyer',
  orders,
  notifications = [],
  onAdvanceOrderStatus,
  onSubmitOrderReview,
}) {
  const showNotificationsPanel = mode === 'buyer'
  const [activeReviewOrderId, setActiveReviewOrderId] = useState(null)
  const [reviewDrafts, setReviewDrafts] = useState({})

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  function updateReviewDraft(orderId, field, value) {
    setReviewDrafts((prev) => ({
      ...prev,
      [orderId]: {
        rating: prev[orderId]?.rating ?? 5,
        comment: prev[orderId]?.comment ?? '',
        [field]: value,
      },
    }))
  }

  function openReviewForm(orderId, existingRating = 5) {
    setActiveReviewOrderId(orderId)
    setReviewDrafts((prev) => ({
      ...prev,
      [orderId]: prev[orderId] ?? {
        rating: existingRating,
        comment: '',
      },
    }))
  }

  function cancelReviewForm(orderId) {
    setActiveReviewOrderId(null)
    setReviewDrafts((prev) => {
      if (!(orderId in prev)) {
        return prev
      }

      const nextDrafts = { ...prev }
      delete nextDrafts[orderId]
      return nextDrafts
    })
  }

  function handleSubmitReview(order) {
    const draft = reviewDrafts[order.id]
    const rating = Number(draft?.rating)
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return
    }

    const didSubmit = onSubmitOrderReview?.(order.id, {
      rating: Math.round(rating),
      comment: draft?.comment ?? '',
    })

    if (didSubmit) {
      cancelReviewForm(order.id)
    }
  }

  return (
    <section className="bg-background-light py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 gap-8 ${
            showNotificationsPanel ? 'lg:grid-cols-[1.6fr_1fr]' : ''
          }`}
        >
          <div className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-primary/10 pb-4">
              <h2 className="text-2xl font-black text-neutral-dark">Order Tracking</h2>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-neutral-dark">
                {orders.length} total orders
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {sortedOrders.map((order) => {
                const isBuyerDeliveredOrder = mode === 'buyer' && order.status === 'Delivered'
                const hasBuyerReview =
                  typeof order.reviewRating === 'number' &&
                  order.reviewRating >= 1 &&
                  order.reviewRating <= 5
                const isReviewFormOpen = activeReviewOrderId === order.id
                const reviewDraft = reviewDrafts[order.id] ?? { rating: 5, comment: '' }

                return (
                  <article key={order.id} className="rounded-xl border border-primary/10 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-primary">Order #{order.id}</p>
                        <h3 className="mt-1 text-lg font-bold text-neutral-dark">{order.productName}</h3>
                        <p className="mt-1 text-sm text-neutral-dark/60">
                          Buyer: {order.buyerName} | Seller: {order.sellerName}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-neutral-dark/70 sm:grid-cols-2">
                      <p>Ordered: {formatDate(order.createdAt)}</p>
                      <p>Total: {formatCurrency(order.amount)}</p>
                      {order.roomWidthM && order.roomLengthM && (
                        <p className="sm:col-span-2">
                          Fit requirement: {formatMeters(order.roomWidthM)}m x {formatMeters(order.roomLengthM)}m
                        </p>
                      )}
                    </div>

                    {NEXT_STATUS[order.status] && (
                      mode === 'seller' ? (
                        <button
                          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-bold text-neutral-dark transition-colors hover:bg-primary/15"
                          onClick={() => onAdvanceOrderStatus(order.id)}
                          type="button"
                        >
                          <MaterialIcon className="text-base" name="local_shipping" />
                          Mark as {NEXT_STATUS[order.status]}
                        </button>
                      ) : null
                    )}

                    {isBuyerDeliveredOrder && !hasBuyerReview && !isReviewFormOpen && (
                      <button
                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-neutral-dark transition-colors hover:bg-primary/15"
                        onClick={() => openReviewForm(order.id)}
                        type="button"
                      >
                        <MaterialIcon className="text-base" name="rate_review" />
                        Leave Review
                      </button>
                    )}

                    {isBuyerDeliveredOrder && !hasBuyerReview && isReviewFormOpen && (
                      <div className="mt-4 rounded-lg border border-primary/15 bg-primary/5 p-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor={`review-rating-${order.id}`}>
                              Rating
                            </label>
                            <select
                              className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                              id={`review-rating-${order.id}`}
                              onChange={(event) => updateReviewDraft(order.id, 'rating', Number(event.target.value))}
                              value={reviewDraft.rating}
                            >
                              {[5, 4, 3, 2, 1].map((ratingValue) => (
                                <option key={`${order.id}-${ratingValue}`} value={ratingValue}>
                                  {ratingValue} / 5
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor={`review-comment-${order.id}`}>
                              Review (optional)
                            </label>
                            <textarea
                              className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                              id={`review-comment-${order.id}`}
                              onChange={(event) => updateReviewDraft(order.id, 'comment', event.target.value)}
                              placeholder="Share your experience with this product."
                              rows={3}
                              value={reviewDraft.comment}
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            className="inline-flex items-center gap-2 rounded-lg bg-neutral-dark px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-dark/90"
                            onClick={() => handleSubmitReview(order)}
                            type="button"
                          >
                            <MaterialIcon className="text-base" name="star" />
                            Submit Review
                          </button>
                          <button
                            className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-neutral-dark transition-colors hover:bg-primary/10"
                            onClick={() => cancelReviewForm(order.id)}
                            type="button"
                          >
                            <MaterialIcon className="text-base" name="close" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {isBuyerDeliveredOrder && hasBuyerReview && (
                      <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-sm font-bold text-emerald-800">
                          Your review: {order.reviewRating}/5
                        </p>
                        {order.reviewComment && (
                          <p className="mt-1 text-sm text-emerald-700">{order.reviewComment}</p>
                        )}
                        {order.reviewedAt && (
                          <p className="mt-1 text-xs text-emerald-700/80">
                            Submitted on {formatDate(order.reviewedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>

            {sortedOrders.length === 0 && (
              <div className="mt-6 rounded-xl border border-primary/10 bg-primary/5 p-6 text-center text-sm text-neutral-dark/70">
                {mode === 'seller'
                  ? 'Seller order updates will appear here once buyers place orders.'
                  : 'Place an order from the Browse Furniture module to start tracking updates here.'}
              </div>
            )}
          </div>

          {showNotificationsPanel && (
            <aside className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-lg font-bold text-neutral-dark">Buyer Notifications</h3>
              <p className="mt-1 text-sm text-neutral-dark/60">
                Live updates appear here whenever your order status changes.
              </p>

              <div className="mt-5 space-y-3">
                {sortedNotifications.slice(0, 8).map((notification) => (
                  <div key={notification.id} className="rounded-lg border border-primary/10 bg-primary/5 p-3">
                    <p className="text-sm font-medium text-neutral-dark">{notification.message}</p>
                    <p className="mt-1 text-xs text-neutral-dark/55">{formatDate(notification.createdAt)}</p>
                  </div>
                ))}
              </div>

              {sortedNotifications.length === 0 && (
                <div className="mt-5 rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm text-neutral-dark/60">
                  No buyer notifications yet.
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </section>
  )
}

export default OrdersSection
