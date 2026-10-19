import { ReadonlyURLSearchParams } from 'next/navigation'
import { Product } from './shopify/types'

export const createUrl = (pathname: string, params: URLSearchParams | ReadonlyURLSearchParams) => {
  const paramsString = params.toString()
  const queryString = `${paramsString.length ? '?' : ''}${paramsString}`

  return `${pathname}${queryString}`
}

export const ensureStartsWith = (stringToCheck: string, startsWith: string) =>
  stringToCheck.startsWith(startsWith) ? stringToCheck : `${startsWith}${stringToCheck}`

export function sortProductsByAvailability(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    if (a.availableForSale && !b.availableForSale) return -1
    if (!a.availableForSale && b.availableForSale) return 1
    return 0
  })
}
