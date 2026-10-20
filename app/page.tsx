import { Suspense } from 'react'

import { Hero } from '@/components/Hero'
import { ProductCarousel } from '@/components/ProductCarousel'

export default function Home() {
  return (
    <>
      <Hero
        backgroundImage='/hats.gif'
        backgroundImageAlt='Vintage hats'
        href='/shop/new-arrivals'
        objectFit='contain'
        overlayOpacity={0}
      />
      <Suspense fallback={<ProductCarouselSkeleton />}>
        <ProductCarousel collection='new-arrivals' />
      </Suspense>
    </>
  )
}

function ProductCarouselSkeleton() {
  return (
    <section className='px-6 py-12'>
      <h2 className='font-frogmore text-espresso mb-6 text-center text-4xl tracking-wide'>
        New Arrivals
      </h2>
      <p className='text-espresso/70 text-center'>Loading…</p>
    </section>
  )
}
