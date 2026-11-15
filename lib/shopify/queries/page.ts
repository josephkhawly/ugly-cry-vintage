import { gql } from '@shopify/hydrogen'

import { seoFragment } from '../fragments/seo'

const pageFragment = gql(
  `
  fragment page on Page {
    id
    title
    handle
    body
    bodySummary
    seo {
      ...seo
    }
    createdAt
    updatedAt
  }
`,
  [seoFragment],
)

export const getPageQuery = gql(
  `
  query getPage($handle: String!) {
    page(handle: $handle) {
      ...page
    }
  }
`,
  [pageFragment],
)
