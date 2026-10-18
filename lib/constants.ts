export type SortFilterItem = {
  reverse: boolean
  slug: string | null
  sortKey: 'CREATED_AT' | 'PRICE'
  title: string
}

export const defaultSort: SortFilterItem = {
  reverse: true,
  slug: 'latest-desc',
  sortKey: 'CREATED_AT',
  title: 'Newest',
}

export const sorting: SortFilterItem[] = [
  defaultSort,
  { reverse: false, slug: 'oldest-asc', sortKey: 'CREATED_AT', title: 'Oldest' },
  { reverse: false, slug: 'price-asc', sortKey: 'PRICE', title: 'Price: Low to high' },
  { reverse: true, slug: 'price-desc', sortKey: 'PRICE', title: 'Price: High to low' },
]

export const TAGS = {
  collections: 'collections',
  products: 'products',
}

export const HIDDEN_PRODUCT_TAG = 'nextjs-frontend-hidden'
export const DEFAULT_OPTION = 'Default Title'
