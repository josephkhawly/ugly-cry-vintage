import { Hero } from '@/components/Hero'
import { ProductCarousel } from '@/components/ProductCarousel'

export default function Home() {
  return (
    <>
      <Hero
        backgroundImage='/drop2.png'
        backgroundImageAlt='Vintage sweaters'
        href='/shop/new-arrivals'
        objectFit='contain'
        overlayOpacity={0}
      />
      <ProductCarousel collection='new-arrivals' />
    </>
  )
}
