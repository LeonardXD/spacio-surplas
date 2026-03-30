import { categories, products, steps } from './data/homePageData'
import FeaturedCategories from './sections/FeaturedCategories'
import FeaturedDeals from './sections/FeaturedDeals'
import Footer from './sections/Footer'
import HeroSection from './sections/HeroSection'
import HowItWorks from './sections/HowItWorks'
import Navbar from './sections/Navbar'
import SellerCta from './sections/SellerCta'

function App() {
  return (
    <>
      <Navbar />
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
