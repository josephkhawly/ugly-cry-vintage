import { createShopifyRouteTemplates } from '@shopify/hydrogen'

export const routeTemplates = createShopifyRouteTemplates({
  product: '/product/:productHandle',
  productInCollection: '/product/:productHandle',
  collection: '/shop/:collectionHandle',
  collectionList: '/shop',
  page: '/:pageHandle',
})
