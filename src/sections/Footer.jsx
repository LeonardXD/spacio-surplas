function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12">
          <div className="flex flex-col gap-6">
            <a className="flex items-center gap-2" href="#">
              <img
                alt="Logo"
                className="h-8 rounded-md border border-primary/40 bg-white p-1"
                src="/logo.svg"
              />
              <span className="text-lg font-black tracking-tight text-neutral-dark">SPACIO SURPLAS</span>
            </a>
            <p className="text-sm leading-relaxed text-neutral-dark/60">
              The ultimate destination for surplus furniture that actually fits. Modern solutions
              for modern living spaces.
            </p>
          </div>
        </div>

        <div className="mt-16 border-t border-primary/5 pt-8 text-center text-sm text-neutral-dark/40">
          <p>&copy; 2026 Spacio Surplas. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
