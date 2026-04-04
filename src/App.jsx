import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  categories,
  featuredProducts,
  marketplaceSeedProducts,
  steps,
} from './data/homePageData'
import AboutSection from './sections/AboutSection'
import AuthSection from './sections/AuthSection'
import BrowseFurnitureSection from './sections/BrowseFurnitureSection'
import CartSection from './sections/CartSection'
import FeaturedCategories from './sections/FeaturedCategories'
import FeaturedDeals from './sections/FeaturedDeals'
import Footer from './sections/Footer'
import HeroSection from './sections/HeroSection'
import HowItWorks from './sections/HowItWorks'
import Navbar from './sections/Navbar'
import OrdersSection from './sections/OrdersSection'
import SellerCta from './sections/SellerCta'
import SellerAddListingSection from './sections/SellerAddListingSection'
import SellerDashboardSection from './sections/SellerDashboardSection'
import SellerInventorySection from './sections/SellerInventorySection'
import SellerSidebarLayout from './sections/SellerSidebarLayout'
import VirtualRoomPlannerSection from './sections/VirtualRoomPlannerSection'

const SELLER_LISTINGS_STORAGE_KEY = 'spacio_surplas_seller_listings'
const ORDERS_STORAGE_KEY = 'spacio_surplas_orders'
const CART_STORAGE_KEY = 'spacio_surplas_cart_items'
const NOTIFICATIONS_STORAGE_KEY = 'spacio_surplas_notifications'
const SESSION_STORAGE_KEY = 'spacio_surplas_current_user'

const NEXT_ORDER_STATUS = {
  Pending: 'Shipped',
  Shipped: 'Delivered',
}

const FEET_TO_METERS = 0.3048
const DEFAULT_STOCK_CAPACITY = 20
const DEFAULT_SELLER_RATING = 4.6

function getRouteFromPath(pathname) {
  if (pathname === '/seller/login') {
    return { view: 'auth', authMode: 'login', authRole: 'seller' }
  }

  if (pathname === '/seller/register') {
    return { view: 'auth', authMode: 'register', authRole: 'seller' }
  }

  if (pathname === '/buyer/login' || pathname === '/login') {
    return { view: 'auth', authMode: 'login', authRole: 'buyer' }
  }

  if (pathname === '/buyer/register' || pathname === '/register') {
    return { view: 'auth', authMode: 'register', authRole: 'buyer' }
  }

  if (pathname === '/browse') {
    return { view: 'browse', authMode: 'login', authRole: 'buyer' }
  }

  if (pathname === '/planner') {
    return { view: 'planner', authMode: 'login', authRole: 'buyer' }
  }

  if (pathname === '/cart') {
    return { view: 'cart', authMode: 'login', authRole: 'buyer' }
  }

  if (pathname === '/orders') {
    return { view: 'orders', authMode: 'login', authRole: 'buyer' }
  }

  if (pathname === '/dashboard' || pathname === '/sellers') {
    return { view: 'dashboard', authMode: 'login', authRole: 'seller' }
  }

  if (pathname === '/inventory') {
    return { view: 'inventory', authMode: 'login', authRole: 'seller' }
  }

  if (pathname === '/add-listing') {
    return { view: 'add-listing', authMode: 'login', authRole: 'seller' }
  }

  if (pathname === '/about') {
    return { view: 'about', authMode: 'login', authRole: 'buyer' }
  }

  return { view: 'home', authMode: 'login', authRole: 'buyer' }
}

function getPathFromRoute(view, authMode, authRole = 'buyer') {
  if (view === 'auth' && authRole === 'seller' && authMode === 'register') {
    return '/seller/register'
  }

  if (view === 'auth' && authRole === 'seller') {
    return '/seller/login'
  }

  if (view === 'auth' && authMode === 'register') {
    return '/buyer/register'
  }

  if (view === 'auth') {
    return '/buyer/login'
  }

  if (view === 'browse') {
    return '/browse'
  }

  if (view === 'planner') {
    return '/planner'
  }

  if (view === 'cart') {
    return '/cart'
  }

  if (view === 'orders') {
    return '/orders'
  }

  if (view === 'dashboard') {
    return '/dashboard'
  }

  if (view === 'inventory') {
    return '/inventory'
  }

  if (view === 'add-listing') {
    return '/add-listing'
  }

  if (view === 'about') {
    return '/about'
  }

  return '/'
}

function readStoredArray(key) {
  try {
    const storedValue = localStorage.getItem(key)
    if (!storedValue) {
      return []
    }

    const parsedValue = JSON.parse(storedValue)
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

function readStoredSession() {
  try {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY)
    return rawSession ? JSON.parse(rawSession) : null
  } catch {
    return null
  }
}

function createUniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function normalizeDimensionValue(value) {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return undefined
  }

  return Number(numericValue.toFixed(2))
}

function convertFeetToMeters(value) {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return undefined
  }

  return Number((numericValue * FEET_TO_METERS).toFixed(2))
}

function resolveDimensionInMeters(metricValue, legacyFeetValue) {
  const normalizedMetricValue = normalizeDimensionValue(metricValue)
  if (normalizedMetricValue !== undefined) {
    return normalizedMetricValue
  }

  return convertFeetToMeters(legacyFeetValue)
}

function normalizeIntegerValue(value, fallback = 0) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return fallback
  }

  return Math.max(0, Math.round(numericValue))
}

function normalizeRatingValue(value, fallback = DEFAULT_SELLER_RATING) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return fallback
  }

  if (numericValue < 0) {
    return 0
  }

  if (numericValue > 5) {
    return 5
  }

  return Number(numericValue.toFixed(1))
}

function normalizeReviewRating(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return null
  }

  if (numericValue < 1 || numericValue > 5) {
    return null
  }

  return Math.round(numericValue)
}

function resolveStockCapacity(stockCount, stockCapacity) {
  const normalizedStockCount = normalizeIntegerValue(stockCount, 0)
  const normalizedCapacity = normalizeIntegerValue(stockCapacity, DEFAULT_STOCK_CAPACITY)
  return Math.max(normalizedStockCount, normalizedCapacity, DEFAULT_STOCK_CAPACITY)
}

function normalizeStoredSellerListing(listing) {
  if (!listing || typeof listing !== 'object') {
    return listing
  }

  const stockCount = normalizeIntegerValue(
    listing.stockCount ?? listing.quantity ?? listing.stock ?? 0,
    0,
  )
  const stockCapacity = resolveStockCapacity(stockCount, listing.stockCapacity)
  const reviewCount = normalizeIntegerValue(listing.reviewCount, 0)
  const rawRatingTotal = Number(listing.ratingTotal)
  const ratingTotal = Number.isFinite(rawRatingTotal)
    ? Math.max(0, rawRatingTotal)
    : reviewCount > 0
      ? normalizeRatingValue(listing.averageRating, 0) * reviewCount
      : 0
  const averageRating = reviewCount > 0 ? Number((ratingTotal / reviewCount).toFixed(1)) : 0

  return {
    ...listing,
    widthM: resolveDimensionInMeters(listing.widthM, listing.widthFt),
    lengthM: resolveDimensionInMeters(listing.lengthM, listing.lengthFt),
    heightM: resolveDimensionInMeters(listing.heightM, listing.heightFt),
    stockCount,
    stockCapacity,
    averageRating,
    reviewCount,
    ratingTotal: Number(ratingTotal.toFixed(2)),
    storeVisits: normalizeIntegerValue(listing.storeVisits, 0),
  }
}

function normalizeStoredOrder(order) {
  if (!order || typeof order !== 'object') {
    return order
  }

  const roomWidthM = resolveDimensionInMeters(order.roomWidthM, order.roomWidthFt)
  const roomLengthM = resolveDimensionInMeters(order.roomLengthM, order.roomLengthFt)

  return {
    ...order,
    roomWidthM: roomWidthM ?? null,
    roomLengthM: roomLengthM ?? null,
    reviewRating: normalizeReviewRating(order.reviewRating),
    reviewComment: typeof order.reviewComment === 'string' ? order.reviewComment : '',
    reviewedAt: typeof order.reviewedAt === 'string' ? order.reviewedAt : null,
  }
}

function normalizeStoredCartItem(item) {
  if (!item || typeof item !== 'object') {
    return item
  }

  return {
    ...item,
    quantity: normalizeIntegerValue(item.quantity, 1),
    price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
    roomWidthM: resolveDimensionInMeters(item.roomWidthM, item.roomWidthFt) ?? null,
    roomLengthM: resolveDimensionInMeters(item.roomLengthM, item.roomLengthFt) ?? null,
  }
}

function getUserRole(user) {
  return user?.role ?? null
}

function isViewAllowed(view, user) {
  const role = getUserRole(user)

  if (view === 'home' || view === 'about') {
    return true
  }

  if (view === 'auth') {
    return !user
  }

  if (view === 'browse') {
    return role === 'buyer'
  }

  if (view === 'planner') {
    return role === 'buyer'
  }

  if (view === 'cart') {
    return role === 'buyer'
  }

  if (view === 'dashboard' || view === 'inventory' || view === 'add-listing') {
    return role === 'seller'
  }

  if (view === 'orders') {
    return role === 'buyer' || role === 'seller'
  }

  return true
}

function App() {
  const initialRoute = getRouteFromPath(window.location.pathname)
  const [view, setView] = useState(initialRoute.view)
  const [authMode, setAuthMode] = useState(initialRoute.authMode)
  const [authRole, setAuthRole] = useState(initialRoute.authRole ?? 'buyer')
  const [currentUser, setCurrentUser] = useState(() => readStoredSession())
  const [sellerListings, setSellerListings] = useState(() =>
    readStoredArray(SELLER_LISTINGS_STORAGE_KEY).map((listing) =>
      normalizeStoredSellerListing(listing),
    ),
  )
  const [orders, setOrders] = useState(() =>
    readStoredArray(ORDERS_STORAGE_KEY).map((order) => normalizeStoredOrder(order)),
  )
  const [cartItems, setCartItems] = useState(() =>
    readStoredArray(CART_STORAGE_KEY).map((item) => normalizeStoredCartItem(item)),
  )
  const [notifications, setNotifications] = useState(() => readStoredArray(NOTIFICATIONS_STORAGE_KEY))

  const sellerDisplayName = currentUser?.businessName || currentUser?.fullName || ''

  useEffect(() => {
    function handlePopState() {
      const route = getRouteFromPath(window.location.pathname)
      setView(route.view)
      setAuthMode(route.authMode)
      setAuthRole(route.authRole ?? 'buyer')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    localStorage.setItem(SELLER_LISTINGS_STORAGE_KEY, JSON.stringify(sellerListings))
  }, [sellerListings])

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser))
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    }
  }, [currentUser])

  const navigate = useCallback((nextView, nextAuthMode = 'login', nextAuthRole = authRole ?? 'buyer') => {
    const nextPath = getPathFromRoute(nextView, nextAuthMode, nextAuthRole)
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }

    setView(nextView)
    setAuthMode(nextAuthMode)
    setAuthRole(nextAuthRole)
  }, [authRole])

  const marketplaceProducts = useMemo(
    () => [...marketplaceSeedProducts, ...sellerListings],
    [sellerListings],
  )

  const buyerOrders = useMemo(() => {
    if (currentUser?.role !== 'buyer') {
      return []
    }

    return orders.filter((order) => {
      if (order.buyerEmail) {
        return order.buyerEmail === currentUser.email
      }

      return order.buyerName === currentUser.fullName
    })
  }, [currentUser, orders])

  const buyerCartItems = useMemo(() => {
    if (currentUser?.role !== 'buyer') {
      return []
    }

    return cartItems.filter((item) => {
      if (item.buyerEmail) {
        return item.buyerEmail === currentUser.email
      }

      return item.buyerName === currentUser.fullName
    })
  }, [cartItems, currentUser])

  const buyerCartItemCount = useMemo(
    () => buyerCartItems.reduce((count, item) => count + normalizeIntegerValue(item.quantity, 1), 0),
    [buyerCartItems],
  )

  const sellerOrders = useMemo(() => {
    if (currentUser?.role !== 'seller') {
      return []
    }

    return orders.filter((order) => {
      if (order.sellerOwnerEmail) {
        return order.sellerOwnerEmail === currentUser.email
      }

      return order.sellerName === sellerDisplayName
    })
  }, [currentUser, orders, sellerDisplayName])

  const buyerNotifications = useMemo(() => {
    if (currentUser?.role !== 'buyer') {
      return []
    }

    return notifications.filter((notification) => {
      if (notification.audience !== 'buyer') {
        return false
      }

      if (!notification.targetEmail) {
        return true
      }

      return notification.targetEmail === currentUser.email
    })
  }, [currentUser, notifications])

  const sellerNotifications = useMemo(() => {
    if (currentUser?.role !== 'seller') {
      return []
    }

    const currentSellerEmail = currentUser.email

    return notifications.filter((notification) => {
      if (notification.audience !== 'seller') {
        return false
      }

      if (!notification.targetEmail) {
        const hiddenForEmails = Array.isArray(notification.hiddenForEmails)
          ? notification.hiddenForEmails
          : []
        return !hiddenForEmails.includes(currentSellerEmail)
      }

      if (notification.targetEmail !== currentSellerEmail) {
        return false
      }

      const hiddenForEmails = Array.isArray(notification.hiddenForEmails)
        ? notification.hiddenForEmails
        : []
      return !hiddenForEmails.includes(currentSellerEmail)
    })
  }, [currentUser, notifications])

  const ownedSellerListings = useMemo(() => {
    if (currentUser?.role !== 'seller') {
      return []
    }

    return sellerListings.filter((listing) => {
      if (listing.sellerOwnerEmail) {
        return listing.sellerOwnerEmail === currentUser.email
      }

      return listing.seller === sellerDisplayName
    })
  }, [currentUser, sellerDisplayName, sellerListings])

  const resolvedView = useMemo(() => {
    if (currentUser?.role === 'seller' && view === 'home') {
      return 'dashboard'
    }

    if (isViewAllowed(view, currentUser)) {
      return view
    }

    if (!currentUser) {
      return 'auth'
    }

    return currentUser.role === 'seller' ? 'dashboard' : 'browse'
  }, [currentUser, view])

  const isSellerTargetView =
    view === 'dashboard' || view === 'inventory' || view === 'add-listing'
  const resolvedAuthMode = resolvedView === 'auth' ? authMode : 'login'
  const resolvedAuthRole = resolvedView === 'auth'
    ? (!currentUser && isSellerTargetView ? 'seller' : authRole)
    : authRole
  const isSellerInterface = currentUser?.role === 'seller' && resolvedView !== 'auth'

  function addNotification(audience, message, orderId = null, targetEmail = '') {
    const notification = {
      id: createUniqueId('notif'),
      audience,
      message,
      orderId,
      targetEmail,
      createdAt: new Date().toISOString(),
    }

    setNotifications((prev) => [notification, ...prev])
  }

  function handleCreateListing(listingPayload) {
    if (currentUser?.role !== 'seller') {
      return
    }

    const parsedStockCount = normalizeIntegerValue(listingPayload.stockCount, 0)
    const listing = {
      ...listingPayload,
      id: createUniqueId('listing'),
      createdAt: new Date().toISOString(),
      stockCount: parsedStockCount,
      stockCapacity: resolveStockCapacity(parsedStockCount, listingPayload.stockCapacity),
      averageRating: normalizeRatingValue(listingPayload.averageRating, 0),
      reviewCount: normalizeIntegerValue(listingPayload.reviewCount, 0),
      ratingTotal: Number.isFinite(Number(listingPayload.ratingTotal))
        ? Number(Number(listingPayload.ratingTotal).toFixed(2))
        : 0,
      storeVisits: normalizeIntegerValue(listingPayload.storeVisits, 0),
    }

    setSellerListings((prev) => [listing, ...prev])
    addNotification(
      'seller',
      `Listing "${listing.name}" is now live in Browse Furniture.`,
      null,
      currentUser.email,
    )
  }

  function handleUpdateListing(listingId, listingPayload) {
    if (currentUser?.role !== 'seller') {
      return false
    }

    let isUpdated = false

    setSellerListings((prev) =>
      prev.map((listing) => {
        if (listing.id !== listingId) {
          return listing
        }

        isUpdated = true
        const nextStockCount = normalizeIntegerValue(
          listingPayload.stockCount ?? listing.stockCount,
          listing.stockCount ?? 0,
        )
        const nextStockCapacity = resolveStockCapacity(
          nextStockCount,
          listingPayload.stockCapacity ?? listing.stockCapacity,
        )

        return {
          ...listing,
          ...listingPayload,
          stockCount: nextStockCount,
          stockCapacity: nextStockCapacity,
          averageRating: normalizeRatingValue(
            listingPayload.averageRating ?? listing.averageRating,
            listing.averageRating ?? DEFAULT_SELLER_RATING,
          ),
          storeVisits: normalizeIntegerValue(
            listingPayload.storeVisits ?? listing.storeVisits,
            listing.storeVisits ?? 0,
          ),
          price: Number.isFinite(Number(listingPayload.price))
            ? Number(listingPayload.price)
            : listing.price,
          oldPrice: Number.isFinite(Number(listingPayload.oldPrice))
            ? Number(listingPayload.oldPrice)
            : listing.oldPrice,
        }
      }),
    )

    if (isUpdated) {
      addNotification(
        'seller',
        `Inventory item "${listingPayload.name ?? listingId}" has been updated.`,
        null,
        currentUser.email,
      )
    }

    return isUpdated
  }

  function addNotificationsBatch(entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
      return
    }

    setNotifications((prev) => [...entries, ...prev])
  }

  function createOrderFromCartItem(cartItem) {
    return {
      id: createUniqueId('order'),
      productId: cartItem.productId,
      productName: cartItem.productName,
      sellerName: cartItem.sellerName,
      sellerOwnerEmail: cartItem.sellerOwnerEmail ?? '',
      buyerName: cartItem.buyerName || currentUser?.fullName || 'Guest Buyer',
      buyerEmail: cartItem.buyerEmail ?? currentUser?.email ?? '',
      amount: Number(cartItem.price) * Number(cartItem.quantity),
      status: 'Pending',
      roomWidthM: cartItem.roomWidthM ?? null,
      roomLengthM: cartItem.roomLengthM ?? null,
      reviewRating: null,
      reviewComment: '',
      reviewedAt: null,
      createdAt: new Date().toISOString(),
    }
  }

  function buildOrderNotifications(order) {
    const queuedNotifications = [
      {
        id: createUniqueId('notif'),
        audience: 'buyer',
        message: `Order #${order.id} placed for ${order.productName}. Current status: Pending.`,
        orderId: order.id,
        targetEmail: order.buyerEmail,
        createdAt: new Date().toISOString(),
      },
    ]

    if (order.sellerOwnerEmail) {
      queuedNotifications.push({
        id: createUniqueId('notif'),
        audience: 'seller',
        message: `New order #${order.id} received for ${order.productName} from ${order.buyerName}.`,
        orderId: order.id,
        targetEmail: order.sellerOwnerEmail,
        createdAt: new Date().toISOString(),
      })
    }

    return queuedNotifications
  }

  function decreaseStockForOrders(orderList) {
    if (!Array.isArray(orderList) || orderList.length === 0) {
      return
    }

    const quantityByProductId = orderList.reduce((accumulator, order) => {
      if (!order.productId) {
        return accumulator
      }

      const previousQuantity = accumulator.get(order.productId) ?? 0
      accumulator.set(order.productId, previousQuantity + 1)
      return accumulator
    }, new Map())

    if (quantityByProductId.size === 0) {
      return
    }

    setSellerListings((prev) =>
      prev.map((listing) => {
        const quantityToDeduct = quantityByProductId.get(listing.id)
        if (!quantityToDeduct) {
          return listing
        }

        return {
          ...listing,
          stockCount: Math.max(0, normalizeIntegerValue(listing.stockCount, 0) - quantityToDeduct),
        }
      }),
    )
  }

  function handleAddToCart(product, context = {}) {
    if (currentUser?.role !== 'buyer') {
      openLogin('buyer')
      return
    }

    const hasStockInfo = Number.isFinite(Number(product.stockCount))
    if (hasStockInfo && Number(product.stockCount) <= 0) {
      return
    }

    const cartItem = {
      id: createUniqueId('cart'),
      productId: product.id,
      productName: product.name ?? 'Product',
      sellerName: product.seller ?? 'Unknown Seller',
      sellerOwnerEmail: product.sellerOwnerEmail ?? '',
      buyerName: context.buyerName || currentUser.fullName,
      buyerEmail: currentUser.email,
      image: product.image ?? '',
      price: Number.isFinite(Number(product.price)) ? Number(product.price) : 0,
      promoLabel: product.promoLabel ?? '',
      roomWidthM: context.roomWidthM ?? null,
      roomLengthM: context.roomLengthM ?? null,
      quantity: 1,
      addedAt: new Date().toISOString(),
    }

    setCartItems((prev) => [cartItem, ...prev])
  }

  function handleRemoveCartItem(cartItemId) {
    if (currentUser?.role !== 'buyer') {
      return
    }

    setCartItems((prev) =>
      prev.filter((item) => {
        if (item.id !== cartItemId) {
          return true
        }

        if (item.buyerEmail) {
          return item.buyerEmail !== currentUser.email
        }

        return false
      }),
    )
  }

  function handleCheckoutCartItem(cartItemId) {
    if (currentUser?.role !== 'buyer') {
      openLogin('buyer')
      return
    }

    const cartItem = buyerCartItems.find((item) => item.id === cartItemId)
    if (!cartItem) {
      return
    }

    const order = createOrderFromCartItem(cartItem)
    const queuedNotifications = buildOrderNotifications(order)

    setOrders((prev) => [order, ...prev])
    addNotificationsBatch(queuedNotifications)
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId))
    decreaseStockForOrders([order])
    navigate('orders')
  }

  function handleCheckoutAllCartItems() {
    if (currentUser?.role !== 'buyer') {
      openLogin('buyer')
      return
    }

    if (buyerCartItems.length === 0) {
      return
    }

    const orderList = buyerCartItems.map((item) => createOrderFromCartItem(item))
    const queuedNotifications = orderList.flatMap((order) => buildOrderNotifications(order))
    const cartItemIds = new Set(buyerCartItems.map((item) => item.id))

    setOrders((prev) => [...orderList, ...prev])
    addNotificationsBatch(queuedNotifications)
    setCartItems((prev) => prev.filter((item) => !cartItemIds.has(item.id)))
    decreaseStockForOrders(orderList)
    navigate('orders')
  }

  function handleAdvanceOrderStatus(orderId) {
    if (currentUser?.role !== 'seller') {
      return
    }

    const existingOrder = sellerOrders.find((order) => order.id === orderId)
    if (!existingOrder) {
      return
    }

    const nextStatus = NEXT_ORDER_STATUS[existingOrder.status]
    if (!nextStatus) {
      return
    }

    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)),
    )

    addNotification(
      'buyer',
      `Order #${orderId} update: status is now ${nextStatus}.`,
      orderId,
      existingOrder.buyerEmail ?? '',
    )

    if (existingOrder.sellerOwnerEmail) {
      addNotification(
        'seller',
        `Order #${orderId} for ${existingOrder.productName} has been marked ${nextStatus}.`,
        orderId,
        existingOrder.sellerOwnerEmail,
      )
    }
  }

  function handleSubmitOrderReview(orderId, reviewPayload) {
    if (currentUser?.role !== 'buyer') {
      return false
    }

    const targetOrder = buyerOrders.find((order) => order.id === orderId)
    if (!targetOrder || targetOrder.status !== 'Delivered' || targetOrder.reviewRating !== null) {
      return false
    }

    const reviewRating = normalizeReviewRating(reviewPayload?.rating)
    if (reviewRating === null) {
      return false
    }

    const reviewComment = typeof reviewPayload?.comment === 'string'
      ? reviewPayload.comment.trim()
      : ''
    const reviewedAt = new Date().toISOString()

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              reviewRating,
              reviewComment,
              reviewedAt,
            }
          : order,
      ),
    )

    setSellerListings((prev) =>
      prev.map((listing) => {
        if (listing.id !== targetOrder.productId) {
          return listing
        }

        const currentReviewCount = normalizeIntegerValue(listing.reviewCount, 0)
        const currentRatingTotalValue = Number(listing.ratingTotal)
        const currentRatingTotal = Number.isFinite(currentRatingTotalValue)
          ? Math.max(0, currentRatingTotalValue)
          : currentReviewCount > 0
            ? Number(listing.averageRating) * currentReviewCount
            : 0

        const nextReviewCount = currentReviewCount + 1
        const nextRatingTotal = currentRatingTotal + reviewRating

        return {
          ...listing,
          reviewCount: nextReviewCount,
          ratingTotal: Number(nextRatingTotal.toFixed(2)),
          averageRating: Number((nextRatingTotal / nextReviewCount).toFixed(1)),
        }
      }),
    )

    addNotification(
      'buyer',
      `Thanks for reviewing ${targetOrder.productName} with ${reviewRating}/5 stars.`,
      orderId,
      targetOrder.buyerEmail ?? currentUser.email,
    )

    if (targetOrder.sellerOwnerEmail) {
      addNotification(
        'seller',
        `New ${reviewRating}/5 buyer review for ${targetOrder.productName}.`,
        orderId,
        targetOrder.sellerOwnerEmail,
      )
    }

    return true
  }

  function handleDismissSellerNotification(notificationId) {
    if (currentUser?.role !== 'seller' || !currentUser.email) {
      return
    }

    const currentSellerEmail = currentUser.email

    setNotifications((prev) =>
      prev.map((notification) => {
        if (notification.id !== notificationId || notification.audience !== 'seller') {
          return notification
        }

        const hiddenForEmails = Array.isArray(notification.hiddenForEmails)
          ? notification.hiddenForEmails
          : []

        if (hiddenForEmails.includes(currentSellerEmail)) {
          return notification
        }

        return {
          ...notification,
          hiddenForEmails: [...hiddenForEmails, currentSellerEmail],
        }
      }),
    )
  }

  function handleDismissAllSellerNotifications() {
    if (currentUser?.role !== 'seller' || !currentUser.email) {
      return
    }

    const currentSellerEmail = currentUser.email

    setNotifications((prev) =>
      prev.map((notification) => {
        if (notification.audience !== 'seller') {
          return notification
        }

        const isTargetedToOtherSeller =
          notification.targetEmail && notification.targetEmail !== currentSellerEmail
        if (isTargetedToOtherSeller) {
          return notification
        }

        const hiddenForEmails = Array.isArray(notification.hiddenForEmails)
          ? notification.hiddenForEmails
          : []

        if (hiddenForEmails.includes(currentSellerEmail)) {
          return notification
        }

        return {
          ...notification,
          hiddenForEmails: [...hiddenForEmails, currentSellerEmail],
        }
      }),
    )
  }

  function openLogin(roleHint = 'buyer') {
    navigate('auth', 'login', roleHint)
  }

  function openRegister(roleHint = 'buyer') {
    navigate('auth', 'register', roleHint)
  }

  function handleLogout() {
    setCurrentUser(null)
    navigate('home')
  }

  function handleAuthModeChange(nextMode) {
    navigate('auth', nextMode, resolvedAuthRole)
  }

  function handleAuthSuccess(sessionUser) {
    setCurrentUser(sessionUser)

    if (sessionUser.role === 'seller') {
      navigate('dashboard')
      return
    }

    navigate('browse')
  }

  function renderPage() {
    if (resolvedView === 'auth') {
      return (
        <AuthSection
          accountRole={resolvedAuthRole}
          initialMode={resolvedAuthMode}
          onAuthSuccess={handleAuthSuccess}
          onModeChange={handleAuthModeChange}
        />
      )
    }

    if (resolvedView === 'browse') {
      return (
        <BrowseFurnitureSection
          allowBuyerNameEdit={false}
          buyerName={currentUser?.fullName ?? 'Guest Buyer'}
          onAddToCart={handleAddToCart}
          products={marketplaceProducts}
        />
      )
    }

    if (resolvedView === 'planner') {
      return <VirtualRoomPlannerSection />
    }

    if (resolvedView === 'cart') {
      return (
        <CartSection
          cartItems={buyerCartItems}
          onCheckoutAll={handleCheckoutAllCartItems}
          onCheckoutItem={handleCheckoutCartItem}
          onContinueShopping={() => navigate('browse')}
          onRemoveItem={handleRemoveCartItem}
        />
      )
    }

    if (resolvedView === 'orders') {
      if (currentUser?.role === 'seller') {
        return (
          <OrdersSection
            mode="seller"
            onAdvanceOrderStatus={handleAdvanceOrderStatus}
            orders={sellerOrders}
          />
        )
      }

      return (
        <OrdersSection
          mode="buyer"
          notifications={buyerNotifications}
          onAdvanceOrderStatus={handleAdvanceOrderStatus}
          onSubmitOrderReview={handleSubmitOrderReview}
          orders={buyerOrders}
        />
      )
    }

    if (resolvedView === 'dashboard') {
      return (
        <SellerDashboardSection
          onViewOrders={() => navigate('orders')}
          sellerListings={ownedSellerListings}
          sellerOrders={sellerOrders}
        />
      )
    }

    if (resolvedView === 'inventory') {
      return (
        <SellerInventorySection
          onUpdateListing={handleUpdateListing}
          sellerListings={ownedSellerListings}
        />
      )
    }

    if (resolvedView === 'add-listing') {
      return (
        <SellerAddListingSection
          currentSeller={currentUser}
          onCreateListing={handleCreateListing}
        />
      )
    }

    if (resolvedView === 'about') {
      return <AboutSection />
    }

    return (
      <>
        <HeroSection
          onFindFurniture={() =>
            currentUser?.role === 'buyer' ? navigate('browse') : openLogin('buyer')
          }
        />
        <FeaturedCategories categories={categories} />
        <FeaturedDeals products={featuredProducts} />
        <HowItWorks steps={steps} />
        <SellerCta
          onBecomeSeller={() =>
            currentUser?.role === 'seller' ? navigate('dashboard') : openRegister('seller')
          }
        />
      </>
    )
  }

  if (isSellerInterface) {
    return (
      <SellerSidebarLayout
        activeView={resolvedView}
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigate={(nextView) => navigate(nextView)}
        onDismissAllSellerNotifications={handleDismissAllSellerNotifications}
        onDismissSellerNotification={handleDismissSellerNotification}
        sellerNotifications={sellerNotifications}
      >
        {renderPage()}
        <Footer />
      </SellerSidebarLayout>
    )
  }

  return (
    <>
      <Navbar
        activeView={resolvedView}
        cartItemCount={buyerCartItemCount}
        currentUser={currentUser}
        onLoginClick={() => openLogin('buyer')}
        onLogout={handleLogout}
        onNavigate={(nextView) => navigate(nextView)}
        onSignupClick={() => openRegister('buyer')}
      />
      {renderPage()}
      <Footer />
    </>
  )
}

export default App
