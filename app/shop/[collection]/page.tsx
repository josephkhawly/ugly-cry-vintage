import { ProductListing, resolveSort } from '@/components/ProductListing'
import { parsePlpFilters } from '@/lib/plp-filters'
import { getCollection, getPlpListing } from '@/lib/shopify'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = (await props.searchParams) ?? {}
  const params = await props.params
  const sortParam = typeof searchParams.sort === 'string' ? searchParams.sort : undefined
  const { reverse, sortKey } = resolveSort(sortParam)
  const filters = parsePlpFilters(searchParams)
  const { collection, facets, products } = await getPlpListing({
    collectionHandle: params.collection,
    filters,
    reverse,
    sortKey,
  })

  if (!collection) return notFound()

  return (
    <ProductListing
      actionPath={`/shop/${params.collection}`}
      facets={facets}
      filters={filters}
      products={products}
      sort={sortParam ?? null}
      title={collection.title}
    />
  )
}
