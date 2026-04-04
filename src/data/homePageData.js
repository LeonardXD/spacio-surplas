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
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuByd2AgJBuOnvOvoY19oUQeT3goZuxAKfXxtnDY-3MQe_kXT2tGWq5FoEDu_-4-UIYjp2tnDyIjexXJvLzKi1mZN-4gCy7PBcKMPetEzDc1d1WFZ0E6t8iTjGaN95yB0GppqhZmpd_l_TWOKlThfX_ZRqOYuKiNVEqmvW1Uu1CUutpqywWyiro5ocogUD_j8YH9kPLj1A_ofoLjOHKCqk-wLFLEUwRtRTLmMl4tmtnFgjENSB0voB_IiAkvRDAc9zwzpPuHggdm_xLf',
    alt: 'Sofa',
    category: 'Urban Living',
    name: 'Modular Velvet Sofa',
    price: 'PHP 6,999.00',
    oldPrice: 'PHP 10,000.00',
    seller: 'Modern Surplus',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAxxGPRyOwPKlRo0sXaOWfntiFs796I_VrDdjYcN37DdXimOYDngwFRx-sSnHdQE4UnzdvvkguL7wjOY_BzB953mJ37oMNsVTYY3NFo2AXqgWdOsQix0pbXvsAkmMxp_syTqJfE6s0y5gd6NqLjI8mNBROQ5Tt3geg3SeYxOHXkE0deqw9VVy_3OWYVNlFlLAExF1CfNyn6yupwziuO_qOMA1kQcoMcMHBIErt2E3wnUt1xlROWSfDmLtqVYQ7JZLxJV5pSpZz_TkaD',
    alt: 'Table',
    category: 'Compact Dining',
    name: 'Oak Pedestal Table',
    price: 'PHP 2,899.00',
    oldPrice: 'PHP 3,500.00',
    seller: 'WoodWorks',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB8iBbIzZ_Vy720j8Kncyhv3loqapRWyAMXctx-_RED9rfNgDSfhDBAe5Tn4f7vPz2lmYwK5NHClSCR1rZL_OSTbkVA9e5ore9n7bSJ3n56lyXbGmCLvBUxhb2XHzqaNythEMhLHC9jVNk-PoZKcyhfenQk031mMRJ6Xo02zNi8p5qB0q3CknehVAFl3dHWfNHoOem4876pghVHhT-qT-apCzXZgparsp3lPAvKxatTi3QHbocMz_rT-G-tdRGwXDQo3np47igC7Qv1',
    alt: 'Office',
    category: 'Home Office',
    name: 'Ergo Workstation',
    price: 'PHP 9,999.00',
    oldPrice: 'PHP 12,000.00',
    seller: 'OfficeDirect',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCUoZUmA8MzyEIH_WdjhfY5e9f7t1F_hqD7qj-T0Pd7TI_dBrzd9bvHCCNs46YQsqhXFKeqbiHdXeJ4MhJ8br657b8HlVsnix8vRcbYWTvxMmbyNW823BwtKFtoPfU4e2Thvu4gxWl-2_q2JybYC1JJh94SdOPY_v27FM4lsEPSeIoAuGEoPDE-UmUynZw3XOT4WgNY62Zl8A8FEsd39U4O1EkRBa1isQ5oDCW7OffR7o0YHasg9OjqNogptSEqyM9kXcxwAUCZzrp7',
    alt: 'Bed',
    category: 'Bedroom',
    name: 'Zen Platform Bed',
    price: 'PHP 10,899.00',
    oldPrice: 'PHP 15,000.00',
    seller: 'SleepWell Co.',
  },
]

export const marketplaceSeedProducts = [
  {
    id: 'seed-1',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuByd2AgJBuOnvOvoY19oUQeT3goZuxAKfXxtnDY-3MQe_kXT2tGWq5FoEDu_-4-UIYjp2tnDyIjexXJvLzKi1mZN-4gCy7PBcKMPetEzDc1d1WFZ0E6t8iTjGaN95yB0GppqhZmpd_l_TWOKlThfX_ZRqOYuKiNVEqmvW1Uu1CUutpqywWyiro5ocogUD_j8YH9kPLj1A_ofoLjOHKCqk-wLFLEUwRtRTLmMl4tmtnFgjENSB0voB_IiAkvRDAc9zwzpPuHggdm_xLf',
    name: 'Modular Velvet Sofa',
    category: 'Living Room',
    roomType: 'Living Room',
    seller: 'Modern Surplus',
    widthM: toMeters(7.2),
    lengthM: toMeters(3.1),
    heightM: toMeters(3.2),
    price: 6999,
    oldPrice: 10000,
    promoLabel: 'Seasonal markdown',
    viewType: 'multi-angle',
  },
  {
    id: 'seed-2',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAxxGPRyOwPKlRo0sXaOWfntiFs796I_VrDdjYcN37DdXimOYDngwFRx-sSnHdQE4UnzdvvkguL7wjOY_BzB953mJ37oMNsVTYY3NFo2AXqgWdOsQix0pbXvsAkmMxp_syTqJfE6s0y5gd6NqLjI8mNBROQ5Tt3geg3SeYxOHXkE0deqw9VVy_3OWYVNlFlLAExF1CfNyn6yupwziuO_qOMA1kQcoMcMHBIErt2E3wnUt1xlROWSfDmLtqVYQ7JZLxJV5pSpZz_TkaD',
    name: 'Oak Pedestal Table',
    category: 'Dining',
    roomType: 'Dining',
    seller: 'WoodWorks',
    widthM: toMeters(4.2),
    lengthM: toMeters(4.2),
    heightM: toMeters(2.6),
    price: 2899,
    oldPrice: 3500,
    promoLabel: 'Bundle discount',
    viewType: 'standard',
  },
  {
    id: 'seed-3',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB8iBbIzZ_Vy720j8Kncyhv3loqapRWyAMXctx-_RED9rfNgDSfhDBAe5Tn4f7vPz2lmYwK5NHClSCR1rZL_OSTbkVA9e5ore9n7bSJ3n56lyXbGmCLvBUxhb2XHzqaNythEMhLHC9jVNk-PoZKcyhfenQk031mMRJ6Xo02zNi8p5qB0q3CknehVAFl3dHWfNHoOem4876pghVHhT-qT-apCzXZgparsp3lPAvKxatTi3QHbocMz_rT-G-tdRGwXDQo3np47igC7Qv1',
    name: 'Ergo Workstation',
    category: 'Office',
    roomType: 'Office',
    seller: 'OfficeDirect',
    widthM: toMeters(5.5),
    lengthM: toMeters(2.5),
    heightM: toMeters(3.1),
    price: 9999,
    oldPrice: 12000,
    promoLabel: 'Back-to-work promo',
    viewType: '3d',
  },
  {
    id: 'seed-4',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCUoZUmA8MzyEIH_WdjhfY5e9f7t1F_hqD7qj-T0Pd7TI_dBrzd9bvHCCNs46YQsqhXFKeqbiHdXeJ4MhJ8br657b8HlVsnix8vRcbYWTvxMmbyNW823BwtKFtoPfU4e2Thvu4gxWl-2_q2JybYC1JJh94SdOPY_v27FM4lsEPSeIoAuGEoPDE-UmUynZw3XOT4WgNY62Zl8A8FEsd39U4O1EkRBa1isQ5oDCW7OffR7o0YHasg9OjqNogptSEqyM9kXcxwAUCZzrp7',
    name: 'Zen Platform Bed',
    category: 'Bedroom',
    roomType: 'Bedroom',
    seller: 'SleepWell Co.',
    widthM: toMeters(6),
    lengthM: toMeters(6.5),
    heightM: toMeters(2.4),
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
