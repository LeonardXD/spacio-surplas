import { useMemo, useState } from 'react'
import MaterialIcon from '../components/MaterialIcon'

function getNavLinks(role) {
  if (role === 'seller') {
    return [
      { label: 'Dashboard', view: 'dashboard' },
      { label: 'Add Listing', view: 'add-listing' },
      { label: 'My Inventory', view: 'inventory' },
      { label: 'Orders', view: 'orders' },
      { label: 'About', view: 'about' },
    ]
  }

  if (role === 'buyer') {
    return [
      { label: 'Home', view: 'home' },
      { label: 'Browse Furniture', view: 'browse' },
      { label: 'Cart', view: 'cart' },
      { label: 'My Orders', view: 'orders' },
      { label: 'About', view: 'about' },
    ]
  }

  return [
    { label: 'Home', view: 'home' },
    { label: 'About', view: 'about' },
  ]
}

function Navbar({
  activeView,
  currentUser,
  cartItemCount = 0,
  onNavigate,
  onLoginClick,
  onSignupClick,
  onLogout,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navLinks = useMemo(() => getNavLinks(currentUser?.role), [currentUser?.role])

  function handleNavigate(nextView) {
    onNavigate?.(nextView)
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <button className="flex cursor-pointer items-center gap-2" onClick={() => handleNavigate('home')} type="button">
            <img
              alt="Spacio Surplas Logo"
              className="h-10 w-auto rounded-md border border-primary/40 bg-white p-1"
              src="/logo.svg"
            />
            <span className="text-xl font-extrabold tracking-tight text-neutral-dark">
              SPACIO <span className="text-primary">SURPLAS</span>
            </span>
          </button>

          <nav className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <button
                key={link.view}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  activeView === link.view
                    ? 'bg-primary/10 text-primary'
                    : 'text-neutral-dark hover:bg-primary/5 hover:text-primary'
                }`}
                onClick={() => handleNavigate(link.view)}
                type="button"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>{link.label}</span>
                  {link.view === 'cart' && currentUser?.role === 'buyer' && cartItemCount > 0 && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-neutral-dark px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {cartItemCount}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4 lg:gap-6">
          {currentUser?.role === 'buyer' && (
            <div className="relative hidden max-w-xs flex-1 md:block">
              <MaterialIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                name="search"
              />
              <input
                className="w-full rounded-lg border border-primary/20 bg-primary/5 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
                placeholder="Search furniture..."
                type="text"
              />
            </div>
          )}

          <div className="hidden items-center gap-3 lg:flex">
            {currentUser ? (
              <>
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-dark">
                  {currentUser.role === 'seller' ? 'Seller' : 'Buyer'}: {currentUser.fullName}
                </div>
                <button
                  className="rounded-lg bg-neutral-dark px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-dark/90"
                  onClick={onLogout}
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="cursor-pointer text-sm font-bold text-neutral-dark"
                  onClick={onLoginClick}
                  type="button"
                >
                  Login
                </button>
                <button
                  className="rounded-lg bg-neutral-dark px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-dark/90"
                  onClick={onSignupClick}
                  type="button"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          <button
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-neutral-dark lg:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            type="button"
          >
            <MaterialIcon name={isMenuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-primary/10 bg-white px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            {currentUser?.role === 'buyer' && (
              <div className="relative md:hidden">
                <MaterialIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                  name="search"
                />
                <input
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
                  placeholder="Search furniture..."
                  type="text"
                />
              </div>
            )}

            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={`mobile-${link.view}`}
                  className={`rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                    activeView === link.view
                      ? 'bg-primary/10 text-primary'
                      : 'text-neutral-dark hover:bg-primary/5 hover:text-primary'
                  }`}
                  onClick={() => handleNavigate(link.view)}
                  type="button"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span>{link.label}</span>
                    {link.view === 'cart' && currentUser?.role === 'buyer' && cartItemCount > 0 && (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-neutral-dark px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {cartItemCount}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3 border-t border-primary/10 pt-3">
              {currentUser ? (
                <>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-dark">
                    {currentUser.role}
                  </div>
                  <button
                    className="rounded-lg bg-neutral-dark px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-dark/90"
                    onClick={() => {
                      onLogout?.()
                      setIsMenuOpen(false)
                    }}
                    type="button"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="rounded-lg px-3 py-2 text-sm font-bold text-neutral-dark hover:bg-primary/5"
                    onClick={() => {
                      onLoginClick?.()
                      setIsMenuOpen(false)
                    }}
                    type="button"
                  >
                    Login
                  </button>
                  <button
                    className="rounded-lg bg-neutral-dark px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-dark/90"
                    onClick={() => {
                      onSignupClick?.()
                      setIsMenuOpen(false)
                    }}
                    type="button"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
