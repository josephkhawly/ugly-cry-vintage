import { gql } from '@shopify/hydrogen'

const shopPolicyFragment = gql(`
  fragment shopPolicy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
`)

const shopPolicyWithDefaultFragment = gql(`
  fragment shopPolicyWithDefault on ShopPolicyWithDefault {
    body
    handle
    id
    title
    url
  }
`)

export const getShopPoliciesQuery = gql(
  `
  query getShopPolicies {
    shop {
      contactInformation {
        ...shopPolicy
      }
      legalNotice {
        ...shopPolicy
      }
      privacyPolicy {
        ...shopPolicy
      }
      refundPolicy {
        ...shopPolicy
      }
      shippingPolicy {
        ...shopPolicy
      }
      subscriptionPolicy {
        ...shopPolicyWithDefault
      }
      termsOfSale {
        ...shopPolicy
      }
      termsOfService {
        ...shopPolicy
      }
    }
  }
`,
  [shopPolicyFragment, shopPolicyWithDefaultFragment],
)
