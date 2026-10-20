import type { StorefrontClient } from '@shopify/hydrogen'
import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { HIDDEN_PRODUCT_TAG, TAGS } from '../constants'
import { getPublicStoreDomain } from '../env'
import {
  emptyFacets,
  filterProductsBySizeColor,
  getFilterFacets,
  hasActiveFilters,
  type PlpFacets,
  type PlpFilters,
  shopifyGidToId,
  toStorefrontQuery,
} from '../plp-filters'
import { staticStorefrontClient } from '../storefront-static'
import { ensureStartsWith, sortProductsByAvailability } from '../utils'
import { reshapeColors, reshapeSizes } from './category-attributes'
import {
  PRODUCT_DETAIL_METAFIELD_IDENTIFIERS,
  PRODUCT_DETAIL_METAFIELDS,
} from './product-metafields'
import {
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery,
} from './queries/collection'
import { getMenuQuery } from './queries/menu'
import { getPageQuery, getPagesQuery } from './queries/page'
import {
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
} from './queries/product'
import {
  Collection,
  Connection,
  Menu,
  Page,
  Product,
  ProductDetail,
  ShopifyCollection,
  ShopifyMedia,
  ShopifyMetafield,
  ShopifyProduct,
} from './types'

async function shopifyQuery<TDoc extends Parameters<StorefrontClient['graphql']>[0]>(
  document: TDoc,
  options?: {
    tags?: string[]
    variables?: Record<string, unknown>
  },
) {
  'use cache'
  cacheLife('hours')
  for (const tag of options?.tags ?? []) {
    cacheTag(tag)
  }

  const { data, errors } = await staticStorefrontClient.graphql(document, {
    variables: options?.variables,
  } as never)

  if (errors?.length) {
    throw errors[0]
  }

  return data
}

function asShopifyProduct(product: unknown): ShopifyProduct | undefined {
  return product as ShopifyProduct | undefined
}

function asShopifyProducts(products: unknown): ShopifyProduct[] {
  return products as ShopifyProduct[]
}

function asShopifyCollection(collection: unknown): ShopifyCollection | undefined {
  return collection as ShopifyCollection | undefined
}

function asShopifyCollections(collections: unknown): ShopifyCollection[] {
  return collections as ShopifyCollection[]
}

const removeEdgesAndNodes = <T>(array: Connection<T>): T[] => {
  return array?.edges?.map((edge) => edge?.node)
}

const reshapeCollection = (collection: ShopifyCollection): Collection | undefined => {
  if (!collection) {
    return undefined
  }

  return {
    ...collection,
    path: `/shop/${collection.handle}`,
  }
}

const reshapeCollections = (collections: ShopifyCollection[]) => {
  const reshapedCollections = []

  for (const collection of collections) {
    if (collection) {
      const reshapedCollection = reshapeCollection(collection)

      if (reshapedCollection) {
        reshapedCollections.push(reshapedCollection)
      }
    }
  }

  return reshapedCollections
}

const reshapeImages = (images: Connection<ShopifyMedia>, productTitle: string) => {
  const flattened = removeEdgesAndNodes(images)

  return flattened.map((image) => {
    const filename = image.image?.url.match(/.*\/(.*)\..*/)?.[1]
    return {
      ...image.image,
      altText: image.image?.altText || `${productTitle} - ${filename}`,
    }
  })
}

function reshapeProductDetails(metafields?: (ShopifyMetafield | null)[]): ProductDetail[] {
  const byKey = Object.fromEntries(
    (metafields ?? []).flatMap((metafield) => {
      const value = metafield?.value.trim()
      return metafield && value ? [[metafield.key, value]] : []
    }),
  )

  return PRODUCT_DETAIL_METAFIELDS.flatMap(({ key, title }) => {
    const value = byKey[key]
    return value ? [{ key, title, value }] : []
  })
}

const reshapeProduct = (
  product: ShopifyProduct | undefined,
  filterHiddenProducts: boolean = true,
) => {
  if (!product || (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))) {
    return undefined
  }

  const { color, media, metafields, size, variants, ...rest } = product

  return {
    ...rest,
    colors: reshapeColors(color),
    details: reshapeProductDetails(metafields),
    images: reshapeImages(media, product.title),
    sizes: reshapeSizes(size),
    variants: removeEdgesAndNodes(variants),
  }
}

const reshapeProducts = (products: ShopifyProduct[]) => {
  const reshapedProducts = []

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product)

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct)
      }
    }
  }

  // Sort products so that sold-out ones appear last
  return sortProductsByAvailability(reshapedProducts)
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  const data = await shopifyQuery(getCollectionQuery, {
    tags: [TAGS.collections],
    variables: {
      handle,
    },
  })

  const collection = asShopifyCollection(data?.collection)
  return collection ? reshapeCollection(collection) : undefined
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
}: {
  collection: string
  reverse?: boolean
  sortKey?: string
}): Promise<Product[]> {
  const data = await shopifyQuery(getCollectionProductsQuery, {
    tags: [TAGS.collections, TAGS.products],
    variables: {
      handle: collection,
      reverse,
      sortKey: sortKey === 'CREATED_AT' ? 'CREATED' : sortKey,
    },
  })

  if (!data?.collection) {
    console.log(`No collection found for \`${collection}\``)
    return []
  }

  return reshapeProducts(
    asShopifyProducts(removeEdgesAndNodes(data.collection.products as Connection<unknown>)),
  )
}

/** PLP fetch: type/era via Storefront search query; size/color post-filtered. */
export async function getPlpListing({
  collectionHandle,
  filters,
  reverse,
  sortKey,
}: {
  collectionHandle?: string
  filters: PlpFilters
  reverse?: boolean
  sortKey?: string
}): Promise<{
  collection?: Collection
  facets: PlpFacets
  products: Product[]
}> {
  const collection = collectionHandle ? await getCollection(collectionHandle) : undefined

  if (collectionHandle && !collection) {
    return { facets: emptyFacets(), products: [] }
  }

  const collectionId = collection?.id ? shopifyGidToId(collection.id) : undefined

  if (!hasActiveFilters(filters)) {
    const products = collectionHandle
      ? await getCollectionProducts({ collection: collectionHandle, reverse, sortKey })
      : await getProducts({ reverse, sortKey })

    return { collection, facets: getFilterFacets(products), products }
  }

  const facetQuery = collectionId ? `collection_id:${collectionId}` : undefined
  const listingQuery = toStorefrontQuery(filters, collectionId) ?? facetQuery
  const productTags = collectionHandle
    ? [TAGS.collections, TAGS.products]
    : [TAGS.products]

  const [facetProducts, products] = await Promise.all([
    getProducts({ query: facetQuery, tags: productTags }),
    getProducts({ query: listingQuery, reverse, sortKey, tags: productTags }),
  ])

  return {
    collection,
    facets: getFilterFacets(facetProducts),
    products: filterProductsBySizeColor(products, filters),
  }
}

export async function getCollections(): Promise<Collection[]> {
  const data = await shopifyQuery(getCollectionsQuery, {
    tags: [TAGS.collections],
  })
  const shopifyCollections = asShopifyCollections(
    removeEdgesAndNodes(data?.collections as Connection<unknown>),
  )
  const collections = [
    {
      description: 'All products',
      handle: '',
      id: '',
      path: '/shop',
      seo: {
        description: 'All products',
        title: 'All',
      },
      title: 'All',
      updatedAt: new Date().toISOString(),
    },
    // Filter out the `hidden` collections.
    // Collections that start with `hidden-*` need to be hidden on the search page.
    ...reshapeCollections(shopifyCollections).filter(
      (collection) =>
        !collection.handle.startsWith('hidden') && !collection.handle.startsWith('frontpage'),
    ),
  ]

  return collections
}

function toMenuPath(url: string | null | undefined, type: string, storeDomain: string): string {
  if (!url) return '/'

  const storeHost = new URL(ensureStartsWith(storeDomain, 'https://')).hostname
    .replace(/^www\./i, '')
    .toLowerCase()
  const absolute = /^https?:\/\//i.test(url)
  const parsed = new URL(url, 'https://store.local')
  const urlHost = parsed.hostname.replace(/^www\./i, '').toLowerCase()

  if (absolute && type === 'HTTP' && urlHost !== storeHost) return url

  let pathname = parsed.pathname
  if (pathname === '/collections' || pathname.startsWith('/collections/')) {
    pathname = pathname.replace(/^\/collections/, '/shop')
  } else if (pathname === '/pages' || pathname.startsWith('/pages/')) {
    pathname = pathname.replace(/^\/pages/, '') || '/'
  }

  return `${pathname}${parsed.search}${parsed.hash}`
}

export async function getMenu(handle: string): Promise<Menu[]> {
  const storeDomain = getPublicStoreDomain()
  const data = await shopifyQuery(getMenuQuery, {
    tags: [TAGS.collections],
    variables: {
      handle,
    },
  })

  return (
    data?.menu?.items.map((item) => ({
      path: toMenuPath(item.url, item.type, storeDomain),
      title: item.title,
    })) || []
  )
}

export async function getPage(handle: string): Promise<Page> {
  const data = await shopifyQuery(getPageQuery, {
    tags: [TAGS.pages],
    variables: { handle },
  })

  return data!.page as Page
}

export async function getPages(): Promise<Page[]> {
  const data = await shopifyQuery(getPagesQuery, {
    tags: [TAGS.pages],
  })

  return removeEdgesAndNodes(data!.pages as Connection<Page>)
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  const data = await shopifyQuery(getProductQuery, {
    tags: [TAGS.products],
    variables: {
      handle,
      identifiers: PRODUCT_DETAIL_METAFIELD_IDENTIFIERS,
    },
  })

  return reshapeProduct(asShopifyProduct(data?.product), false)
}

export async function getProductRecommendations(productId: string): Promise<Product[]> {
  const data = await shopifyQuery(getProductRecommendationsQuery, {
    tags: [TAGS.products],
    variables: {
      productId,
    },
  })

  return reshapeProducts(asShopifyProducts(data?.productRecommendations ?? []))
}

const PRODUCTS_PAGE_SIZE = 250
const MAX_PRODUCT_PAGES = 20

export async function getProducts({
  query,
  reverse,
  sortKey,
  tags = [TAGS.products],
}: {
  query?: string
  reverse?: boolean
  sortKey?: string
  tags?: string[]
}): Promise<Product[]> {
  const nodes: ShopifyProduct[] = []
  let after: string | undefined

  for (let page = 0; page < MAX_PRODUCT_PAGES; page++) {
    const data = await shopifyQuery(getProductsQuery, {
      tags,
      variables: {
        after,
        query,
        reverse,
        sortKey,
      },
    })

    const connection = data!.products as Connection<unknown>
    nodes.push(...asShopifyProducts(removeEdgesAndNodes(connection)))

    if (!connection.pageInfo?.hasNextPage || !connection.pageInfo.endCursor) {
      break
    }

    after = connection.pageInfo.endCursor

    if (connection.edges.length < PRODUCTS_PAGE_SIZE) {
      break
    }
  }

  return reshapeProducts(nodes)
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  // We always need to respond with a 200 status code to Shopify,
  // otherwise it will continue to retry the request.
  const collectionWebhooks = ['collections/create', 'collections/delete', 'collections/update']
  const pageWebhooks = ['pages/create', 'pages/delete', 'pages/update']
  const productWebhooks = ['products/create', 'products/delete', 'products/update']
  const topic = (await headers()).get('x-shopify-topic') || 'unknown'
  const secret = req.nextUrl.searchParams.get('secret')
  const isCollectionUpdate = collectionWebhooks.includes(topic)
  const isPageUpdate = pageWebhooks.includes(topic)
  const isProductUpdate = productWebhooks.includes(topic)

  if (!secret || secret !== process.env.SHOPIFY_REVALIDATION_SECRET) {
    console.error('Invalid revalidation secret.')
    return NextResponse.json({ status: 200 })
  }

  if (!isCollectionUpdate && !isPageUpdate && !isProductUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 })
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections, 'max')
  }

  if (isPageUpdate) {
    revalidateTag(TAGS.pages, 'max')
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products, 'max')
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() })
}
