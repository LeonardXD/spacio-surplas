import { useState } from 'react'
import { categories, products, steps } from './data/homePageData'
import AuthSection from './sections/AuthSection'
import FeaturedCategories from './sections/FeaturedCategories'
import FeaturedDeals from './sections/FeaturedDeals'
import Footer from './sections/Footer'
import HeroSection from './sections/HeroSection'
import HowItWorks from './sections/HowItWorks'
import Navbar from './sections/Navbar'
import SellerCta from './sections/SellerCta'

function App() {
  const [view, setView] = useState('home')
  const [authMode, setAuthMode] = useState('login')

  function openLogin() {
    setAuthMode('login')
    setView('auth')
  }

  function openRegister() {
    setAuthMode('register')
    setView('auth')
  }

  function showHome() {
    setView('home')
  }

  if (view === 'auth') {
    return <AuthSection initialMode={authMode} onBackHome={showHome} />
  }

  return (
    <>
      <Navbar onLoginClick={openLogin} onSignupClick={openRegister} />
      <HeroSection />
      <FeaturedCategories categories={categories} />
      <FeaturedDeals products={products} />
      <HowItWorks steps={steps} />
      <SellerCta />
      <Footer />
    </>
  )
}

export default App
