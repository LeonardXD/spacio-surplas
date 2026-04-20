import bedImg from '../assets/Bed.png'
import chairImg from '../assets/Chair.png'
import drawerImg from '../assets/Drawer.png'
import sofaImg from '../assets/Sofa.png'
import bedModel from '../assets/Bed.glb'
import chairModel from '../assets/Chair.glb'
import drawerModel from '../assets/Drawer.glb'
import sofaModel from '../assets/Sofa.glb'

export const categories = [
  { icon: 'chair', label: 'Living Room' },
  { icon: 'bed', label: 'Bedroom' },
  { icon: 'restaurant', label: 'Dining' },
  { icon: 'laptop_mac', label: 'Office' },
  { icon: 'inventory_2', label: 'Storage' },
  { icon: 'home_mini', label: 'Compact' },
]

const FEET_TO_METERS = 0.3048

function toMeters(feetValue) {
  const numericValue = Number(feetValue)
  if (!Number.isFinite(numericValue)) {
    return 0
  }

  return Number((numericValue * FEET_TO_METERS).toFixed(2))
}

export const featuredProducts = [
  {
    image: sofaImg,
    alt: 'Sofa',
    category: 'Urban Living',
    name: 'Marlowe Tufted Fabric Loveseat (Sofa)',
    price: 'PHP 6,999.00',
    oldPrice: 'PHP 10,000.00',
    seller: 'Modern Surplus',
  },
  {
    image: chairImg,
    alt: 'Chair',
    category: 'Compact Dining',
    name: 'Heritage Bentwood Bistro Chair',
    price: 'PHP 2,899.00',
    oldPrice: 'PHP 3,500.00',
    seller: 'WoodWorks',
  },
  {
    image: drawerImg,
    alt: 'Dresser',
    category: 'Storage',
    name: 'Alpine 6-Drawer Double Dresser',
    price: 'PHP 9,999.00',
    oldPrice: 'PHP 12,000.00',
    seller: 'OfficeDirect',
  },
  {
    image: bedImg,
    alt: 'Bed',
    category: 'Bedroom',
    name: 'Solstice Modern Platform Bed',
    price: 'PHP 10,899.00',
    oldPrice: 'PHP 15,000.00',
    seller: 'SleepWell Co.',
  },
]

export const marketplaceSeedProducts = [
  {
    id: 'seed-1',
    image: sofaImg,
    modelUrl: sofaModel,
    name: 'Marlowe Tufted Fabric Loveseat (Sofa)',
    category: 'Living Room',
    roomType: 'Living Room',
    seller: 'Modern Surplus',
    widthM: 0.81,
    lengthM: 1.52,
    heightM: 0.86,
    price: 6999,
    oldPrice: 10000,
    promoLabel: 'Seasonal markdown',
    viewType: 'multi-angle',
  },
  {
    id: 'seed-2',
    image: chairImg,
    modelUrl: chairModel,
    name: 'Heritage Bentwood Bistro Chair',
    category: 'Dining',
    roomType: 'Dining',
    seller: 'WoodWorks',
    widthM: 0.43,
    lengthM: 0.51,
    heightM: 0.89,
    price: 2899,
    oldPrice: 3500,
    promoLabel: 'Bundle discount',
    viewType: 'standard',
  },
  {
    id: 'seed-3',
    image: drawerImg,
    modelUrl: drawerModel,
    name: 'Alpine 6-Drawer Double Dresser',
    category: 'Storage',
    roomType: 'Bedroom',
    seller: 'OfficeDirect',
    widthM: 1.37,
    lengthM: 0.46,
    heightM: 0.81,
    price: 9999,
    oldPrice: 12000,
    promoLabel: 'Back-to-work promo',
    viewType: '3d',
  },
  {
    id: 'seed-4',
    image: bedImg,
    modelUrl: bedModel,
    name: 'Solstice Modern Platform Bed',
    category: 'Bedroom',
    roomType: 'Bedroom',
    seller: 'SleepWell Co.',
    widthM: 2.79,
    lengthM: 2.18,
    heightM: 0.89,
    price: 10899,
    oldPrice: 15000,
    promoLabel: 'Weekend deal',
    viewType: 'multi-angle',
  },
]

export const roomTypes = ['Any', 'Living Room', 'Bedroom', 'Dining', 'Office', 'Storage']

export const sellerPlans = [
  {
    id: 'starter',
    name: 'Starter',
    pricePerMonth: 799,
    freeTrialDays: 7,
    features: ['Up to 40 active listings', 'Basic analytics', 'In-app buyer chat'],
  },
  {
    id: 'growth',
    name: 'Growth',
    pricePerMonth: 1499,
    freeTrialDays: 10,
    features: ['Up to 150 active listings', 'Priority support', 'Campaign discounts'],
  },
  {
    id: 'scale',
    name: 'Scale',
    pricePerMonth: 2499,
    freeTrialDays: 14,
    features: ['Unlimited listings', 'Advanced analytics', 'Featured seller placement'],
  },
]

export const steps = [
  {
    icon: 'aspect_ratio',
    title: '1. Dimensions',
    description:
      "Enter your room's width and length to filter furniture that fits your layout perfectly.",
  },
  {
    icon: 'grid_view',
    title: '2. Browse',
    description:
      'Explore a curated selection of surplus items from trusted sellers that match your space requirements.',
  },
  {
    icon: 'shopping_bag',
    title: '3. Order',
    description:
      'Secure your items with a simple checkout process and get them delivered to your doorstep.',
  },
]
