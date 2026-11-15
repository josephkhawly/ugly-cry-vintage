import { gql } from '@shopify/hydrogen'

import { productFragment } from '../fragments/product'

export const getProductQuery = gql(
  `
  query getProduct($handle: String!, $identifiers: [HasMetafieldsIdentifier!]!) {
    product(handle: $handle) {
      ...product
      metafields(identifiers: $identifiers) {
        key
        value
      }
    }
  }
`,
  [productFragment],
)

export const getProductsQuery = gql(
  `
  query getProducts(
    $after: String
    $query: String
    $reverse: Boolean
    $sortKey: ProductSortKeys
  ) {
    products(after: $after, first: 250, query: $query, reverse: $reverse, sortKey: $sortKey) {
      edges {
        node {
          ...product
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`,
  [productFragment],
)
