import { Product } from './shopify/types'

export const ensureStartsWith = (stringToCheck: string, startsWith: string) =>
  stringToCheck.startsWith(startsWith) ? stringToCheck : `${startsWith}${stringToCheck}`

export function sortProductsByAvailability(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    if (a.availableForSale && !b.availableForSale) return -1
    if (!a.availableForSale && b.availableForSale) return 1
    return 0
  })
}
