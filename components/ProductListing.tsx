import ProductCard from '@/components/ProductCard'
import { ProductListingToolbar } from '@/components/ProductListingToolbar'
import { defaultSort, sorting } from '@/lib/constants'
import type { PlpFacets, PlpFilters } from '@/lib/plp-filters'
import type { Product } from '@/lib/shopify/types'

interface ProductListingProps {
  actionPath: string
  facets: PlpFacets
  filters: PlpFilters
  products: Product[]
  sort: string | null
  title: string
}

interface ProductListingSkeletonProps {
  title?: string
}

export function ProductListing({
  actionPath,
  facets,
  filters,
  products,
  sort,
  title,
}: ProductListingProps) {
  return (
    <section>
      <h1 className='mb-8 pt-16 text-center text-4xl sm:pt-24 sm:text-6xl'>{title}</h1>
      <ProductListingToolbar
        actionPath={actionPath}
        facets={facets}
        filters={filters}
        sort={sort ?? defaultSort.slug}
      />
      {products.length === 0 ? (
        <p className='px-2 py-3 text-lg'>No products found</p>
      ) : (
        <ul className='grid grid-flow-row grid-cols-2 gap-x-0 gap-y-4 px-2 md:grid-cols-3 lg:grid-cols-4'>
          {products.map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </ul>
      )}
    </section>
  )
}

export function ProductListingSkeleton({ title }: ProductListingSkeletonProps) {
  return (
    <section>
      {title ? (
        <h1 className='mb-8 pt-16 text-center text-4xl sm:pt-24 sm:text-6xl'>{title}</h1>
      ) : null}
      <p className='px-2 py-3 text-lg'>Loading products…</p>
    </section>
  )
}

export function resolveSort(sort: string | undefined) {
  return sorting.find((item) => item.slug === sort) || defaultSort
}
