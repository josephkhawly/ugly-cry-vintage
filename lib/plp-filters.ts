import type { ProductColor } from '@/lib/shopify/category-attributes'
import type { Product } from '@/lib/shopify/types'

export const ERA_ORDER = ['40s', '50s', '60s', '70s', '80s', '90s', '00s'] as const

export type Era = (typeof ERA_ORDER)[number]

export type PlpFilters = {
  color: string[]
  era: string[]
  size: string[]
  type: string[]
}

export type PlpFacets = {
  colors: ProductColor[]
  eras: Era[]
  sizes: string[]
  types: string[]
}

const ERA_PATTERN = /\b(y2k|00s|40s|50s|60s|70s|80s|90s)\b/gi

const EMPTY_FACETS: PlpFacets = {
  colors: [],
  eras: [],
  sizes: [],
  types: [],
}

export function paramList(value: string | string[] | undefined): string[] {
  if (!value) return []
  const values = Array.isArray(value) ? value : [value]
  return values.map((entry) => entry.trim()).filter(Boolean)
}

export function parsePlpFilters(searchParams: {
  [key: string]: string | string[] | undefined
}): PlpFilters {
  return {
    color: paramList(searchParams.color),
    era: paramList(searchParams.era),
    size: paramList(searchParams.size),
    type: paramList(searchParams.type),
  }
}

export function productEras(product: Product): Era[] {
  const haystack = `${product.title} ${product.handle} ${product.tags.join(' ')}`
  const found = new Set<Era>()

  for (const match of haystack.matchAll(ERA_PATTERN)) {
    const raw = match[1].toLowerCase()
    found.add(raw === 'y2k' ? '00s' : (raw as Era))
  }

  return ERA_ORDER.filter((era) => found.has(era))
}

export function getFilterFacets(products: Product[]): PlpFacets {
  const colors = new Map<string, ProductColor>()
  const eras = new Set<Era>()
  const sizes = new Set<string>()
  const types = new Set<string>()

  for (const product of products) {
    for (const color of product.colors) {
      const existing = colors.get(color.label)
      if (!existing) colors.set(color.label, color)
      else if (!existing.hex && color.hex) colors.set(color.label, color)
    }
    for (const size of product.sizes) sizes.add(size)
    if (product.productType) types.add(product.productType)
    for (const era of productEras(product)) eras.add(era)
  }

  return {
    colors: [...colors.values()].sort((a, b) => a.label.localeCompare(b.label)),
    eras: ERA_ORDER.filter((era) => eras.has(era)),
    sizes: [...sizes].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    types: [...types].sort((a, b) => a.localeCompare(b)),
  }
}

export function emptyFacets(): PlpFacets {
  return EMPTY_FACETS
}

/** Size/color aren't in the products search index — apply after the Storefront query. */
export function filterProductsBySizeColor(products: Product[], filters: PlpFilters): Product[] {
  return products.filter((product) => {
    if (filters.size.length > 0 && !filters.size.some((size) => product.sizes.includes(size))) {
      return false
    }
    if (
      filters.color.length > 0 &&
      !filters.color.some((color) => product.colors.some((entry) => entry.label === color))
    ) {
      return false
    }
    return true
  })
}

export function hasActiveFilters(filters: PlpFilters): boolean {
  return (
    filters.color.length > 0 ||
    filters.era.length > 0 ||
    filters.size.length > 0 ||
    filters.type.length > 0
  )
}

function quoteQueryValue(value: string) {
  return /[\s:]/.test(value) ? `"${value.replaceAll('"', '\\"')}"` : value
}

/** Facet labels normalize `y2k` → `00s`; search must still match the original tag. */
function eraQueryTerms(era: string): string[] {
  return era === '00s' ? ['00s', 'y2k'] : [era]
}

export function shopifyGidToId(gid: string): string {
  return gid.slice(gid.lastIndexOf('/') + 1)
}

/**
 * Storefront `products(query:)` search string.
 * Type + era run server-side; size/color need a post-filter (or Search & Discovery filters).
 */
export function toStorefrontQuery(filters: PlpFilters, collectionId?: string): string | undefined {
  const clauses: string[] = []

  if (collectionId) clauses.push(`collection_id:${collectionId}`)

  if (filters.type.length > 0) {
    clauses.push(
      `(${filters.type.map((type) => `product_type:${quoteQueryValue(type)}`).join(' OR ')})`,
    )
  }

  if (filters.era.length > 0) {
    const eraClause = filters.era
      .flatMap((era) => eraQueryTerms(era))
      .flatMap((term) => [`tag:${quoteQueryValue(term)}`, `title:${term}*`])
      .join(' OR ')
    clauses.push(`(${eraClause})`)
  }

  return clauses.length > 0 ? clauses.join(' AND ') : undefined
}
