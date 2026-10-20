import Image from 'next/image'
import Link from 'next/link'
import Price from './Price'
import { ProductCardQuickAdd } from './ProductCard-client'
import { Product } from '@/lib/shopify/types'

export default function ProductCard({ product }: { product: Product }) {
  const { availableForSale, featuredImage, handle, images, priceRange, title, variants } = product
  const hoverImage = images.find((image) => image?.url && image.url !== featuredImage.url)
  const variantId = variants[0]?.id

  return (
    <li>
      <div className='flex flex-col items-start'>
        <div className='group relative mb-2 aspect-3/4 w-full overflow-hidden'>
          <Link className='absolute inset-0' href={`/product/${handle}`}>
            <Image
              alt={title}
              src={featuredImage.url}
              fill
              sizes='(max-width: 768px) 100vw, 50vw'
              className='object-cover'
            />
            {hoverImage ? (
              <Image
                alt={hoverImage.altText || title}
                src={hoverImage.url}
                fill
                sizes='(max-width: 768px) 100vw, 50vw'
                className='object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100'
              />
            ) : null}
          </Link>
          {!availableForSale ? (
            <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/50 p-1 text-lg'>
              <span className='bg-espresso rounded-full p-3 text-white uppercase'>Sold Out</span>
            </div>
          ) : variantId ? (
            <ProductCardQuickAdd product={product} />
          ) : null}
        </div>
        <Link className='flex flex-col items-start' href={`/product/${handle}`}>
          <p className='text-sm md:text-md text-left'>{title}</p>
          {availableForSale ? (
            <Price
              amount={priceRange?.minVariantPrice.amount}
              currencyCode={priceRange?.minVariantPrice.currencyCode}
              className='text-xs font-normal'
            />
          ) : null}
        </Link>
      </div>
    </li>
  )
}
