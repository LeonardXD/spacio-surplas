import { useEffect, useMemo, useState } from 'react'
import MaterialIcon from '../components/MaterialIcon'

const SELLER_NAV_LINKS = [
  { label: 'Dashboard', view: 'dashboard', icon: 'dashboard' },
  { label: 'Add Listing', view: 'add-listing', icon: 'playlist_add' },
  { label: 'My Inventory', view: 'inventory', icon: 'inventory' },
  { label: 'Orders', view: 'orders', icon: 'inventory_2' },
  { label: 'About', view: 'about', icon: 'info' },
]

function getSellerIdentity(currentUser) {
  const displayName = currentUser?.businessName || currentUser?.fullName || 'Seller Account'
  const email = currentUser?.email || ''

  return { displayName, email }
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

function SellerSidebarLayout({
  activeView,
  currentUser,
  sellerNotifications = [],
  onDismissSellerNotification,
  onDismissAllSellerNotifications,
  onNavigate,
  onLogout,
  children,
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const { displayName, email } = useMemo(
    () => getSellerIdentity(currentUser),
    [currentUser],
  )
  const sortedNotifications = useMemo(
    () =>
      [...sellerNotifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [sellerNotifications],
  )

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileSidebarOpen])

  function handleNavigate(nextView) {
    onNavigate?.(nextView)
    setIsMobileSidebarOpen(false)
  }

  function handleLogout() {
    onLogout?.()
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-background-light">
      <header className="sticky top-0 z-40 border-b border-primary/10 bg-white/95 backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            className="flex cursor-pointer items-center gap-2"
            onClick={() => handleNavigate('dashboard')}
            type="button"
          >
            <img
              alt="Spacio Surplas Logo"
              className="h-9 w-auto rounded-md border border-primary/40 bg-white p-1"
              src="/logo.svg"
            />
            <span className="text-sm font-extrabold tracking-tight text-neutral-dark sm:text-base">
              SPACIO <span className="text-primary">SURPLAS</span>
            </span>
          </button>

          <button
            aria-expanded={isMobileSidebarOpen}
            aria-label="Toggle seller menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-neutral-dark"
            onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
            type="button"
          >
            <MaterialIcon name={isMobileSidebarOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)]">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-primary/10 bg-white shadow-xl transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 lg:shadow-none ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-primary/10 px-5 py-5">
            <button
              className="flex w-full cursor-pointer items-center gap-3 text-left"
              onClick={() => handleNavigate('dashboard')}
              type="button"
            >
              <img
                alt="Spacio Surplas Logo"
                className="h-10 w-auto rounded-md border border-primary/40 bg-white p-1"
                src="/logo.svg"
              />
              <div>
                <p className="text-sm font-black tracking-tight text-neutral-dark">
                  SPACIO <span className="text-primary">SURPLAS</span>
                </p>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-dark/55">
                  Seller Console
                </p>
              </div>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <nav className="space-y-1 px-3 py-4">
              {SELLER_NAV_LINKS.map((link) => (
                <button
                  key={link.view}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                    activeView === link.view
                      ? 'bg-primary/10 text-primary'
                      : 'text-neutral-dark hover:bg-primary/5 hover:text-primary'
                  }`}
                  onClick={() => handleNavigate(link.view)}
                  type="button"
                >
                  <MaterialIcon className="text-lg" name={link.icon} />
                  <span>{link.label}</span>
                </button>
              ))}
            </nav>

            <section className="px-3 pb-4">
              <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-dark/65">
                    Notifications
                  </p>
                  <div className="flex items-center gap-2">
                    {sortedNotifications.length > 0 && (
                      <button
                        className="rounded-md border border-primary/20 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-dark/70 transition-colors hover:bg-primary/10 hover:text-primary"
                        onClick={onDismissAllSellerNotifications}
                        type="button"
                      >
                        Mark all read
                      </button>
                    )}
                    <span className="inline-flex items-center justify-center rounded-full bg-neutral-dark px-2 py-0.5 text-[10px] font-bold text-white">
                      {sortedNotifications.length}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {sortedNotifications.map((notification) => (
                    <article
                      key={notification.id}
                      className="rounded-lg border border-primary/15 bg-white p-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium leading-relaxed text-neutral-dark">
                          {notification.message}
                        </p>
                        <button
                          aria-label="Mark notification as read"
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/5 text-neutral-dark transition-colors hover:bg-primary/15 hover:text-primary"
                          onClick={() => onDismissSellerNotification?.(notification.id)}
                          type="button"
                        >
                          <MaterialIcon className="text-sm" name="done" />
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-neutral-dark/55">
                        {formatDate(notification.createdAt)}
                      </p>
                    </article>
                  ))}
                </div>

                {sortedNotifications.length === 0 && (
                  <div className="mt-3 rounded-lg border border-primary/15 bg-white p-3 text-xs text-neutral-dark/60">
                    No seller notifications yet.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="mt-auto border-t border-primary/10 p-4">
            <div className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-dark/60">
                Signed in as seller
              </p>
              <p className="mt-1 text-sm font-bold text-neutral-dark">{displayName}</p>
              {email && <p className="mt-0.5 break-all text-xs text-neutral-dark/60">{email}</p>}
            </div>

            <button
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-dark px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-neutral-dark/90"
              onClick={handleLogout}
              type="button"
            >
              <MaterialIcon className="text-base" name="logout" />
              Logout
            </button>
          </div>
        </aside>

        {isMobileSidebarOpen && (
          <button
            aria-label="Close seller menu"
            className="fixed inset-0 z-40 bg-neutral-dark/40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
            type="button"
          />
        )}

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}

export default SellerSidebarLayout
