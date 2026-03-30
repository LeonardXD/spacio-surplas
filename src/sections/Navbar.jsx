import { useState } from 'react'
import MaterialIcon from '../components/MaterialIcon'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navLinks = ['Home', 'Browse Furniture', 'Sellers', 'About']

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <a className="flex items-center gap-2" href="#">
            <img
              alt="Spacio Surplas Logo"
              className="h-10 w-auto rounded-md border border-primary/40 bg-white p-1"
              src="/logo.svg"
            />
            <span className="text-xl font-extrabold tracking-tight text-neutral-dark">
              SPACIO <span className="text-primary">SURPLAS</span>
            </span>
          </a>

          <nav className="hidden space-x-8 lg:flex">
            {navLinks.map((link) => (
              <a key={link} className="text-sm font-semibold text-neutral-dark hover:text-primary" href="#">
                {link}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4 lg:gap-6">
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
          <div className="hidden items-center gap-3 lg:flex">
            <a className="text-sm font-bold text-neutral-dark" href="#">
              Login
            </a>
            <button className="rounded-lg bg-neutral-dark px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-dark/90">
              Sign Up
            </button>
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

            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={`mobile-${link}`}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-neutral-dark hover:bg-primary/5 hover:text-primary"
                  href="#"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3 border-t border-primary/10 pt-3">
              <a
                className="rounded-lg px-3 py-2 text-sm font-bold text-neutral-dark hover:bg-primary/5"
                href="#"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </a>
              <button className="rounded-lg bg-neutral-dark px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-dark/90">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
