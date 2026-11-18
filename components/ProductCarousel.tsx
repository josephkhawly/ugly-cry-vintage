import ProductCard from '@/components/ProductCard'
import { ProductCarouselClient } from '@/components/ProductCarousel-client'
import { getCollection, getCollectionProducts } from '@/lib/shopify'

interface ProductCarouselProps {
  collection: string
}

export async function ProductCarousel({ collection }: ProductCarouselProps) {
  const [collectionData, products] = await Promise.all([
    getCollection(collection),
    getCollectionProducts({ collection }),
  ])

  if (!collectionData) return null

  const items = products.slice(0, 12)
  if (items.length === 0) return null

  return (
    <ProductCarouselClient heading={collectionData.title}>
      {items.map((product) => (
        <ProductCard key={product.handle} product={product} />
      ))}
    </ProductCarouselClient>
  )
}
