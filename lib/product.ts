import { createProductComponents } from '@shopify/hydrogen/react'

import { resolveProductImage } from '@/lib/product-image'
import type { Image, Product, ProductVariant } from '@/lib/shopify/types'

export interface AddToCartProduct {
  adjacentVariants: AddToCartProductVariant[]
  handle: string
  id: string
  options: AddToCartProductOption[]
  selectedOrFirstAvailableVariant: AddToCartProductVariant | null
  title: string
}

interface AddToCartProductOption {
  name: string
  optionValues: AddToCartProductOptionValue[]
}

interface AddToCartProductOptionValue {
  firstSelectableVariant: AddToCartProductVariant
  name: string
}

interface AddToCartProductVariant {
  availableForSale: boolean
  id: string
  image?: Image
  price: ProductVariant['price']
  product: {
    handle: string
    title: string
  }
  selectedOptions: ProductVariant['selectedOptions']
  title: string
}

export function toAddToCartProduct(product: Product): AddToCartProduct {
  const variant = product.variants[0]
  if (!variant) {
    return {
      adjacentVariants: [],
      handle: product.handle,
      id: product.id,
      options: [],
      selectedOrFirstAvailableVariant: null,
      title: product.title,
    }
  }

  const selectedVariant: AddToCartProductVariant = {
    availableForSale: variant.availableForSale,
    id: variant.id,
    image: resolveProductImage(product.featuredImage, product.images, product.title),
    price: variant.price,
    product: {
      handle: product.handle,
      title: product.title,
    },
    selectedOptions: variant.selectedOptions,
    title: variant.title,
  }

  const options: AddToCartProductOption[] =
    variant.selectedOptions.length > 0
      ? variant.selectedOptions.map((option) => ({
          name: option.name,
          optionValues: [
            {
              firstSelectableVariant: selectedVariant,
              name: option.value,
            },
          ],
        }))
      : [
          {
            name: 'Title',
            optionValues: [
              {
                firstSelectableVariant: selectedVariant,
                name: 'Default Title',
              },
            ],
          },
        ]

  return {
    adjacentVariants: [selectedVariant],
    handle: product.handle,
    id: product.id,
    options,
    selectedOrFirstAvailableVariant: selectedVariant,
    title: product.title,
  }
}

export const { ProductProvider, useProductForm } = createProductComponents<AddToCartProduct>()
