import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ProductListing, ProductListingSkeleton, resolveSort } from '@/components/ProductListing'
import { parsePlpFilters } from '@/lib/plp-filters'
import { getPlpListing } from '@/lib/shopify'

export const metadata: Metadata = {
  description: '',
  title: 'Shop | Ugly Cry Vintage',
}

interface ShopContentProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

async function ShopContent({ searchParams }: ShopContentProps) {
  const resolved = (await searchParams) ?? {}
  const sortParam = typeof resolved.sort === 'string' ? resolved.sort : undefined
  const { reverse, sortKey } = resolveSort(sortParam)
  const filters = parsePlpFilters(resolved)
  const { facets, products } = await getPlpListing({ filters, reverse, sortKey })

  return (
    <ProductListing
      actionPath='/shop'
      facets={facets}
      filters={filters}
      products={products}
      sort={sortParam ?? null}
      title='Everything'
    />
  )
}

export default function Shop(props: ShopContentProps) {
  return (
    <Suspense fallback={<ProductListingSkeleton title='Everything' />}>
      <ShopContent searchParams={props.searchParams} />
    </Suspense>
  )
}
