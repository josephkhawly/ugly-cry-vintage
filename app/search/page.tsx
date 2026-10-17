import type { Metadata } from 'next'
import Link from 'next/link'

import ProductCard from '@/components/ProductCard'
import { getProducts } from '@/lib/shopify'
import type { Product } from '@/lib/shopify/types'

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: 'Search | Ugly Cry Vintage',
  description: 'Search the shop',
}

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const products = query ? await getProducts({ query }) : await getProducts({})

  return (
    <div className='container mx-auto px-6 pt-16 pb-16 sm:pt-24'>
      <h1 className='font-frogmore text-espresso mb-2 text-center text-5xl tracking-wide md:text-6xl'>
        Search
      </h1>
      {query ? (
        <p className='font-subheading text-espresso/70 mb-8 text-center text-sm tracking-wide uppercase'>
          Results for &ldquo;{query}&rdquo;
        </p>
      ) : (
        <p className='font-subheading text-espresso/70 mb-8 text-center text-sm tracking-wide uppercase'>
          Browse everything
        </p>
      )}

      {products.length === 0 ? (
        <div className='mx-auto max-w-md text-center'>
          <p className='text-espresso/80'>No products matched that search.</p>
          <Link
            className='font-subheading mt-6 inline-flex text-sm uppercase underline'
            href='/shop'
          >
            Shop all
          </Link>
        </div>
      ) : (
        <ul className='grid grid-flow-row grid-cols-2 gap-x-0 gap-y-4 px-2 md:grid-cols-3 lg:grid-cols-4'>
          {products.map((product: Product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </ul>
      )}
    </div>
  )
}
