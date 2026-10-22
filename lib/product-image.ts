import type { Image } from './shopify/types'

export const PRODUCT_IMAGE_PLACEHOLDER: Image = {
  altText: 'Product image unavailable',
  height: 480,
  url: '/product-placeholder.png',
  width: 480,
}

export function resolveProductImage(
  image?: Image | null,
  fallbacks: Array<Image | null | undefined> = [],
  altText?: string,
): Image {
  if (image?.url) {
    return image
  }

  for (const fallback of fallbacks) {
    if (fallback?.url) {
      return fallback
    }
  }

  return altText
    ? { ...PRODUCT_IMAGE_PLACEHOLDER, altText }
    : PRODUCT_IMAGE_PLACEHOLDER
}

export function resolveProductImages(
  images: Array<Image | null | undefined> = [],
  altText?: string,
): Image[] {
  const resolved = images.filter((image): image is Image => Boolean(image?.url))
  return resolved.length > 0 ? resolved : [resolveProductImage(undefined, [], altText)]
}
