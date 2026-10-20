import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { ProductListing, resolveSort } from '@/components/ProductListing'
import { parsePlpFilters } from '@/lib/plp-filters'
import { getCollection, getPlpListing } from '@/lib/shopify'

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>
}): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollection(params.collection)

  if (!collection) return notFound()

  return {
    description:
      collection.seo?.description || collection.description || `${collection.title} products`,
    title: `${collection.seo?.title || collection.title} | Ugly Cry Vintage`,
  }
}

interface CategoryContentProps {
  params: Promise<{ collection: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

async function CategoryContent({ params, searchParams }: CategoryContentProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const resolvedParams = await params
  const sortParam =
    typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined
  const { reverse, sortKey } = resolveSort(sortParam)
  const filters = parsePlpFilters(resolvedSearchParams)
  const { collection, facets, products } = await getPlpListing({
    collectionHandle: resolvedParams.collection,
    filters,
    reverse,
    sortKey,
  })

  if (!collection) return notFound()

  return (
    <ProductListing
      actionPath={`/shop/${resolvedParams.collection}`}
      facets={facets}
      filters={filters}
      products={products}
      sort={sortParam ?? null}
      title={collection.title}
    />
  )
}

export default function CategoryPage(props: CategoryContentProps) {
  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  )
}

function CategorySkeleton() {
  return (
    <section>
      <h1 className='mb-8 pt-16 text-center text-4xl sm:pt-24 sm:text-6xl'>Loading…</h1>
      <p className='px-2 py-3 text-lg'>Loading products…</p>
    </section>
  )
}
