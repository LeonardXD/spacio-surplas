import { useEffect, useState } from 'react'
import { categories, products, steps } from './data/homePageData'
import AuthSection from './sections/AuthSection'
import FeaturedCategories from './sections/FeaturedCategories'
import FeaturedDeals from './sections/FeaturedDeals'
import Footer from './sections/Footer'
import HeroSection from './sections/HeroSection'
import HowItWorks from './sections/HowItWorks'
import Navbar from './sections/Navbar'
import SellerCta from './sections/SellerCta'

function getRouteFromPath(pathname) {
  if (pathname === '/login') {
    return { view: 'auth', authMode: 'login' }
  }

  if (pathname === '/register') {
    return { view: 'auth', authMode: 'register' }
  }

  return { view: 'home', authMode: 'login' }
}

function getPathFromRoute(view, authMode) {
  if (view === 'auth' && authMode === 'register') {
    return '/register'
  }

  if (view === 'auth') {
    return '/login'
  }

  return '/'
}

function App() {
  const initialRoute = getRouteFromPath(window.location.pathname)
  const [view, setView] = useState(initialRoute.view)
  const [authMode, setAuthMode] = useState(initialRoute.authMode)

  useEffect(() => {
    function handlePopState() {
      const route = getRouteFromPath(window.location.pathname)
      setView(route.view)
      setAuthMode(route.authMode)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(nextView, nextAuthMode = 'login') {
    const nextPath = getPathFromRoute(nextView, nextAuthMode)
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }

    setView(nextView)
    setAuthMode(nextAuthMode)
  }

  function openLogin() {
    navigate('auth', 'login')
  }

  function openRegister() {
    navigate('auth', 'register')
  }

  function showHome() {
    navigate('home')
  }

  function handleAuthModeChange(nextMode) {
    navigate('auth', nextMode)
  }

  return (
    <>
      <Navbar onHomeClick={showHome} onLoginClick={openLogin} onSignupClick={openRegister} />
      {view === 'auth' ? (
        <AuthSection initialMode={authMode} onModeChange={handleAuthModeChange} />
      ) : (
        <>
          <HeroSection />
          <FeaturedCategories categories={categories} />
          <FeaturedDeals products={products} />
          <HowItWorks steps={steps} />
          <SellerCta />
        </>
      )}
      <Footer />
    </>
  )
}

export default App
