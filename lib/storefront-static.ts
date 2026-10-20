import 'server-only'

import { createShopifyRequestContext, createStorefrontClient } from '@shopify/hydrogen'

import {
  getPrivateStorefrontApiToken,
  getPublicStoreDomain,
  getPublicStorefrontApiToken,
  getPublicStorefrontId,
} from './env'

const DEFAULT_I18N = { country: 'US', language: 'EN' } as const

const requestContext = createShopifyRequestContext({
  i18n: DEFAULT_I18N,
  request: { headers: new Headers() },
})

function createStaticStorefrontClient() {
  const storeDomain = getPublicStoreDomain()
  const storefrontId = getPublicStorefrontId()
  const privateToken = getPrivateStorefrontApiToken()

  if (privateToken) {
    return createStorefrontClient({
      type: 'private_no_buyer_context',
      requestContext,
      config: {
        privateStorefrontToken: privateToken,
        storeDomain,
        storefrontId,
      },
    })
  }

  return createStorefrontClient({
    type: 'public',
    requestContext,
    config: {
      publicStorefrontToken: getPublicStorefrontApiToken(),
      storeDomain,
      storefrontId,
    },
  })
}

export const staticStorefrontClient = createStaticStorefrontClient()
