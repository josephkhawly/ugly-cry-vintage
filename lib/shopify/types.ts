import type { ProductColor, ShopifyCategoryMetafield } from './category-attributes'

export type Connection<T> = {
  edges: Array<Edge<T>>
  pageInfo?: {
    endCursor: string | null
    hasNextPage: boolean
  }
}

export type Edge<T> = {
  node: T
}

export type Collection = ShopifyCollection & {
  path: string
}

export type Image = {
  url: string
  altText: string
  width: number
  height: number
}

export type Menu = {
  title: string
  path: string
}

export type Money = {
  amount: string
  currencyCode: string
}

export type Page = {
  id: string
  title: string
  handle: string
  body: string
  bodySummary: string
  seo?: SEO
  createdAt: string
  updatedAt: string
}

export type Product = Omit<
  ShopifyProduct,
  'color' | 'images' | 'media' | 'metafields' | 'size' | 'variants'
> & {
  colors: ProductColor[]
  details: ProductDetail[]
  images: Image[]
  sizes: string[]
  variants: ProductVariant[]
}

export type ProductDetail = {
  key: string
  title: string
  value: string
}

export type ShopifyMetafield = {
  key: string
  value: string
}

export type ProductOption = {
  id: string
  name: string
  values: string[]
}

export type ProductVariant = {
  id: string
  title: string
  availableForSale: boolean
  selectedOptions: {
    name: string
    value: string
  }[]
  price: Money
}

export type SEO = {
  title: string
  description: string
}

export type ShopifyCollection = {
  description: string
  handle: string
  id: string
  seo: SEO
  title: string
  updatedAt: string
}

export type ShopifyMedia = {
  alt: string
  image: Image
}

export type ShopifyProduct = {
  id: string
  handle: string
  availableForSale: boolean
  title: string
  description: string
  descriptionHtml: string
  color?: ShopifyCategoryMetafield
  metafields?: (ShopifyMetafield | null)[]
  options?: ProductOption[]
  priceRange: {
    maxVariantPrice: Money
    minVariantPrice: Money
  }
  productType: string
  size?: ShopifyCategoryMetafield
  variants: Connection<ProductVariant>
  featuredImage: Image
  images?: Connection<Image>
  media: Connection<ShopifyMedia>
  seo: SEO
  tags: string[]
  updatedAt: string
}
